/** @type {import('@stryker-mutator/api/core').StrykerOptions} */
export default {
	disableTypeChecks: false,
	mutate: [
		'./src/**/*.js',
		'./src/**/*.ts'
	],
	ignorePatterns: [
		'docs',
		'./docs/*',
		'./docs/**/*',
		'./docs/**/*.*',
		'./**/*.html'
	],
	testRunner: 'bun',
	commandRunner: {
		command: 'bun test'
	},
	reporters: ['html', 'clear-text', 'progress'],
	coverageAnalysis: 'off'
};
