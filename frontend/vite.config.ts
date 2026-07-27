import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'react-core';
          }

          if (id.includes('node_modules/@mui/icons-material/')) {
            return 'mui-icons';
          }

          if (id.includes('node_modules/@mui/x-data-grid/')) {
            return 'mui-grid';
          }

          if (id.includes('node_modules/@mui/') || id.includes('node_modules/@emotion/')) {
            return 'mui-core';
          }

          if (id.includes('node_modules/@tanstack/')) {
            return 'query';
          }

          if (id.includes('node_modules/recharts/')) {
            return 'charts';
          }

          if (id.includes('node_modules/axios/')) {
            return 'network';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
