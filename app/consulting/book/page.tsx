import { redirect } from 'next/navigation';

/** Keep existing campaign links and attribution on the shared inquiry journey. */
export default async function ConsultingBookPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const incoming = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(incoming)) {
    if (Array.isArray(value)) value.forEach(item => query.append(key, item));
    else if (value !== undefined) query.set(key, value);
  }
  if (!query.has('source')) query.set('source', 'consulting-book');
  redirect(`/book?${query.toString()}`);
}
