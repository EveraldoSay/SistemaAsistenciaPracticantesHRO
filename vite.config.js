import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Módulo vacío para suprimir imports dinámicos opcionales de jsPDF
// (canvg, html2canvas, dompurify) que no usamos y que Vite no puede resolver.
const emptyModule = {
  name: 'empty-optional-jspdf-deps',
  resolveId(id) {
    if (['canvg', 'html2canvas', 'dompurify'].includes(id)) {
      return id
    }
  },
  load(id) {
    if (['canvg', 'html2canvas', 'dompurify'].includes(id)) {
      return 'export default {}; export const exports = {};'
    }
  },
}

export default defineConfig({
  plugins: [react(), emptyModule],

  // base './' es obligatorio para GitHub/GitLab Pages
  base: './',

  optimizeDeps: {
    exclude: ['canvg', 'html2canvas', 'dompurify'],
  },

  build: {
    rollupOptions: {
      external: ['canvg', 'html2canvas', 'dompurify'],
    },
  },
})
