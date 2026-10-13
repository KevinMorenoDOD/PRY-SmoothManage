import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("./src/modules/shared", import.meta.url)),
      "@auth": fileURLToPath(new URL("./src/modules/auth", import.meta.url)),
      "@tasks": fileURLToPath(new URL("./src/modules/tasks", import.meta.url)),
      "@notes": fileURLToPath(new URL("./src/modules/notes", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
