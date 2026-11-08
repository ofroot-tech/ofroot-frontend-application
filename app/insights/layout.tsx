import type { ReactNode } from 'react';
import ReadingTheme from '@/components/editorial/ReadingTheme';

export default function InsightsLayout({children}:{children:ReactNode}) {
  return <ReadingTheme>{children}</ReadingTheme>;
}
