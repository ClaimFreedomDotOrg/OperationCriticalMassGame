/**
 * Firebase Configuration and Initialization
 *
 * IMPORTANT: Replace these values with your actual Firebase project credentials
 * Get these from: Firebase Console > Project Settings > General > Your apps
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update, remove } from 'firebase/database';

// Initialize Firebase
let app = null;
let database = null;
let initPromise = null;

// Function to initialize Firebase with runtime config from Cloudflare Pages Function
async function initializeFirebaseAsync() {
  try {
    // Try to fetch config from Cloudflare Pages Function (production)
    const response = await fetch('/api/config');
    if (response.ok) {
      const firebaseConfig = await response.json();
      console.log('✅ Loaded Firebase config from Cloudflare Pages Function');
      app = initializeApp(firebaseConfig);
      database = getDatabase(app);
      return;
    }
  } catch (error) {
    console.log('ℹ️ Cloudflare Pages Function not available, using build-time env vars');
  }

  // Fallback to build-time environment variables (local development)
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

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Firebase configuration missing. Check environment variables.');
  }

  console.log('✅ Loaded Firebase config from build-time environment variables');
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
}

// Start initialization immediately
initPromise = initializeFirebaseAsync().catch(error => {
  console.error('Firebase initialization error:', error);
});

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
  get database() {
    return database;
  },
};

/**
 * Wait for Firebase to be initialized
 */
export const waitForFirebase = () => initPromise;

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
