import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/react/') || id.includes('react-dom')) return 'react'
            if (id.includes('openai')) return 'openai'
            if (id.includes('marked') || id.includes('dompurify') || id.includes('highlight.js')) return 'markdown'
            if (id.includes('@heroicons')) return 'icons'
          }
        },
      },
    },
  },
})
