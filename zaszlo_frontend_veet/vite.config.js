import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // A backend címe
        changeOrigin: true, //A proxy átírja az Origin fejlécet a backend szerver URL-jére 
        secure: false, // HTTPS esetén állítsd true-ra, ha szükséges
        rewrite: (path) => path.replace(/^\/api/, ''), // Eltávolítja az /api előtagot küldéskor
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom', // böngésző környezet szimulálása
    setupFiles: './src/setupTests.ts', // opcionális setup
  },

});
