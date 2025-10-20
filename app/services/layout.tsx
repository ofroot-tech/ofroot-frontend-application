// app/services/layout.tsx
import type { ReactNode } from 'react';

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 section-pad reveal-in">
      {children}
    </div>
  );
}
