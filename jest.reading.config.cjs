// React's act helper is development-only; Vercel builds set NODE_ENV=production.
// Keep this setting inside the Jest subprocess, before React is loaded.
process.env.NODE_ENV = 'test';
const base = require('./jest.config.js');
module.exports = {
  ...base,
  testMatch: [
    '<rootDir>/__tests__/signal-article-pilot.test.ts',
    '<rootDir>/__tests__/blog-markdown.test.ts',
    '<rootDir>/__tests__/reading-jsonld.test.tsx',
    '<rootDir>/__tests__/signal-audio-assets.test.ts',
    '<rootDir>/__tests__/signal-audio-player.test.tsx',
    '<rootDir>/__tests__/signal-digest.test.ts',
  ],
  preset: 'ts-jest/presets/js-with-ts',
  transformIgnorePatterns: ['/node_modules/(?!marked/)'],
  globals: {
    'ts-jest': { tsconfig: { jsx: 'react-jsx', allowJs: true, module: 'CommonJS', moduleResolution: 'Node' } },
  },
};
