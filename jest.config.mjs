import pkgService, { defineJestConfig } from '@ice/pkg';

export default defineJestConfig(pkgService, {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ['__tests__/data/'],
  transformIgnorePatterns: ['node_modules/(?!@xtree/.*)'],
  transform: {
    'node_modules/@xtree/tree/.+\\.(j|t)sx?$': '@swc/jest',
  },
});
