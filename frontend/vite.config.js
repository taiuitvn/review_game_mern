import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    
  ],
  
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // URL của server backend Express.js
        changeOrigin: true,
        secure: false,
      },
      '/rawg-api': {
        target: 'https://api.rawg.io/api',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/rawg-api/, ''),
      },
    },
  },
})
