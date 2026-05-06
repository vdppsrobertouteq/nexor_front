import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['nexorfront-production.up.railway.app', '.railway.app'],
    host: true,
  },
  server: {
    host: true,
  },
})
