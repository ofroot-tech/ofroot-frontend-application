import { z } from 'zod';

const check = z.object({
  id: z.string(), name: z.string(), status: z.enum(['pass', 'fail', 'warning', 'na', 'pending']),
  score: z.number(), maxScore: z.number(), details: z.string().optional(), recommendation: z.string().optional(),
});
export const oraReportSchema = z.object({
  contractVersion: z.string().startsWith('1.'), domain: z.string(), score: z.number().min(0).max(100).nullable(),
  grade: z.string().nullable().optional(), scannedAt: z.string().optional(), generatedAt: z.string(),
  analysisStatus: z.enum(['complete', 'partial']), pendingChecks: z.array(z.unknown()).default([]),
  servedFromCache: z.boolean().optional(),
  layers: z.array(z.object({ id: z.string(), name: z.string(), score: z.number(), maxScore: z.number(), checks: z.array(check) })),
  topFixes: z.array(z.object({ id: z.string(), name: z.string(), recommendation: z.string() })).default([]),
  essentials: z.object({
    score: z.number().min(0).max(100).nullable(), label: z.string(), issues: z.array(z.string()),
    activeSurfaces: z.array(z.object({ id: z.string(), label: z.string(), score: z.number().nullable(), passing: z.number(), total: z.number() })).default([]),
    checks: z.record(z.object({ tier: z.string(), bonus: z.boolean(), recommendation: z.string().optional() })),
  }).optional(),
});
export type AuditReport = z.infer<typeof oraReportSchema>;
export type AuditMode = 'website' | 'full';

// Only a public domain is forwarded to the fixed provider URL. Never fetch visitor URLs here.
export function auditDomain(input: string): string {
  const url = new URL(input.includes('://') ? input.trim() : `https://${input.trim()}`);
  const host = url.hostname.toLowerCase();
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port ||
      host.length > 253 || !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/.test(host) ||
      /\.(localhost|local|internal|test|invalid|example)$/.test(host)) {
    throw new Error('Enter a public website domain, such as example.com.');
  }
  return host;
}
export function auditView(report: AuditReport, mode: AuditMode) {
  const essentials = mode === 'website' ? report.essentials : undefined;
  const all = report.layers.flatMap(layer => layer.checks);
  const fixes = essentials ? essentials.issues.map(id => all.find(c => c.id === id)).filter((c): c is typeof all[number] => !!c)
    .map(c => ({ ...c, recommendation: essentials.checks[c.id]?.recommendation || c.recommendation || 'Review this finding with your developer.' }))
    : report.topFixes.map(f => ({ ...f, details: all.find(c => c.id === f.id)?.details }));
  return {
    score: mode === 'website' ? (essentials?.score ?? null) : report.score,
    label: mode === 'website' ? 'Website essentials' : 'Full agent readiness',
    fixes,
    partial: report.analysisStatus !== 'complete' || report.pendingChecks.length > 0,
  };
}
