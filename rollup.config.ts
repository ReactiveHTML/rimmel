import { RollupOptions, OutputOptions } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
  import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const es: OutputOptions = {
  dir: './dist',
  entryFileNames: '[name].js',
  exports: 'named',
  externalLiveBindings: false,
  freeze: false,
  // generatedCode: 'es2015',
  // interop: 'default',
  sourcemap: true,
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
      json(),
      typescript({
        tsconfig: './tsconfig.build.json',
        sourceMap: true,
        declarationDir: './dist/types',
      }),
      terser(),
    ],
    output: [ es ],
  },
  {
    input: './src/index.ts',
    plugins: [
      nodeResolve({ preferBuiltins: true }),
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
        ...es,
        ...preserveModules,
      }
    ],
  },
] as RollupOptions[];
