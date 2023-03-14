import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('../certs/cert.key'),
      cert: fs.readFileSync('../certs/cert.crt'),
    },
    host: true,
  },
  plugins: [
    react(),
  ],
})
