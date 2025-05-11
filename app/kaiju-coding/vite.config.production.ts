import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Production-specific settings
  build: {
    // Generate sourcemaps for easier debugging
    sourcemap: true,
    
    // Optimize the build
    minify: 'terser',
    
    // Configure output
    outDir: 'dist',
    assetsDir: 'assets',
    
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
        }
      }
    },
    
    // Configure chunk size warnings
    chunkSizeWarningLimit: 1000
  },
  
  // Configure base URL - use '/' for CloudFront deployment
  base: '/'
}) 