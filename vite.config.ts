import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Chrome Extension multi-page build configuration
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Use relative paths for Chrome extension compatibility
  base: './',
  build: {
    // Chrome extensions can't use inline scripts due to CSP
    // So we need separate entry points for each extension page
    rollupOptions: {
      input: {
        // Popup - Main extension UI when clicking the toolbar icon
        popup: path.resolve(__dirname, 'src/entries/popup/index.html'),
        // Options - Extension settings page
        options: path.resolve(__dirname, 'src/entries/options/index.html'),
        // Side Panel - Chrome's new side panel feature
        sidepanel: path.resolve(__dirname, 'src/entries/sidepanel/index.html'),
        // Background - Service worker script
        background: path.resolve(__dirname, 'src/entries/background/index.ts'),
        // Content Script - Injected into web pages
        content: path.resolve(__dirname, 'src/entries/content/index.ts'),
        // ExtPay Content Script - Required for payment callbacks
        'extpay-content': path.resolve(__dirname, 'src/entries/extpay-content/index.ts'),
      },
      output: {
        entryFileNames: () => {
          // Keep entry point names but put them in root
          return '[name].js'
        },
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          // Put CSS files in root for easy access
          if (assetInfo.name?.endsWith('.css')) {
            return '[name][extname]'
          }
          return 'assets/[name][extname]'
        },
      },
    },
    // Don't minify during development for easier debugging
    minify: false,
    // Always generate source maps for debugging
    sourcemap: true,
    // Output to dist folder
    outDir: 'dist',
    // Empty the output directory before building
    emptyOutDir: true,
  },
  // Development server configuration
  server: {
    host: true,
    port: 3000,
    // Allow CORS for extension development
    cors: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', 'framer-motion'],
  },
})
