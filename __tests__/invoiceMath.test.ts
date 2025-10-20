import { computeTotals, validateLines } from '../app/dashboard/billing/_components/invoiceMath';

describe('invoiceMath', () => {
  it('computes totals with tax and discount', () => {
    const lines = [
      { description: 'A', quantity: 1, amount: '10.00' },
      { description: 'B', quantity: 2, amount: '5' },
    ];
    const { subtotal, tax, discount, total } = computeTotals(lines, '10', '3');
    expect(subtotal).toBeCloseTo(20); // 10 + 2*5
    expect(tax).toBeCloseTo(2); // 10% of 20
    expect(discount).toBeCloseTo(3);
    expect(total).toBeCloseTo(19); // 20 + 2 - 3
  });

  it('validates lines marking empty/zero entries invalid', () => {
    const { hasInvalid } = validateLines([
      { description: 'ok', quantity: 1, amount: '1' },
      { description: ' ', quantity: 1, amount: '1' },
      { description: 'x', quantity: 0, amount: '2' },
      { description: 'y', quantity: 1, amount: '0' },
    ]);
    expect(hasInvalid).toBe(true);
  });
});
