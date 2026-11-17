import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { savePartnerInquiry } from '@/app/lib/partner-inquiry-store';
import { partnerInquirySchema } from '@/app/lib/partner-inquiry';
import { updateSalesInquiryPipeline } from '@/app/lib/supabase-store';

const testUrl = process.env.TEST_PARTNER_DATABASE_URL;
const integration = testUrl ? describe : describe.skip;

integration('isolated PostgreSQL partner intake', () => {
  let database: Pool;
  const input = (email = `${randomUUID()}@example.test`) => partnerInquirySchema.parse({ requestId: randomUUID(), name: 'Synthetic QA', email, company: 'Synthetic Staffing', partnerType: 'staffing', need: 'embedded', description: 'Test an application integration with synthetic records.', timeframe: 'planning', consent: true, attribution: {} });

  beforeAll(async () => {
    const url = new URL(testUrl!);
    if (url.hostname !== '127.0.0.1' || url.pathname !== '/ofroot_partner_test') throw new Error('Integration checks require the dedicated loopback test database.');
    process.env.PARTNER_INQUIRY_ENABLED = 'true';
    process.env.PARTNER_INQUIRY_DATABASE_URL = testUrl;
    process.env.PARTNER_INQUIRY_HASH_SECRET = 'synthetic-local-test-secret-at-least-32-characters';
    database = new Pool({ connectionString: testUrl, max: 1 });
    const schema = await database.query("SELECT to_regclass('ofroot_partner_inquiry_receipts') AS receipts, to_regclass('ofroot_partner_inquiry_limits') AS limits");
    expect(schema.rows[0].receipts).toBeTruthy(); expect(schema.rows[0].limits).toBeTruthy();
  });
  afterAll(async () => { await database?.end(); });

  it('commits one owner record, consent/history and unsent notification drafts', async () => {
    const draft = input();
    expect(await savePartnerInquiry(draft, 'synthetic-one')).toEqual({ requestId: draft.requestId });
    const result = await database.query(`SELECT i.* FROM ofroot_sales_inquiries i JOIN ofroot_partner_inquiry_receipts r ON r.inquiry_id=i.id WHERE r.request_id=$1`, [draft.requestId]);
    expect(result.rows).toHaveLength(1);
    const record = result.rows[0];
    expect(record.email).toBe(draft.email);
    expect(record.payload.pipeline.stage).toBe('new');
    expect(record.payload.consent.marketingOptIn).toBe(false);
    expect(record.payload.statusHistory).toHaveLength(1);
    expect(record.payload.notifications.status).toBe('approval_required');
  });

  it('deduplicates concurrent retries without merging a separate request from the same contact', async () => {
    const draft = input();
    const receipts = await Promise.all([savePartnerInquiry(draft, 'synthetic-concurrent'), savePartnerInquiry(draft, 'synthetic-concurrent')]);
    expect(receipts[0]).toEqual(receipts[1]);
    await savePartnerInquiry({ ...draft, requestId: randomUUID() }, 'synthetic-concurrent');
    const result = await database.query('SELECT id FROM ofroot_sales_inquiries WHERE email=$1', [draft.email]);
    expect(result.rows).toHaveLength(2);
  });

  it('rejects changed data under an existing reference and leaves the original intact', async () => {
    const draft = input(); await savePartnerInquiry(draft, 'synthetic-change');
    await expect(savePartnerInquiry({ ...draft, company: 'Changed company' }, 'synthetic-change')).rejects.toMatchObject({ status: 409 });
    const result = await database.query('SELECT business_name FROM ofroot_sales_inquiries WHERE email=$1', [draft.email]);
    expect(result.rows).toEqual([{ business_name: 'Synthetic Staffing' }]);
  });

  it('enforces the shared email rate budget without creating the sixth lead', async () => {
    const email = `${randomUUID()}@example.test`;
    for (let index = 0; index < 5; index++) await savePartnerInquiry(input(email), `synthetic-rate-${index}`);
    await expect(savePartnerInquiry(input(email), 'synthetic-sixth')).rejects.toMatchObject({ status: 429 });
    expect((await database.query('SELECT id FROM ofroot_sales_inquiries WHERE email=$1', [email])).rows).toHaveLength(5);
  });

  it('fails closed when live intake is disabled', async () => {
    process.env.PARTNER_INQUIRY_ENABLED = 'false';
    await expect(savePartnerInquiry(input(), 'synthetic-disabled')).rejects.toMatchObject({ status: 503 });
    process.env.PARTNER_INQUIRY_ENABLED = 'true';
  });

  it('keeps the assigned owner and consent when the owner queue updates a request', async () => {
    const draft = input();
    await savePartnerInquiry(draft, 'synthetic-owner-edit');
    const { rows } = await database.query('SELECT inquiry_id FROM ofroot_partner_inquiry_receipts WHERE request_id=$1', [draft.requestId]);
    // Use the real updater against only this already-migrated fixture. Bypass
    // unrelated legacy startup migrations and restore its globals afterward.
    const previous = { pool: global.__ofrootDbPool, ready: global.__ofrootDbReadyPromise, url: process.env.DATABASE_URL };
    try {
      global.__ofrootDbPool = database;
      global.__ofrootDbReadyPromise = Promise.resolve();
      process.env.DATABASE_URL = testUrl;
      const updated = await updateSalesInquiryPipeline(Number(rows[0].inquiry_id), { stage: 'contacted', next_action: 'Synthetic reviewed fit check' });
      expect(updated?.payload.pipeline).toMatchObject({ owner: 'founder', stage: 'contacted', nextAction: 'Synthetic reviewed fit check' });
      expect(updated?.payload.consent).toMatchObject({ marketingOptIn: false });
      expect(updated?.payload.requestId).toBe(draft.requestId);
      await database.query("UPDATE ofroot_sales_inquiries SET payload=jsonb_set(payload,'{pipeline}','null'::jsonb) WHERE id=$1", [rows[0].inquiry_id]);
      const legacy = await updateSalesInquiryPipeline(Number(rows[0].inquiry_id), { stage: 'new' });
      expect(legacy?.payload.pipeline).toMatchObject({ stage: 'new' });
    } finally {
      global.__ofrootDbPool = previous.pool;
      global.__ofrootDbReadyPromise = previous.ready;
      if (previous.url === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = previous.url;
    }
  });
});
