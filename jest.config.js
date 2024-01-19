const common = {
  verbose: true,
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  coveragePathIgnorePatterns: ['node_modules'],
  transform: { '^.+\\.(j|t)s(x)?$': 'esbuild-jest' },
  moduleFileExtensions: ['js'],
};

module.exports = {
  projects: [
    {
      ...common,
      displayName: 'dom',
      testEnvironment: 'jsdom',
      testRegex: '/src/.*\\.web\\.test\\.js$',
    },
    {
      ...common,
      displayName: 'node',
      testEnvironment: 'node',
      testRegex: '/src/.*\\.node\\.test\\.js$',
    },
  ],
};
