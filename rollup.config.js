// import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2'
// import babelConfig from './babel.config.json';
import sourceMaps from 'rollup-plugin-sourcemaps';
import json from 'rollup-plugin-json';
import { terser } from 'rollup-plugin-terser';
import visualizer from 'rollup-plugin-visualizer';
import cleanup from 'rollup-plugin-cleanup';
import renameNodeModules from 'rollup-plugin-rename-node-modules';

const { peerDependencies } = require('./package.json');

const sourcemap = true;

const external = [...Object.keys(peerDependencies || {})];

const cjs = {
  dir: 'dist',
  entryFileNames: `[name].cjs`,
  exports: 'named',
  format: 'cjs',
  interop: 'default',
  sourcemap,
};

const es = {
  ...cjs,
  format: 'es',
  entryFileNames: `[name].mjs`,
  minifyInternalExports: false,
};

const formats = [cjs, es];

export default {
  input: 'src/index.ts',
  output: formats.reduce((acc, curr) => ([
    ...acc,
    curr,
    { ...curr, dir: `${curr.dir}/modules`, preserveModules: true },
  ]), []),
  external,
  watch: {
    include: 'src/**',
  },
  plugins: [
    typescript({ useTsconfigDeclarationDir: true }),
    // babel({
    //   babelrc: false,
    //   babelHelpers: 'bundled',
    //   exclude: 'node_modules/**',
    //   ...babelConfig,
    // }),
    // Allow json resolution
    json(),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),
    // Resolve source maps to the original source
    sourceMaps(),
    terser(),
    cleanup({ sourcemap }),
    renameNodeModules('modules_node'),
    visualizer({ filename: './doc/bundle-stats.html', sourcemap }),
  ],
}
