import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import { visualizer } from 'rollup-plugin-visualizer';

const getTSConfig = (overrides = {}) => ({
	tsconfig: './tsconfig.build.json',
	declaration: false,
	declarationMap: false,
	emitDeclarationOnly: false,
	inlineSourceMap: false,
	inlineSources: true,
	noEmit: false,
	sourceMap: true,
	...overrides,
});

export default [
	{	// Global JS
		external: ['rxjs'],
		input: './src/index.ts',
		treeshake: {
			propertyReadSideEffects: false,    // Optimise property access side effects
		},
		plugins: [
			nodeResolve({ preferBuiltins: true }),
			// json(),
			typescript({
				...getTSConfig(),
			}),
			visualizer({ filename: 'bundle-stats-globaljs.html' }),
		],
		output: [{
			exports: 'named',
			externalLiveBindings: false,
			dir: './dist/globaljs',
			entryFileNames: '[name].mjs',
			freeze: true,
			generatedCode: 'es2015',
			format: 'iife',
			name: 'rml',
			globals: {
				'rxjs': 'rxjs',
			},
			sourcemap: true,
		}],
	},

	{	// ESM
		external: ['rxjs'],
		input: './src/index.ts',
		treeshake: {
			propertyReadSideEffects: false,    // Optimise property access side effects
		},
		plugins: [
			nodeResolve({ preferBuiltins: true }),
			json(),
			typescript({
				...getTSConfig(),
			}),
			visualizer({ filename: 'bundle-stats-esm.html' }),
		],
		output: [
			{
				exports: 'named',
				externalLiveBindings: false,
				freeze: false,
				sourcemap: true,
				entryFileNames: '[name].js',
				format: 'es',
				dir: './dist/esm',
				preserveModules: true,
			}
		],
	},

	{	// SSR
		external: ['rxjs'],
		input: './src/ssr/index.ts',
		treeshake: {
			moduleSideEffects: 'no-external',  // Only shake internal code
			propertyReadSideEffects: false,    // Optimise property access side effects
		},
		plugins: [
			nodeResolve({ preferBuiltins: true }),
			json(),
			typescript({
				...getTSConfig(),
			}),
			visualizer({ filename: 'bundle-stats-ssr.html' }),
		],
		output: [
			{
				exports: 'named',
				externalLiveBindings: false,
				dir: './dist/ssr',
				entryFileNames: '[name].mjs',
				format: 'es',
				freeze: false,
				sourcemap: true,
			},
			{
				exports: 'named',
				externalLiveBindings: false,
				dir: './dist/ssr',
				entryFileNames: '[name].cjs',
				format: 'cjs',
				freeze: false,
				sourcemap: true,
			}
		],
	},
];
