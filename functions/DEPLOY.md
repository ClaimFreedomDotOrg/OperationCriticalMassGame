# Quick Start: Deploy Cloud Functions for Scalability

## Prerequisites

- Firebase project already configured (you have this)
- Firebase Blaze plan (pay-as-you-go, required for Cloud Functions)

## 5-Minute Deployment

```bash
# 1. Install Firebase CLI globally
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize functions (from project root)
cd c:\Users\travi\Documents\git_repos\OperationCriticalMassGame
firebase init functions

# When prompted:
# - Use existing project (select your Firebase project)
# - Language: JavaScript
# - ESLint: No (optional)
# - Install dependencies: Yes

# 4. The functions/ folder already has the code, just install dependencies
cd functions
npm install

# 5. Deploy to Firebase
firebase deploy --only functions

# Expected output:
# ✔ functions[updateCoherence]: Successful create operation
# ✔ functions[cleanupInactiveSessions]: Successful create operation
# ✔ functions[trackPlayerJoin]: Successful create operation
```

## Verify Deployment

```bash
# Check function status
firebase functions:list

# Watch logs in real-time
firebase functions:log --only updateCoherence

# Test with game
# Open multiplayer game, tap buttons
# You should see logs: "Session xxx: Y/Z synced = N% coherence"
```

## Disable Client-Side Calculation (Optional)

After Cloud Functions are working, optionally disable redundant client calculation:

**In `src/hooks/useFirebaseSync.js`:**

```javascript
// Comment out or remove this entire useEffect:
/*
useEffect(() => {
  if (connectionStatus !== 'connected' || !sessionId || !db.database) {
    return;
  }
  // ... coherence calculation code
}, [connectionStatus, sessionId]);
*/
```

## Cost Monitoring

**Firebase Console > Functions > updateCoherence:**

- Invocations: Should match player tap rate
- Execution time: Should be < 100ms
- Memory usage: Should be < 256 MB
- Errors: Should be 0%

> **First 2 million invocations/month = FREE**

## Rollback if Needed

```bash
# If something goes wrong, rollback
firebase functions:delete updateCoherence
firebase functions:delete cleanupInactiveSessions
firebase functions:delete trackPlayerJoin

# Client-side calculation will continue working
```

## That's It

Your game is now ready for thousands of concurrent players. 🎮🚀
