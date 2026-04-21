import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: './',
  build: {
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'src/entries/popup/index.html'),
        options: path.resolve(__dirname, 'src/entries/options/index.html'),
        sidepanel: path.resolve(__dirname, 'src/entries/sidepanel/index.html'),
        background: path.resolve(__dirname, 'src/background.ts'),
        content: path.resolve(__dirname, 'src/content.ts'),
        'extpay-content': path.resolve(__dirname, 'src/extpay-content.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return '[name][extname]'
          return 'assets/[name][extname]'
        },
      },
    },
    minify: false,
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 3000,
    cors: true,
  },
})
