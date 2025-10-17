const common = {
  verbose: true,
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  coveragePathIgnorePatterns: ['node_modules'],
  transform: { '^.+\\.(j|t)s(x)?$': 'esbuild-jest' },
  moduleFileExtensions: ['js', 'ts'],
};

export default {
  projects: [
    {
      ...common,
      displayName: 'dom',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/**/*.test.ts'],
    },
    {
      ...common,
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/**/*.test.ts'],
    },
  ],
};
