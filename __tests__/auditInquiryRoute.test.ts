import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const createSalesInquiryRecord = jest.fn<(input: unknown) => Promise<{ id: number }>>();

jest.mock('../app/lib/supabase-store', () => ({
  createSalesInquiryRecord,
}));

import { POST } from '../app/api/audit-inquiry/route';

function request(body: unknown) {
  return new Request('http://localhost/api/audit-inquiry', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('audit inquiry capture', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects incomplete submissions before persistence', async () => {
    const response = await POST(request({ name: 'Alex', email: 'alex@example.com' }));

    expect(response.status).toBe(400);
    expect(createSalesInquiryRecord).not.toHaveBeenCalled();
  });

  it('persists the inquiry without emitting submitted PII to logs', async () => {
    createSalesInquiryRecord.mockResolvedValueOnce({ id: 42 });
    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const consoleInfo = jest.spyOn(console, 'info').mockImplementation(() => undefined);

    const response = await POST(request({
      name: '  Alex Rivera  ',
      email: '  ALEX@EXAMPLE.COM ',
      website: ' https://example.com ',
      ads_account: ' 123-456-7890 ',
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(createSalesInquiryRecord).toHaveBeenCalledWith({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      business_name: null,
      business_formation_status: null,
      llc_upsell_opportunity: false,
      payload: {
        message: 'AI audit request',
        form: {
          ctaSource: 'subscribe-audit-modal',
          website: 'https://example.com',
          adsAccount: '123-456-7890',
        },
      },
    });
    expect(consoleLog).not.toHaveBeenCalled();
    expect(consoleInfo).not.toHaveBeenCalled();

    consoleLog.mockRestore();
    consoleInfo.mockRestore();
  });

  it('fails closed with a generic response when persistence fails', async () => {
    createSalesInquiryRecord.mockRejectedValueOnce(new Error('database secret detail'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = await POST(request({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      website: 'https://example.com',
    }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'Unable to save audit request' });
    expect(consoleError).toHaveBeenCalledWith('[audit-inquiry] capture failed', { reason: 'persistence_error' });
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain('database secret detail');

    consoleError.mockRestore();
  });
});
