import { createHmac } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { PARTNER_CONSENT_VERSION, PartnerInquiryError, type PartnerInquiry } from './partner-inquiry';

let pool: Pool | undefined;

function configuration() {
  const url = process.env.PARTNER_INQUIRY_DATABASE_URL;
  const secret = process.env.PARTNER_INQUIRY_HASH_SECRET;
  if (process.env.PARTNER_INQUIRY_ENABLED !== 'true' || !url || !secret || secret.length < 32) {
    throw new PartnerInquiryError('Online partnership inquiries are temporarily unavailable. Please try again later.', 503);
  }
  return { url, secret };
}

function database() {
  const { url } = configuration();
  if (!pool) {
    pool = new Pool({ connectionString: url, max: 2, connectionTimeoutMillis: 3000, query_timeout: 5000, idleTimeoutMillis: 10000, allowExitOnIdle: true });
    pool.on('error', () => console.warn('Partner inquiry database unavailable.'));
  }
  return pool;
}

async function consumeRate(client: PoolClient, bucket: string, limit: number) {
  const result = await client.query(`INSERT INTO ofroot_partner_inquiry_limits (bucket, window_start, request_count)
    VALUES ($1, NOW(), 1) ON CONFLICT (bucket) DO UPDATE SET
    request_count=CASE WHEN ofroot_partner_inquiry_limits.window_start <= NOW()-INTERVAL '1 hour' THEN 1 ELSE ofroot_partner_inquiry_limits.request_count+1 END,
    window_start=CASE WHEN ofroot_partner_inquiry_limits.window_start <= NOW()-INTERVAL '1 hour' THEN NOW() ELSE ofroot_partner_inquiry_limits.window_start END
    RETURNING request_count`, [bucket]);
  if (result.rows[0].request_count > limit) throw new PartnerInquiryError('Too many requests. Please try again in an hour.', 429);
}

/** No schema changes, external CRM calls or mail sends happen at runtime.
 * A receipt, owner-review record and unsent notification drafts commit together.
 * Only an identical retry reuses a record; contacts/companies are never merged. */
export async function savePartnerInquiry(input: PartnerInquiry, address: string): Promise<{ requestId: string }> {
  const { secret } = configuration();
  const hash = (purpose: string, value: string) => createHmac('sha256', secret).update(`${purpose}:${value}`).digest('hex');
  const { requestId, ...content } = input;
  const fingerprint = hash('payload', JSON.stringify(content));
  const client = await database().connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '3s'");
    // One bounded, low-volume intake lock makes retries and shared rate budgets
    // atomic across server instances, including submissions racing each other.
    await client.query('SELECT pg_advisory_xact_lock($1)', [741908350]);
    const previous = await client.query('SELECT payload_hash FROM ofroot_partner_inquiry_receipts WHERE request_id=$1', [requestId]);
    if (previous.rows.length) {
      if (previous.rows[0].payload_hash !== fingerprint) throw new PartnerInquiryError('This request changed. Please submit it again with a new reference.', 409);
      await client.query('COMMIT');
      return { requestId };
    }
    await consumeRate(client, 'global', 100);
    await consumeRate(client, `network:${hash('network', address)}`, 20);
    await consumeRate(client, `email:${hash('email', input.email)}`, 5);
    const capturedAt = new Date().toISOString();
    const result = await client.query(`INSERT INTO ofroot_sales_inquiries (name,email,business_name,payload)
      VALUES ($1,$2,$3,$4::jsonb) RETURNING id`, [input.name, input.email, input.company, JSON.stringify({
      message: input.description,
      form: { form_type: 'engineering_partnership', partnerType: input.partnerType, need: input.need, timeframe: input.timeframe, budget: input.budget, landingPage: '/partners/staffing', utm: input.attribution },
      consent: { version: PARTNER_CONSENT_VERSION, acknowledged: true, capturedAt, purpose: 'review_and_respond_to_inquiry', marketingOptIn: false },
      pipeline: { stage: 'new', owner: 'founder', nextAction: 'Review engineering fit and approve response', nextActionAt: capturedAt, updatedAt: capturedAt },
      statusHistory: [{ stage: 'new', at: capturedAt, actor: 'partner_intake' }],
      requestId,
      // TODO(founder): approve recipient, sender, privacy text and templates.
      // These are drafts, not a delivery queue. Nothing sends automatically.
      notifications: { status: 'approval_required', founder: { subject: 'Engineering partnership inquiry', body: `Review request ${requestId} in the owner pipeline.` }, acknowledgement: { subject: 'OfRoot received your engineering inquiry', body: `We received request ${requestId}. It is awaiting a fit review. This receipt does not confirm availability, scope, pricing or a start date.` } },
    })]);
    await client.query('INSERT INTO ofroot_partner_inquiry_receipts (request_id,payload_hash,inquiry_id) VALUES ($1,$2,$3)', [requestId, fingerprint, result.rows[0].id]);
    await client.query("DELETE FROM ofroot_partner_inquiry_limits WHERE window_start < NOW()-INTERVAL '2 days'");
    await client.query('COMMIT');
    return { requestId };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally { client.release(); }
}
