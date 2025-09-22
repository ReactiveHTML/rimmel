import { defineConfig } from 'vite';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';

const terserOptions = {
  compress: {
    drop_debugger: false,
  },
};

export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      format: {
        comments: 'all'
      }
    },
    lib: {
      entry: 'src/index.ts',
      name: 'rml',
      fileName: (format) => `rml.${format}.js`
    },
    sourcemap: true,
    rollupOptions: {
      external: ['rxjs'],
      treeshake: {
          moduleSideEffects: id => id.includes('src/data-binding'),
      },
      output: [
        { // Global JS
          format: 'iife',
          name: 'rml',
          globals: { rxjs: 'rxjs' },
          dir: 'dist/globaljs',
          entryFileNames: '[name].mjs',
          freeze: true,
          generatedCode: 'es2015',
        },
        { // ESM
          format: 'es',
          dir: 'dist/esm',
          entryFileNames: '[name].js',
          preserveModules: true,
          freeze: false,
        },
        { // SSR
          format: 'es',
          dir: 'dist/ssr',
          entryFileNames: '[name].mjs',
          freeze: false,
        },
      ],
      plugins: [
        resolve({ preferBuiltins: true }),
        json(),
        typescript({
          tsconfig: './tsconfig.json',
          // declaration: true,
          // declarationDir: 'dist/types' // Use unified types directory
        }),
        terser(terserOptions),
        visualizer({
		  filename: 'bundle-stats.html',
		  sourcemap: false,
		  // template: 'sunburst'
		  gzipSize: true,
		  brotliSize: true,
		}),
      ],
    },
  },
  resolve: {
    alias: {
      rimmel: './src/index',
    },
  },
});
