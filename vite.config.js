import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars including VITE_ prefixed ones
  const env = loadEnv(mode, process.cwd(), '');

  // Environment variables to inject
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

  // Build define object - always inject, using process.env (Cloudflare) or loadEnv (local)
  const define = {};
  envVars.forEach(key => {
    const value = process.env[key] ?? env[key] ?? '';
    define[`import.meta.env.${key}`] = JSON.stringify(value);
  });

  // Debug: log what we're injecting during build
  console.log('Vite build - Environment variables status:');
  envVars.forEach(key => {
    console.log(`  ${key}: ${process.env[key] ? 'from process.env' : env[key] ? 'from .env' : 'MISSING'}`);
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
