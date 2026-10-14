import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the exact private authorization helpers without importing database code.
function loadHelpers(path: string, names: string[], env: Record<string, string>) {
  const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, path.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const declarations = source.statements.filter(ts.isFunctionDeclaration).filter(node => node.name && names.includes(node.name.text));
  expect(declarations).toHaveLength(names.length);
  const compiled = ts.transpileModule(declarations.map(node => node.getText(source)).join('\n'), { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText;
  return vm.runInNewContext(`${compiled}\n({ ${names.join(', ')} });`, { process: { env } }) as Record<string, (email?: string | null) => string | boolean>;
}

const funnelSources = ['app/api/admin/sales-inquiries/[id]/route.ts', 'app/dashboard/owner/funnel/page.tsx'];

describe.each(funnelSources)('configured owner/admin funnel access: %s', (path) => {
  it('fails closed with absent configuration or an empty account', () => {
    const { canViewOwnerFunnel } = loadHelpers(path, ['canViewOwnerFunnel'], {});
    expect(canViewOwnerFunnel('owner@example.test')).toBe(false);
    expect(canViewOwnerFunnel('')).toBe(false);
    expect(canViewOwnerFunnel(null)).toBe(false);
  });
  it('preserves explicit owner and administrator access with normalization', () => {
    const { canViewOwnerFunnel } = loadHelpers(path, ['canViewOwnerFunnel'], { COMPANY_OWNER_EMAIL: ' OWNER@example.test ', ADMIN_EMAILS: ' admin@example.test, second@example.test ' });
    expect(canViewOwnerFunnel(' Owner@Example.Test ')).toBe(true);
    expect(canViewOwnerFunnel('ADMIN@example.test')).toBe(true);
    expect(canViewOwnerFunnel('second@example.test')).toBe(true);
    expect(canViewOwnerFunnel('unlisted@example.test')).toBe(false);
  });
});

describe('configured owner role inference', () => {
  const path = 'app/lib/supabase-store.ts';
  it('does not infer owner from absent configuration, including empty input', () => {
    const { inferRoleSlugForEmail } = loadHelpers(path, ['normalizeEmail', 'inferRoleSlugForEmail'], { ADMIN_EMAILS: 'admin@example.test' });
    expect(inferRoleSlugForEmail('')).toBe('client');
    expect(inferRoleSlugForEmail('unknown@example.test')).toBe('client');
    expect(inferRoleSlugForEmail('admin@example.test')).toBe('admin');
  });
  it('preserves configured owner precedence and case normalization', () => {
    const { inferRoleSlugForEmail } = loadHelpers(path, ['normalizeEmail', 'inferRoleSlugForEmail'], { COMPANY_OWNER_EMAIL: ' OWNER@example.test ', ADMIN_EMAILS: 'owner@example.test, admin@example.test' });
    expect(inferRoleSlugForEmail(' Owner@Example.Test ')).toBe('owner');
    expect(inferRoleSlugForEmail('admin@example.test')).toBe('admin');
  });
});
