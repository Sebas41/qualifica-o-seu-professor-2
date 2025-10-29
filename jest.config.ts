import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.(spec|integration\\.spec)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.service.ts', 
    '**/*.controller.ts',
    '**/*.guard.ts', 
    '!**/*.module.ts', 
    '!**/seed/**',
    '!**/dist/**',
    '!main.ts',
    '!test.controller.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/', 
    '/dist/',
    'main.ts', 
    'app.module.ts',
    '/seed/',
    '.env',
    '.integration.spec.ts',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/seed/',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 30000,
};

export default config;
