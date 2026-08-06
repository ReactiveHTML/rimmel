import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  external: ['react', 'rimmel', 'rxjs', 'rxjs/operators'],
  input: './src/index.ts',
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist/esm/types',
      outDir: './dist/esm',
    }),
  ],
  output: {
    exports: 'named',
    externalLiveBindings: false,
    freeze: false,
    sourcemap: true,
    entryFileNames: '[name].js',
    format: 'es',
    dir: './dist/esm',
    preserveModules: false,
  },
};
