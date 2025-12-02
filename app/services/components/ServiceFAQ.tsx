// app/services/components/ServiceFAQ.tsx
'use client';

export default function ServiceFAQ({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section className="mt-12 reveal-in fade-only section-pad">
      <h2 className="text-2xl font-bold mb-4">FAQs</h2>
      <dl className="space-y-4">
        {items.map((it) => (
          <div key={it.q} className="rounded-lg border p-4 bg-white/80 backdrop-blur reveal-in fade-only">
            <dt className="font-semibold text-gray-900">{it.q}</dt>
            <dd className="mt-1 text-gray-700 text-sm">{it.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
