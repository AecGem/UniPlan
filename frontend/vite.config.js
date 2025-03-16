import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: '',
  plugins: [react()
  ],
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
  },
  build: {
    outDir: './dist/pages',
    rollupOptions: {
      input: {
        RegistrantApp: resolve(__dirname,'Registrant.html'),
        RegistrarApp: resolve(__dirname,'Registrar.html'),
        App: resolve(__dirname,'index.html'),
        },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: 'assets/[name].[ext]',
      }
    }
  }
})