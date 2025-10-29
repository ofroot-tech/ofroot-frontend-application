import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { saveInvoiceItemsAction } from '../app/dashboard/billing/actions';

// Mocks
jest.mock('next/headers', () => ({ cookies: async () => ({ get: () => ({ value: 'fake-token' }) }) }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

jest.mock('../app/lib/api', () => {
  return {
    api: {
      adminGetInvoice: jest.fn(async () => ({ data: { meta: { existing: true } } })),
      adminUpdateInvoice: jest.fn(async (_id: number, input: any) => ({ data: { meta: input.meta } })),
    },
  };
});

describe('saveInvoiceItemsAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeForm(items: any[], extras?: { tax?: string; discount?: string }) {
    const fd = new FormData();
    fd.set('items', JSON.stringify(items));
    if (extras?.tax) fd.set('tax_percent', extras.tax);
    if (extras?.discount) fd.set('discount_cents', extras.discount);
    return fd;
  }

  it('stores cleaned items and totals into meta', async () => {
    const fd = makeForm([
      { description: 'A', quantity: 1, unit_amount_cents: 1000 },
      { description: ' ', quantity: 2, unit_amount_cents: 500 },
    ], { tax: '10', discount: '123' });
    const res = await saveInvoiceItemsAction(1, fd);
    expect(res.ok).toBe(true);
  });
});
