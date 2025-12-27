import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env file variables for local development
  const env = loadEnv(mode, process.cwd(), '');
  
  // Build the define object for environment variables
  // Priority: process.env (Cloudflare Pages) > .env file (local dev)
  const envVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_DATABASE_URL',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_MEASUREMENT_ID',
  ];
  
  const define = {};
  envVars.forEach(key => {
    // Use process.env first (Cloudflare Pages), then fall back to loadEnv (local .env)
    const value = process.env[key] || env[key] || '';
    if (value) {
      define[`import.meta.env.${key}`] = JSON.stringify(value);
    }
  });

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    define
  };
});
