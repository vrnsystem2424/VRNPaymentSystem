import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'  // Yeh line zaroori

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],  // tailwindcss() add karo
})