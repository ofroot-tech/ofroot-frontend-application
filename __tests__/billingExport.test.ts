import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Import the route handler as a module
import * as route from '../app/dashboard/billing/export/route';

// Mock cookies and API
jest.mock('next/headers', () => ({ cookies: async () => ({ get: () => ({ value: 'fake-token' }) }) }));

const pages = [
  { data: [
    { id: 1, number: 'INV-1', status: 'draft', currency: 'USD', amount_cents: 1000, amount_due_cents: 1000, created_at: '2025-01-01T00:00:00Z', due_date: '2025-01-10T00:00:00Z', external_id: null },
  ], meta: { current_page: 1, per_page: 100, last_page: 2, total: 2 } },
  { data: [
    { id: 2, number: 'INV-2', status: 'paid', currency: 'USD', amount_cents: 2500, amount_due_cents: 0, created_at: '2025-01-02T00:00:00Z', due_date: null, external_id: 'ext-2' },
  ], meta: { current_page: 2, per_page: 100, last_page: 2, total: 2 } },
];

jest.mock('../app/lib/api', () => {
  return {
    api: {
      adminListInvoices: jest.fn(async (_token: string, opts: any) => {
        const idx = Math.max(0, Math.min((opts?.page ?? 1) - 1, pages.length - 1));
        return pages[idx];
      }),
    },
  };
});

function makeReq(url: string) {
  return new Request(url);
}

describe('billing export route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('streams CSV with headers and two rows', async () => {
    const res = await route.GET(makeReq('http://x/dashboard/billing/export'));
    expect(res.status).toBe(200);
    const text = await res.text();
    const lines = text.trim().split('\n');
    expect(lines[0]).toContain('id,number,status,currency,amount,amount_due,due_date,created_at,external_id');
    expect(lines.length).toBe(3);
  });

  it('applies status filter', async () => {
    const res = await route.GET(makeReq('http://x/dashboard/billing/export?status=paid'));
    const text = await res.text();
    const lines = text.trim().split('\n');
    // header + only the paid row
    expect(lines.length).toBe(2);
    expect(lines[1]).toContain('INV-2');
  });
});
