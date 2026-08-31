/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('mermaid')) return 'mermaid'
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype')) return 'markdown'
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor'
          }
        },
      },
    },
  },
})
