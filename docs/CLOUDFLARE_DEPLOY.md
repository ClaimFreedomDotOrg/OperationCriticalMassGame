# Cloudflare Pages Deployment Guide

## Automatic Deployment Setup

This project is configured for automatic deployment to Cloudflare Pages at **tamethedemon.com**.

### Cloudflare Pages Configuration

When connecting this repository to Cloudflare Pages, use these settings:

**Build Configuration:**

- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave default)

**Environment Variables:**
If using Firebase for multiplayer, add these in Cloudflare Pages settings:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Then update `src/config/firebase.js` to use these environment variables:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

### Node.js Version

The project uses Node.js 18 (specified in `.node-version` and `.nvmrc`).

### Custom Domain Setup

1. In Cloudflare Pages dashboard, go to your project
2. Navigate to **Custom domains**
3. Add `tamethedemon.com`
4. Add `www.tamethedemon.com` (optional)
5. Cloudflare will automatically configure DNS if the domain is on Cloudflare

### Deployment Workflow

Once connected:

1. Push to `main` branch → Automatic production deployment to tamethedemon.com
2. Push to other branches → Preview deployments with unique URLs

### Single-Player Mode

Single-player mode works completely offline and requires no Firebase configuration. Players can start playing immediately without any setup.

### Multiplayer Mode

For multiplayer functionality:

1. Create a Firebase project at <https://console.firebase.google.com/>
2. Enable Realtime Database
3. Configure Firebase security rules (see main README)
4. Add environment variables to Cloudflare Pages
5. Update `src/config/firebase.js` to use environment variables

### Build Verification

Test locally before deploying:

```bash
npm run build
npm run preview
```

Visit `http://localhost:4173` to verify the production build.

### Troubleshooting

**Build fails:**

- Check Node.js version is 18+
- Verify all dependencies are in `package.json`
- Check build logs in Cloudflare Pages dashboard

**Blank page after deployment:**

- Check browser console for errors
- Verify `dist/index.html` exists after build
- Check that asset paths are correct (should be relative)

**Firebase not connecting:**

- Verify environment variables are set correctly
- Check Firebase console for CORS settings
- Verify Realtime Database rules allow client access

### Performance

Cloudflare Pages provides:

- ✅ Global CDN with 200+ data centers
- ✅ Automatic HTTPS
- ✅ Unlimited bandwidth
- ✅ Instant cache invalidation
- ✅ DDoS protection
- ✅ Built-in analytics

Expected performance:

- First byte: < 50ms (global average)
- Page load: < 1s on 4G
- Supports thousands of concurrent players

---

**The Body is One.**
