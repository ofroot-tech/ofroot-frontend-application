/**
 * ESLint config for OfRoot dialer work.
 * Narrative-first so future editors understand the defaults: we lean on
 * `next/core-web-vitals` for sensible React+Next rules, use Rushstack's module
 * resolution patch to keep plugin lookup simple, and ignore build artifacts.
 */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  extends: ['next', 'next/core-web-vitals'],
  plugins: ['@typescript-eslint'],
  rules: {
    // We intentionally allow require in the Sentry helper until it migrates to ESM
    '@typescript-eslint/no-var-requires': 'off',
  },
  ignorePatterns: ['.next/**', 'node_modules/**', 'tmp/**'],
};
