import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Import server actions as plain functions
import * as actions from '../app/dashboard/billing/actions';

// Mock token cookies
jest.mock('next/headers', () => ({ cookies: async () => ({ get: () => ({ value: 'fake-token' }) }) }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

// Mock API client used by actions
jest.mock('../app/lib/api', () => {
  return {
    api: {
      adminCreateInvoice: jest.fn(async (input: any) => ({ data: { id: 123, ...input } })),
      adminUpdateInvoice: jest.fn(async () => ({ data: {} })),
      adminRecordPayment: jest.fn(async () => ({ data: {} })),
      adminSendInvoice: jest.fn(async () => ({ data: {} })),
    },
  };
});

describe('billing actions smoke', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createInvoiceAction sanitizes and succeeds', async () => {
    const res = await actions.createInvoiceAction({
      currency: 'usd',
      items: [
        { description: 'Work', unit_amount_cents: 1000, quantity: 2 },
        { description: '  ', unit_amount_cents: 500 },
      ],
      meta: { note: 'hello' },
    });
    expect(res.ok).toBe(true);
  expect('id' in res && typeof (res as any).id === 'number').toBe(true);
  });

  it('recordPaymentAction accepts provider/reference/status', async () => {
    const res = await actions.recordPaymentAction(42, 12.34, { provider: 'stripe', reference: 'ch_123', status: 'succeeded' });
    expect(res.ok).toBe(true);
  });

  it('updateInvoiceStatusAction updates status', async () => {
    const res = await actions.updateInvoiceStatusAction(42, 'sent');
    expect(res.ok).toBe(true);
  });

  it('sendInvoiceAction works', async () => {
    const res = await actions.sendInvoiceAction(42);
    expect(res.ok).toBe(true);
  });
});
