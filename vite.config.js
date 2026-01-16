import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: '/mesto-ad-public',
  build: {
    outDir: '../build'
  },
  server: {
    open: true,
    port: 3000
  }
});
