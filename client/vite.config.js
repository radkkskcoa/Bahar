import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The preview proxy reaches the dev server through a sandbox hostname that changes
// whenever the environment is recreated, so allow the sandbox domain as a wildcard.
// Vite also appends __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS (set by the platform).
const allowedHosts = [];
if (process.env.BASE44_PREVIEW_MODE === '1' && process.env.BASE44_SANDBOX_HOST_DOMAIN) {
  allowedHosts.push(`.${process.env.BASE44_SANDBOX_HOST_DOMAIN}`);
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts,
    // Bind mounts on Linux often miss inotify events; poll so hot reload always fires.
    watch: { usePolling: true, interval: 400 },
    proxy: {
      // Single origin for the app: the browser only ever talks to port 3000.
      '/api': {
        target: process.env.API_PROXY_TARGET ?? 'http://api:4000',
        changeOrigin: false,
      },
    },
  },
  build: { outDir: 'dist', sourcemap: false },
});
