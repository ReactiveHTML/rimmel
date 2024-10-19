import { RollupOptions, OutputOptions } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';

const terserOptions = {
	compress: {
		drop_debugger: false,
	},
};

export default <RollupOptions[]>[
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
				tsconfig: './tsconfig.build.json',
				sourceMap: true,
				inlineSources: true,
				// declarationDir: './dist/types',
				outDir: 'dist/globaljs',
				declaration: false,
			}),
			terser(terserOptions),
			visualizer({ filename: 'bundle-stats-globaljs.html' }),
		],
		output: [{
			exports: 'named',
			externalLiveBindings: false,
			dir: './dist/globaljs',
			entryFileNames: 'rimmel.js',
			freeze: true,
			generatedCode: 'es2015',
			format: 'iife',
			name: 'rml',    // The name of your global variable
			globals: {
				'rxjs': 'rxjs',  // Assuming rxjs is an external dependency
			},
			sourcemap: true,
		}],
	},

	{
		external: ['rxjs'],
		input: './src/index.ts',
		treeshake: {
			propertyReadSideEffects: false,    // Optimise property access side effects
		},
		plugins: [
			nodeResolve({ preferBuiltins: true }),
			commonjs(),
			json(),
			typescript({
				tsconfig: './tsconfig.build.json',
				sourceMap: true,
				inlineSources: true,
				outDir: './dist/esm/modules',
				declarationDir: './dist/esm/types',
				declarationMap: true,
			}),
			terser(terserOptions),
			visualizer({ filename: 'bundle-stats-esm.html' }),
		],
		output: [
			{
				exports: 'named',
				externalLiveBindings: false,
				freeze: false,
				sourcemap: true,
				entryFileNames: 'rimmel.mjs',
				format: 'es',
				dir: './dist/esm',
				preserveModules: true,
			}
		],
	},

	{
		external: ['rxjs'],
		input: './src/ssr/index.ts',
		treeshake: {
			moduleSideEffects: 'no-external',  // Only shake internal code
			propertyReadSideEffects: false,    // Optimise property access side effects
		},
		plugins: [
			nodeResolve({ preferBuiltins: true }),
			commonjs(),
			json(),
			typescript({
				tsconfig: './tsconfig.build.json',
				sourceMap: true,
				inlineSources: true,
				outDir: './dist/ssr',
				declarationDir: './dist/ssr/types',
				declarationMap: true,
			}),
			terser(terserOptions),
			visualizer({ filename: 'bundle-stats-ssr.html' }),
		],
		output: [
			{	// CJS SSR
				dir: './dist/ssr',
				entryFileNames: 'ssr.cjs',
				exports: 'named',
				externalLiveBindings: false,
				format: 'cjs',
				freeze: false,
				// generatedCode: 'es6',
				// interop: 'default',
				sourcemap: true,
			},
			{	// ESM SSR
				exports: 'named',
				externalLiveBindings: false,
				freeze: false,
				dir: './dist/ssr',
				entryFileNames: 'ssr.mjs',
				format: 'es',
				sourcemap: true,
			}
		],
	},
];

