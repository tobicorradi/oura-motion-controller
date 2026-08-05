import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/oura/': {
        target: 'http://127.0.0.1:8088',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/oura/, '') || '/',
        headers: { 'x-oura-viz': '1', origin: 'http://127.0.0.1:8088' },
      },
    },
  },
})
