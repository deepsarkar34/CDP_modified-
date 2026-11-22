import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' so the built site opens from any folder or static host, offline.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
});
