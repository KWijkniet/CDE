import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'main.js',
            name: 'CDE',
            fileName: 'cde'
        },
        emptyOutDir: true,
        // minify: 'terser',
        minify: false,
        outDir: './build',
        assetsDir: '',
        rollupOptions: {
            output: {
                entryFileNames: `[name].js`,
                chunkFileNames: `[name].js`,
                assetFileNames: `[name].[ext]`,
                manualChunks: undefined,
            }
            // https://rollupjs.org/guide/en/#big-list-of-options
        }
    },
})