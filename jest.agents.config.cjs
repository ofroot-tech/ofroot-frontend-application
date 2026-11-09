process.env.NODE_ENV = 'test';
const base = require('./jest.config.js');
module.exports = {
  ...base,
  testMatch: ['<rootDir>/__tests__/public-agent-protocols.test.ts'],
  globals: {
    'ts-jest': { tsconfig: { module: 'CommonJS', moduleResolution: 'Node', target: 'ES2022', jsx: 'react-jsx' } },
  },
};
