# Cloudflare Pages Environment Variables Setup

## ⚠️ Critical: Build-Time Variables

**Cloudflare Pages environment variables are injected at BUILD TIME, not runtime.**

This means:

1. You **must set all variables BEFORE triggering a build**
2. After adding/changing variables, you **must trigger a new deployment**
3. Variables are baked into the JavaScript bundle during the build process

## ⚠️ Important: Do NOT Use wrangler.toml

**Do not add a `wrangler.toml` file to this repository.**

If a `wrangler.toml` file exists, Cloudflare Pages will read configuration from it and **ignore environment variables set in the dashboard**. This project is open source, so we cannot commit Firebase credentials to the repository.

The Vite build configuration (`vite.config.js`) is set up to read environment variables from:

1. `process.env` (Cloudflare Pages dashboard variables during build)
2. `.env` file (local development)

## Step-by-Step Instructions

### 1. Navigate to Your Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click on **Pages** in the left sidebar
3. Select your **Operation: Critical Mass** project
4. Click on **Settings** tab
5. Click on **Environment variables** in the left menu

### 2. Add Production Environment Variables

Click **"Add variable"** and add each of these **one at a time**:

#### Variable 1: Firebase API Key

- **Variable name:** `VITE_FIREBASE_API_KEY`
- **Maps to:** `apiKey` in Firebase config
- **Value:** Get from Firebase Console → Project Settings → Your apps → Web app config
- **Environment:** Production (and Preview if you want)

#### Variable 2: Firebase Auth Domain

- **Variable name:** `VITE_FIREBASE_AUTH_DOMAIN`
- **Maps to:** `authDomain` in Firebase config
- **Value:** `your-project-id.firebaseapp.com`
- **Environment:** Production (and Preview)

#### Variable 3: Firebase Database URL

- **Variable name:** `VITE_FIREBASE_DATABASE_URL`
- **Maps to:** `databaseURL` in Firebase config
- **Value:** `https://your-project-id-default-rtdb.firebaseio.com` (from Realtime Database page)
- **Environment:** Production (and Preview)

#### Variable 4: Firebase Project ID

- **Variable name:** `VITE_FIREBASE_PROJECT_ID`
- **Maps to:** `projectId` in Firebase config
- **Value:** Your Firebase project ID
- **Environment:** Production (and Preview)

#### Variable 5: Firebase Storage Bucket

- **Variable name:** `VITE_FIREBASE_STORAGE_BUCKET`
- **Maps to:** `storageBucket` in Firebase config
- **Value:** `your-project-id.firebasestorage.app`
- **Environment:** Production (and Preview)

#### Variable 6: Firebase Messaging Sender ID

- **Variable name:** `VITE_FIREBASE_MESSAGING_SENDER_ID`
- **Maps to:** `messagingSenderId` in Firebase config
- **Value:** Your messaging sender ID (numeric)
- **Environment:** Production (and Preview)

#### Variable 7: Firebase App ID

- **Variable name:** `VITE_FIREBASE_APP_ID`
- **Maps to:** `appId` in Firebase config
- **Value:** Your Firebase app ID (format: `1:xxxxx:web:xxxxx`)
- **Environment:** Production (and Preview)

#### Variable 8: Firebase Measurement ID (Optional - for Analytics)

- **Variable name:** `VITE_FIREBASE_MEASUREMENT_ID`
- **Maps to:** `measurementId` in Firebase config
- **Value:** Your Google Analytics measurement ID (format: `G-XXXXXXXXXX`)
- **Environment:** Production (and Preview)
- **Note:** Only needed if you're using Firebase Analytics

### 3. Save and Redeploy

After adding all variables:

1. Click **"Save"** for each variable
2. Go back to the **Deployments** tab
3. Click **"Retry deployment"** on your latest deployment OR
4. Push a new commit to trigger automatic redeployment

---

## Environment Variable Template

Copy this template and replace with your actual Firebase values from your `.env` file:

```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

> **Note:** Your actual values are in your local `.env` file. Copy them from there to Cloudflare Pages.

---

## Important Notes

### Security

- These Firebase credentials are **safe to expose** in client-side code
- Firebase security relies on **Realtime Database Rules**, not hidden credentials
- The API key is just for connecting - it's not a secret
- Your database rules control what users can read/write

### Local Development

- A `.env` file has been created for local testing
- This file is in `.gitignore` and won't be committed
- Run `npm run dev` to test locally with these credentials

### Firebase Realtime Database Rules

Make sure you've set up your database rules in Firebase Console:

```json
{
  "rules": {
    "sessions": {
      ".read": true,
      "$sessionId": {
        ".write": true
      }
    },
    "players": {
      "$sessionId": {
        "$playerId": {
          ".read": true,
          ".write": true
        }
      }
    },
    "aggregated": {
      ".read": true,
      ".write": false
    }
  }
}
```

---

## Testing After Deployment

1. Wait for Cloudflare Pages to rebuild (2-3 minutes)
2. Visit your production URL
3. Open browser DevTools Console (F12)
4. You should see no Firebase errors
5. Try playing the game - the Coherence Meter should update in real-time

---

## Troubleshooting

### "Firebase FATAL ERROR: Can't determine Firebase Database URL"

This error means the environment variables were not available during the build. To fix:

1. **Verify variables are set in Cloudflare Pages Dashboard:**
   - Go to Pages → Your Project → Settings → Environment variables
   - Ensure ALL variables are set for **Production** (not just Preview)
   - Double-check `VITE_FIREBASE_DATABASE_URL` specifically

2. **Trigger a NEW build after setting variables:**
   - Go to Deployments tab
   - Click "Retry deployment" on the latest deployment, OR
   - Push a new commit to trigger automatic rebuild
   - **The build must happen AFTER variables are set**

3. **Check the build logs:**
   - In Deployments, click on your latest deployment
   - Check the build output for any errors
   - Verify `vite build` completed successfully

4. **Verify in browser console:**
   - Open DevTools (F12) on your deployed site
   - Look for "Firebase config check:" log message
   - All values should show `true` - if any show `false`, that variable is missing

### "Firebase not initialized" error

- Check that all 7 environment variables are added
- Make sure variable names start with `VITE_` (required by Vite)
- Redeploy after adding variables

### Game works locally but not on Cloudflare

- Verify environment variables are set for **Production** environment
- Check Cloudflare Pages build log for errors
- Ensure database URL includes `https://`
- **Check that no `wrangler.toml` file exists** - if present, Cloudflare ignores dashboard env vars

### Coherence meter not updating

- Go to Firebase Console → Realtime Database
- Check that database rules allow `.read` and `.write`
- Try refreshing the page and playing again

---

> **Your Firebase is now configured! 🎉**

The Body is One.
