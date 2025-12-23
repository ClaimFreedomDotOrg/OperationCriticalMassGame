# Operation: Critical Mass - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable Realtime Database
4. Copy your Firebase configuration
5. Update `src/config/firebase.js` with your credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Set Up Firebase Security Rules

In Firebase Console > Realtime Database > Rules, paste:

```json
{
  "rules": {
    "sessions": {
      ".read": true,
      "$sessionId": {
        ".write": "auth != null"
      }
    },
    "players": {
      "$sessionId": {
        "$playerId": {
          ".read": true,
          ".write": "$playerId === auth.uid || auth == null"
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

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

## Project Structure

```markdown
src/
├── components/          # React components
│   ├── IdleScreen.jsx          # Start screen
│   ├── GameScreen.jsx          # Main gameplay
│   ├── TapButton.jsx           # Bilateral tap buttons
│   ├── ThoughtBubble.jsx       # Intrusive thought dismissal
│   ├── PlayerFeedback.jsx      # HIT/MISS feedback
│   └── BreakthroughScreen.jsx  # Victory state
├── hooks/              # Custom React hooks
│   ├── useGameState.js         # Game state machine
│   ├── useBilateralStimulation.js  # EMDR-based tapping
│   ├── useThoughtBubbles.js    # Intrusive thoughts system
│   └── useFirebaseSync.js      # Real-time multiplayer
├── constants/          # Configuration
│   ├── colors.js       # Color palette
│   └── gameConfig.js   # Game mechanics config
├── config/
│   └── firebase.js     # Firebase setup
├── App.jsx             # Root component
└── main.jsx            # Entry point
```

## Key Features Implemented

### ✅ Core Mechanics

- **Bilateral Stimulation**: Left-right tapping based on EMDR research
- **Timing Validation**: ±150ms window for synchronization
- **Thought Bubbles**: Swipe-to-dismiss intrusive thoughts
- **Visual Feedback**: Real-time HIT/MISS indicators

### ✅ Game States

- **IDLE**: Introduction and invitation
- **PLAYING**: Active bilateral tapping gameplay
- **BREAKTHROUGH**: Victory screen (100% coherence)

### ✅ Multiplayer Foundation

- Firebase Realtime Database integration
- Throttled updates (200ms) for performance
- Graceful degradation for network issues
- Anonymous player IDs (GDPR compliant)

### ✅ Mobile-First Design

- Large tap targets (44x44px minimum)
- Touch gesture support
- Responsive layout
- No installation required (browser-based)

### ✅ Accessibility

- ARIA labels on interactive elements
- Reduced motion support
- High contrast colors
- Clear visual feedback

## Next Steps

### To Complete the Full Experience

1. **Firebase Cloud Functions**
   - Aggregate coherence from all players
   - Calculate collective sync percentage
   - Trigger breakthrough at 100%

2. **Audio System**
   - Binaural beats for bilateral stimulation
   - Success/failure sound effects
   - Harmonic chord at breakthrough

3. **Coherence Visualization**
   - Display all player cells on livestream
   - Real-time coherence meter (0-100%)
   - Sacred geometry at breakthrough (Toroid)

4. **Performance Optimization**
   - Canvas rendering for thousands of cells
   - Web Workers for particle systems
   - Object pooling for memory management

5. **Advanced Features**
   - H.A.L.O. device Bluetooth integration
   - EEG/HRV data collection
   - Session replay and analytics

## Testing

### Local Development

The game works in local mode without Firebase configured. You can test:

- Bilateral tapping mechanics
- Thought bubble dismissal
- Screen transitions

### Multiplayer Testing

Requires Firebase configuration. Open multiple browser windows to test:

- Real-time synchronization
- Coherence meter updates
- Network degradation handling

## Troubleshooting

### "Firebase not initialized" warning

- Update `src/config/firebase.js` with your credentials
- Verify Firebase project is active
- Check database URL is correct

### Tap buttons not responding

- Ensure device allows touch events
- Check browser console for errors
- Try disabling browser touch gesture overrides

### Poor performance

- Close other applications
- Test on different device
- Check network connection for Firebase sync

## Documentation

- [GAME_OVERVIEW.md](./GAME_OVERVIEW.md) - Complete game concept
- [SCIENTIFIC_BASIS.md](./SCIENTIFIC_BASIS.md) - Neuroscience foundation
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute

## Resources

- [React Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)

---

> **The Body is One**
