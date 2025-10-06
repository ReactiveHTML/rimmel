import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'rimmel': resolve(__dirname, '../../dist/esm/index.js')
    }
  }
});