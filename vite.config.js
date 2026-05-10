import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Конфиг под SSR-режим: dev-сервер у нас Express (server/index.js),
// а Vite используется как middleware (vite.createServer({ middlewareMode: true })).
// Для production выполняем два билда: client → dist/client, server → dist/server.
export default defineConfig({
  plugins: [react()],
  server: {
    middlewareMode: false,
  },
  build: {
    emptyOutDir: true,
  },
})
