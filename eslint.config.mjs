/**
 * ESLint flat config for OfRoot front-end.
 *
 * Narrative: eslint-config-next now ships a flat config; using it via eslintrc
 * produced a circular JSON serialization error during Next lint. This file
 * adopts the flat format directly so Next.js linting works cleanly.
 *
 * Structure:
 * - Ignore build artifacts and temp folders to keep lint fast.
 * - Spread Next.js defaults (core web vitals + TypeScript support).
 * - Apply a single project-specific tweak that keeps CommonJS requires allowed
 *   while the Sentry helper waits on its ESM migration.
 */
import nextConfig from 'eslint-config-next';
import typescriptEslint from 'typescript-eslint';

const ignoreGlobs = ['.next/**', 'out/**', 'build/**', 'node_modules/**', 'tmp/**'];
const nextPresets = Array.isArray(nextConfig) ? nextConfig : nextConfig();

export default [
  { name: 'ofroot/ignores', ignores: ignoreGlobs },
  ...nextPresets,
  {
    name: 'ofroot/tweaks',
    plugins: { '@typescript-eslint': typescriptEslint.plugin },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];
