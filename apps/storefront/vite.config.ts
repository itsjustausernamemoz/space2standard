import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../shared'),
    },
  },
  envDir: '../../',
  server: { port: 3000 },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('framer-motion'))                              return 'vendor-motion';
          if (id.includes('lucide-react'))                               return 'vendor-lucide';
          if (id.includes('@supabase'))                                  return 'vendor-supabase';
          if (id.includes('react-dom') || id.includes('react-router'))   return 'vendor-react';
        },
      },
    },
  },
});
