import { timingSafeEqual } from 'node:crypto';

export function authorizedRefresh(header: string | null, secret = process.env.CRON_SECRET): boolean {
  if (!secret || !header) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const supplied = Buffer.from(header);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
