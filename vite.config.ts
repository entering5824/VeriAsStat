import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'fs'
import { join } from 'path'

// Plugin to ensure /data/* files are served correctly
// This ensures JSON files in /data/ are served with correct content-type
// and are not intercepted by Vue Router's SPA fallback
function dataFilesPlugin() {
  return {
    name: 'data-files-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        // Only handle requests to /data/* paths
        if (req.url?.startsWith('/data/')) {
          try {
            // Try to read file from public directory
            const filePath = join(process.cwd(), 'public', req.url)
            const fileContent = readFileSync(filePath, 'utf-8')
            
            // Set appropriate content type and headers
            if (req.url.endsWith('.json')) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
            }
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
            
            res.end(fileContent)
            return
          } catch (error: any) {
            // If file doesn't exist, log and continue to next middleware
            console.error(`[data-files-plugin] Error serving ${req.url}:`, error.message)
            // Don't return here - let Vite handle 404
          }
        }
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), dataFilesPlugin()],
  server: {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    // Ensure static files in public directory are served correctly
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  },
  // Explicitly configure public directory
  publicDir: 'public',
  // Disable CSS code splitting in dev to avoid cache issues
  css: {
    devSourcemap: true
  },
  // Ensure files are not cached in dev
  build: {
    rollupOptions: {
      output: {
        // Add hash to CSS filenames in production
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})
