import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 5174,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      'rimmel': '../../src/index.ts'
    }
  }
});