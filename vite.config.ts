import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: './src/index.ts',
			name: 'index.js'
		},
		rollupOptions: {
			output: {
				entryFileNames: 'index.js',
				// chunkFileNames: 'chunks/[name]-[hash].js',
				// assetFileNames: 'assets/[name]-[hash][extname]'
			}
		},
		sourcemap: true,
		minify: 'terser'
	},
	esbuild: {
		sourcemap: true
	},
	server: {
		watch: {
			ignored: ['**/node_modules/**', '**/dist/**'],
		}
	}
});

