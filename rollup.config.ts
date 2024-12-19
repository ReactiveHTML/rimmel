import { RollupOptions } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';

const terserOptions = {
	compress: {
		drop_debugger: false,
	},
};

const getTSConfig = async (path: string) => {
	const tsConfig = (await import('./tsconfig.json', { assert: { type: 'json' } })).default;

	tsConfig.compilerOptions.outDir = path;
	return tsConfig.compilerOptions;
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
				...await getTSConfig('dist/globaljs'),
				sourceMap: true,
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
				...await getTSConfig('dist/esm'),
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
				...await getTSConfig('dist/ssr'),
				sourceMap: true,
				outDir: 'dist/ssr',
				declaration: true,
			}),
			terser(terserOptions),
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
			}
		],
	},
];

