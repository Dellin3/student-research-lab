import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { PUBLIC_ROUTES } from './src/config/routes.js'

const previewPaths = new Set(
  PUBLIC_ROUTES.filter((route) => route.path !== '/').map((route) => route.path),
)

function previewStaticRoutes() {
  return {
    name: 'preview-static-routes',
    configurePreviewServer(server) {
      server.middlewares.use((request, _response, next) => {
        const pathname =
          new URL(request.url, 'http://localhost').pathname.replace(/\/+$/, '') ||
          '/'

        if (previewPaths.has(pathname)) {
          request.url = `${pathname}/`
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), previewStaticRoutes()],
})
