import { RollupOptions, OutputOptions } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const cjs: OutputOptions = {
  dir: './dist',
  entryFileNames: '[name].cjs',
  exports: 'named',
  externalLiveBindings: false,
  format: 'cjs',
  freeze: false,
  // generatedCode: 'es2015',
  // interop: 'default',
  sourcemap: true,
}

const es: OutputOptions = {
  ...cjs,
  entryFileNames: '[name].mjs',
  format: 'es',
};

const preserveModules = {
  dir: './dist/modules',
  preserveModules: true,
};

export default [
  {
    input: './src/index.ts',
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      json(),
      typescript({
        tsconfig: './tsconfig.build.json',
        sourceMap: true,
        declarationDir: './dist/types',
      }),
      terser(),
    ],
    output: [ cjs, es ],
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
      terser(),
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
