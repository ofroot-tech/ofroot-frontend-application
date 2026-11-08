import type { ReactNode } from 'react';
import ReadingTheme from '@/components/editorial/ReadingTheme';

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <ReadingTheme>{children}</ReadingTheme>;
}
