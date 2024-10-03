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

const cjs: OutputOptions = {
  dir: './dist',
  entryFileNames: '[name].cjs',
  exports: 'named',
  externalLiveBindings: false,
  format: 'cjs',
  freeze: false,
  // generatedCode: 'es6',
  // interop: 'default',
  sourcemap: true,
}

const es: OutputOptions = {
  ...cjs,
  entryFileNames: '[name].js',
  format: 'es',
};

const cjs_ssr: OutputOptions = {
  dir: './dist',
  entryFileNames: 'ssr.cjs',
  exports: 'named',
  externalLiveBindings: false,
  format: 'cjs',
  freeze: false,
  // generatedCode: 'es6',
  // interop: 'default',
  sourcemap: true,
}

const es_ssr: OutputOptions = {
  ...cjs,
  entryFileNames: 'ssr.js',
  format: 'es',
};

const globalVar: OutputOptions = {
  ...cjs,
  dir: './dist',
  entryFileNames: 'rimmel.js',
  freeze: true,
  generatedCode: 'es2015',
  sourcemap: true,
  format: 'esm',
  globals: {
    'rml': 'rimmel',
  }
};

const preserveModules = {
  dir: './dist/modules',
  preserveModules: true,
};

export default [
  {
    external: ['rxjs'],
    input: './src/index.ts',
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
        declarationDir: './dist/types',
      }),
      terser(terserOptions),
      visualizer({ filename: 'bundle-stats.html' }),
    ],
    output: [ cjs, es, globalVar ],
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
        declarationDir: './dist/types',
      }),
      terser(terserOptions),
      visualizer({ filename: 'bundle-stats.html' }),
    ],
    output: [ cjs_ssr, es_ssr ],
  },
  {
    input: './src/index.ts',
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      json(),
      typescript({
        tsconfig: './tsconfig.build.json',
        sourceMap: true,
        outDir: preserveModules.dir,
        declaration: false,
      }),
      terser(terserOptions),
    ],
    output: [
      {
        ...cjs,
        ...preserveModules,
      },
      {
        ...es,
        ...preserveModules,
      }
    ],
  },
] as RollupOptions[];
