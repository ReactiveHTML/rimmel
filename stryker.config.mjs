/** @type {import('@stryker-mutator/api/core').StrykerOptions} */
export default {
  mutate: ['lib/**/*.js'],
  testRunner: 'command',
  commandRunner: {
    command: 'bun test'
  },
  reporters: ['html', 'clear-text', 'progress'],
  coverageAnalysis: 'off'
};
