import { POST } from '@/app/api/sales-inquiry/route';
import { createSalesInquiryRecord } from '@/app/lib/supabase-store';

jest.mock('@/app/lib/supabase-store', () => ({ createSalesInquiryRecord: jest.fn() }));

// No database or email request leaves this test process.
describe('production inquiry capture preservation', () => {
  const fetchMock = jest.fn().mockResolvedValue({ ok: true });
  beforeEach(() => {
    jest.mocked(createSalesInquiryRecord).mockReset();
    jest.mocked(createSalesInquiryRecord).mockResolvedValue({ id: 1 } as Awaited<ReturnType<typeof createSalesInquiryRecord>>);
    global.fetch = fetchMock;
    fetchMock.mockClear();
  });
  it('retains form attribution and initializes the owner follow-up pipeline', async () => {
    const form = { landingPage: '/book', ctaSource: 'synthetic', utm: { source: 'test' } };
    const response = await POST(new Request('http://localhost/api/sales-inquiry', { method: 'POST', body: JSON.stringify({ name: 'Synthetic QA', email: 'qa@example.test', payload: form }) }));
    expect(response.status).toBe(200);
    expect(createSalesInquiryRecord).toHaveBeenCalledWith(expect.objectContaining({
      payload: expect.objectContaining({ form, pipeline: expect.objectContaining({ stage: 'new', nextAction: 'Review inquiry and reply by email' }) }),
    }));
  });
  it('rejects incomplete requests before accessing the database', async () => {
    const response = await POST(new Request('http://localhost/api/sales-inquiry', { method: 'POST', body: '{}' }));
    expect(response.status).toBe(400);
    expect(createSalesInquiryRecord).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
