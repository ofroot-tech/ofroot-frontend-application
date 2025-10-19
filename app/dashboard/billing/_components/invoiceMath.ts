/**
 * invoiceMath — tiny helpers for totals and validation.
 *
 * Inputs
 *   - lines: array of { description, quantity, amount } where amount is a string (UI input)
 *   - taxPercent: string from input (e.g., "8.25")
 *   - discountAmount: string from input (e.g., "10.00")
 *
 * Outputs
 *   - subtotal, tax, discount, total — as numbers in display currency
 */

export type UiLine = { description: string; quantity: number; amount: string };

export function validateLines(lines: UiLine[]) {
  const invalid = lines.filter((l) => {
    const desc = l.description.trim();
    const qty = Number(l.quantity);
    const amt = Number(l.amount);
    return !desc || !(qty > 0) || !(amt > 0);
  });
  return { hasInvalid: invalid.length > 0 };
}

export function computeTotals(lines: UiLine[], taxPercent: string, discountAmount: string) {
  const subtotal = lines.reduce((sum, l) => sum + (Number(l.amount) || 0) * (Number(l.quantity) || 0), 0);
  const pct = Number(taxPercent);
  const tax = pct > 0 ? (subtotal * pct) / 100 : 0;
  const discount = Math.max(0, Number(discountAmount) || 0);
  const total = Math.max(0, subtotal + tax - discount);
  return { subtotal, tax, discount, total };
}
