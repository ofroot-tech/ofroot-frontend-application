import type { ReactNode, CSSProperties } from 'react';

const themeVars: CSSProperties = {
  '--payroll-primary': '#1d3b8b',
  '--payroll-accent': '#0f9ba8',
  '--payroll-muted': '#f4f5f7',
} as CSSProperties;

export default function PayrollLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6" style={themeVars}>
      {children}
    </div>
  );
}
