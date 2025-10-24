import { Buffer } from 'node:buffer'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const stlProxyPlugin = {
  name: 'stl-proxy',
  configureServer(server) {
    server.middlewares.use('/stl-proxy', async (req, res) => {
      try {
        const u = new URL(req.url, 'http://localhost')
        const target = u.searchParams.get('url')
        if (!target) {
          res.statusCode = 400
          res.end('Missing url param')
          return
        }
        const r = await fetch(target)
        if (!r.ok) {
          res.statusCode = r.status
          res.end(`Upstream error: ${r.status}`)
          return
        }
        const ct = r.headers.get('content-type') || 'model/stl'
        res.setHeader('Content-Type', ct)
        res.setHeader('Access-Control-Allow-Origin', '*')
        const ab = await r.arrayBuffer()
        res.end(Buffer.from(ab))
      } catch (error) {
        console.error('STL proxy (dev) failed', error)
        res.statusCode = 502
        res.end('Proxy error')
      }
    })
  },
  configurePreviewServer(server) {
    server.middlewares.use('/stl-proxy', async (req, res) => {
      try {
        const u = new URL(req.url, 'http://localhost')
        const target = u.searchParams.get('url')
        if (!target) {
          res.statusCode = 400
          res.end('Missing url param')
          return
        }
        const r = await fetch(target)
        if (!r.ok) {
          res.statusCode = r.status
          res.end(`Upstream error: ${r.status}`)
          return
        }
        const ct = r.headers.get('content-type') || 'model/stl'
        res.setHeader('Content-Type', ct)
        res.setHeader('Access-Control-Allow-Origin', '*')
        const ab = await r.arrayBuffer()
        res.end(Buffer.from(ab))
      } catch (error) {
        console.error('STL proxy (preview) failed', error)
        res.statusCode = 502
        res.end('Proxy error')
      }
    })
  },
}

export default defineConfig({
  plugins: [react(), stlProxyPlugin],
  server: {
    middlewareMode: false,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/react/') || id.includes('react-dom')) return 'react'
            if (id.includes('marked') || id.includes('dompurify') || id.includes('highlight.js')) return 'markdown'
            if (id.includes('@heroicons')) return 'icons'
            if (id.includes('node_modules/mermaid')) return 'mermaid'
            if (id.includes('node_modules/katex')) return 'katex'
            if (id.includes('node_modules/@zxing')) return 'zxing'
            if (id.includes('three') || id.includes('@react-three')) return 'stl'
          }
          return undefined
        },
      },
    },
  },
})
