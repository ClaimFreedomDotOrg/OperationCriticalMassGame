/**
 * Firebase Configuration and Initialization
 *
 * Environment variables must be set at build time with VITE_ prefix.
 * For Cloudflare Pages: Set variables in dashboard under Settings > Environment variables
 * For local development: Create a .env file with VITE_FIREBASE_* variables
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update, remove } from 'firebase/database';

// Firebase configuration using build-time environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Debug: Log which config values are present (not the actual values for security)
if (import.meta.env.DEV || !firebaseConfig.databaseURL) {
  console.log('Firebase config check:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasDatabaseURL: !!firebaseConfig.databaseURL,
    hasProjectId: !!firebaseConfig.projectId,
    hasStorageBucket: !!firebaseConfig.storageBucket,
    hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
    hasAppId: !!firebaseConfig.appId,
    hasMeasurementId: !!firebaseConfig.measurementId
  });
}

// Initialize Firebase
let app = null;
let database = null;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

/**
 * Generate anonymous player ID
 * No personal information collected (GDPR compliant)
 */
export const generatePlayerId = () => {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate session ID for game sessions
 */
export const generateSessionId = () => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '_');
  return `session_${date}_${Math.random().toString(36).substr(2, 6)}`;
};

/**
 * Firebase Database Helpers
 */
export const db = {
  ref,
  set,
  onValue,
  update,
  remove,
  database,
};

/**
 * Firebase Connection Status Hook
 */
export const checkFirebaseConnection = () => {
  if (!database) {
    return {
      connected: false,
      error: 'Firebase not initialized. Please configure Firebase credentials.',
    };
  }
  return {
    connected: true,
    error: null,
  };
};

export default app;
