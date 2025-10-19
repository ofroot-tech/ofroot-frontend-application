// app/services/components/ServiceProof.tsx
'use client';

type Quote = { quote: string; author?: string; role?: string };
type Props = {
  logos?: string[];
  quotes?: Quote[];
};

export default function ServiceProof({ logos = [], quotes = [] }: Props) {
  return (
    <section className="mt-10 reveal-in fade-only section-pad">
      {(logos.length > 0) && (
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Trusted by</div>
          <div className="flex flex-wrap items-center gap-4 opacity-80">
            {logos.map((src, i) => (
              <img key={i} src={src} alt="logo" className="h-8 object-contain" />
            ))}
          </div>
        </div>
      )}
      {(quotes.length > 0) && (
  <div className="grid grid-cols-1 md:grid-cols-2 grid-gap-modern">
          {quotes.map((q, i) => (
            <figure key={i} className="rounded-xl border p-4 bg-white/80 backdrop-blur shadow-sm">
              <blockquote className="text-gray-800">“{q.quote}”</blockquote>
              {(q.author || q.role) && (
                <figcaption className="mt-2 text-sm text-gray-600">{q.author}{q.role ? `, ${q.role}` : ''}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
