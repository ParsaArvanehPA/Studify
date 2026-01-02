import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { existsSync, readFileSync } from 'fs'

// Plugin to serve study files (HTML) without SPA fallback
function serveStudyFiles(): Plugin {
  return {
    name: 'serve-study-files',
    configureServer(server) {
      // Add middleware BEFORE Vite's internal middlewares (don't return a function)
      server.middlewares.use((req, res, next) => {
        // Check if request is for a Semester file
        if (req.url && req.url.includes('/Semester') && req.url.endsWith('.html')) {
          const urlPath = decodeURIComponent(req.url.replace('/Studify', ''))
          const filePath = resolve(__dirname, 'public', urlPath.slice(1))

          if (existsSync(filePath)) {
            const content = readFileSync(filePath, 'utf-8')
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(content)
            return
          }
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [serveStudyFiles(), react(), tailwindcss()],
  base: '/Studify/',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
