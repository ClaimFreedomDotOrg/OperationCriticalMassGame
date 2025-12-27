// Cloudflare Pages Function to serve Firebase config
// This makes environment variables available at runtime instead of build time

export async function onRequest(context) {
  // Debug: Log what's available
  console.log('Available env keys:', Object.keys(context.env || {}));

  const config = {
    apiKey: context.env.VITE_FIREBASE_API_KEY,
    authDomain: context.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: context.env.VITE_FIREBASE_DATABASE_URL,
    projectId: context.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: context.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: context.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: context.env.VITE_FIREBASE_APP_ID,
    measurementId: context.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  return new Response(JSON.stringify(config), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
