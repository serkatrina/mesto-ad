import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../build'
  },
  server: {
    open: true,
    port: 3000
  }
});
