/**
 * Firebase Configuration and Initialization
 *
 * IMPORTANT: Replace these values with your actual Firebase project credentials
 * Get these from: Firebase Console > Project Settings > General > Your apps
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update, remove } from 'firebase/database';

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

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
