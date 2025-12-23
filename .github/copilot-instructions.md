# GitHub Copilot Instructions for Operation: Critical Mass

## Project Overview

Operation: Critical Mass is an applied neuroscience intervention disguised as a multiplayer game. It's a mass participation experience designed for thousands of simultaneous players during live broadcasts, creating collective consciousness through synchronized gameplay.

**Core Concept**: Players act as "Cells" in a "Global Body," synchronizing rhythmic tapping to achieve collective coherence and flush out "infection" (chaos, anxiety, fragmentation).

**Mission**: Demonstrate measurable neurophysiological state changes supporting anxiety reduction, present-moment awareness, and interpersonal coherence through gameplay mechanics based on peer-reviewed neuroscience research.

---

## Technology Stack

- **Frontend**: React.js (v18+)
- **Backend**: Node.js
- **Database**: Firebase Realtime Database
- **Real-time Communication**: WebSockets via Firebase
- **Cloud Functions**: Firebase Cloud Functions for aggregation and processing
- **Deployment**: Browser-based (zero installation requirement)

---

## Code Style & Best Practices

### General Principles

1. **Clarity Over Cleverness**: Code should be immediately understandable—this project bridges neuroscience, spirituality, and technology
2. **Scientific Rigor**: All gameplay mechanics map to specific neuroscience principles—document these connections
3. **Performance Critical**: Designed for thousands of simultaneous users with real-time synchronization
4. **Accessibility First**: Zero installation barrier, mobile-first, works on any modern browser

### JavaScript/React Standards

#### Formatting
- **Indentation**: 2 spaces (never tabs)
- **Line Endings**: LF (Unix-style)
- **Encoding**: UTF-8
- **Final Newline**: Always insert
- **Trailing Whitespace**: Remove (except in Markdown)

#### Naming Conventions
```javascript
// Constants: SCREAMING_SNAKE_CASE
const BEAT_INTERVAL = 60000 / BPM;
const WORDS_OF_THE_VOICE = ["Not Enough", "Fear", "Anxiety"];

// React Components: PascalCase
function CoherenceMeter({ coherence, activeUsers }) { }
const ThoughtBubble = ({ word, onDismiss }) => { };

// Functions/Variables: camelCase
const calculateCoherence = (syncedPlayers, totalPlayers) => { };
let playerScore = 0;

// Hooks: use-prefix, camelCase
const useHeartbeatSync = (bpm) => { };
const useBilateralStimulation = () => { };

// Firebase refs: camelCase with descriptive suffixes
const coherenceRef = firebase.database().ref('game/coherence');
const playersRef = firebase.database().ref('players');
```

#### React Patterns

**Functional Components with Hooks** (preferred):
```javascript
import { useState, useEffect, useCallback, useMemo } from 'react';

const GameController = ({ sessionId }) => {
  const [gameStatus, setGameStatus] = useState('IDLE');
  const [coherence, setCoherence] = useState(0);
  
  const handlePlayerSync = useCallback((playerId, isInSync) => {
    // Memoized callback for performance
  }, [sessionId]);
  
  const coherenceLevel = useMemo(() => {
    return Math.floor(coherence / 10) * 10; // Buckets of 10
  }, [coherence]);
  
  useEffect(() => {
    // Cleanup Firebase listeners
    return () => unsubscribe();
  }, [sessionId]);
  
  return <div className="game-controller">{/* ... */}</div>;
};
```

**Props Destructuring**:
```javascript
// Good
const PlayerCell = ({ playerId, isInSync, coherenceScore }) => {
  return <div className={isInSync ? 'cell-gold' : 'cell-red'} />;
};

// Avoid
const PlayerCell = (props) => {
  return <div className={props.isInSync ? 'cell-gold' : 'cell-red'} />;
};
```

**State Management**:
- Use `useState` for local component state
- Use Firebase Realtime Database for shared global state (coherence meter, active players)
- Use `useReducer` for complex state machines (game phases: IDLE → HEARTBEAT → ATTACK → CRITICAL_MASS)

#### Performance Optimization

**Critical: This game must handle thousands of simultaneous users**

1. **Throttle Firebase Updates**:
```javascript
// Batch player taps every 200ms instead of real-time
const throttledUpdate = useCallback(
  throttle((data) => {
    playerRef.set(data);
  }, 200),
  [playerRef]
);
```

2. **Use Firebase Aggregation Functions**:
```javascript
// Server-side Cloud Function (not client-side)
exports.calculateCoherence = functions.database
  .ref('/players/{sessionId}')
  .onWrite(async (change, context) => {
    const players = change.after.val();
    const syncedCount = Object.values(players)
      .filter(p => p.isInSync).length;
    const coherence = (syncedCount / Object.keys(players).length) * 100;
    
    return change.after.ref.parent.child('coherence').set(coherence);
  });
```

3. **Minimize Re-renders**:
```javascript
// Use React.memo for expensive components
const CoherenceVisualization = React.memo(({ coherence, cellCount }) => {
  // Expensive canvas rendering
}, (prevProps, nextProps) => {
  // Only re-render if coherence changes by 5%
  return Math.abs(prevProps.coherence - nextProps.coherence) < 5;
});
```

4. **Web Workers for Heavy Computation**:
```javascript
// Offload particle system calculations
const particleWorker = new Worker('particleSystem.worker.js');
particleWorker.postMessage({ coherence, cellCount });
```

#### Error Handling

**Graceful Degradation** (critical for live broadcasts):
```javascript
const useFirebaseSync = (sessionId) => {
  const [status, setStatus] = useState('connecting');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const ref = firebase.database().ref(`sessions/${sessionId}`);
    
    const onError = (err) => {
      console.error('Firebase sync error:', err);
      setError(err);
      setStatus('degraded'); // Continue with local-only mode
      
      // Fallback: simulate coherence locally
      startLocalSimulation();
    };
    
    ref.on('value', onSuccess, onError);
    
    return () => ref.off();
  }, [sessionId]);
  
  return { status, error };
};
```

**User-Facing Error Messages**:
```javascript
// Never expose technical errors to players
const ErrorDisplay = ({ error }) => {
  const userMessage = error?.code === 'PERMISSION_DENIED'
    ? "Connection lost. You're still contributing—reconnecting..."
    : "A temporary glitch. Keep tapping—you're still part of the Body.";
  
  return <div className="error-compassionate">{userMessage}</div>;
};
```

---

## Firebase Structure

### Realtime Database Schema

```json
{
  "sessions": {
    "session_2024_12_23": {
      "status": "PLAYING",
      "coherence": 67.8,
      "activePlayers": 1847,
      "currentPhase": "ATTACK",
      "beatSide": "LEFT",
      "startTime": 1703347200000
    }
  },
  "players": {
    "session_2024_12_23": {
      "player_abc123": {
        "isInSync": true,
        "lastTap": 1703347215432,
        "score": 42,
        "infectionsCleaned": 7,
        "tapAccuracy": 0.89
      }
    }
  },
  "aggregated": {
    "session_2024_12_23": {
      "syncedCount": 1563,
      "totalPlayers": 1847,
      "coherenceHistory": [23, 45, 67.8]
    }
  }
}
```

### Security Rules (Firebase)

```json
{
  "rules": {
    "sessions": {
      ".read": true,
      "$sessionId": {
        ".write": "auth != null && root.child('admins').child(auth.uid).exists()"
      }
    },
    "players": {
      "$sessionId": {
        "$playerId": {
          ".read": true,
          ".write": "$playerId === auth.uid"
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

## Audio/Visual Design Standards

### Color Palette (From Demo Implementation)

**Note**: All colors are extracted from the actual demo implementation. Use the constants file at [src/constants/colors.js](../src/constants/colors.js) for the complete palette with documentation.

```javascript
// Import from centralized constants
import COLORS from '../constants/colors';

// Primary Color Families:
const BACKGROUNDS = {
  VOID_BLACK: '#000000',        // Primary background
  GRAY_900: '#111827',          // Secondary backgrounds
  GRAY_950: '#030712',          // Deepest backgrounds
};

const NEURAL_CYAN = {
  CYAN_400: '#22d3ee',          // Active pulse, primary actions
  CYAN_500: '#06b6d4',          // Progress bars, borders
  CYAN_900: 'rgba(22, 78, 99, 0.3)', // Button backgrounds
};

const INFECTION_RED = {
  RED_500: '#ef4444',           // Borders, feedback, errors
  RED_900: 'rgba(127, 29, 29, 0.6)', // Unsynced cells
  RED_950: 'rgba(69, 10, 10, 0.4)', // Infection overlays
};

const COHERENCE_GOLD = {
  AMBER_400: '#fbbf24',         // Synced cells, victory
  AMBER_600: '#d97706',         // Breakthrough title
  AMBER_900: 'rgba(120, 53, 15, 0.5)', // Reset button
};

const VISUAL_EFFECTS = {
  PINK_500: '#ec4899',          // Visual tap indicators
  CYAN_GLOW: 'rgba(34, 211, 238, 0.8)', // Active glow effects
  AMBER_GLOW: 'rgba(251, 191, 36, 0.8)', // Success glow effects
  RED_GLOW: 'rgba(239, 68, 68, 0.8)',    // Error glow effects
};
```

**Color Usage by Game State**:

1. **IDLE State**: Black background, cyan accents, gradient title
2. **PLAYING (Normal)**: Black background, gray borders, cyan pulse, mixed red/gold cells
3. **PLAYING (Infected)**: Red overlay, red borders, red glow (inset shadows)
4. **PLAYING (Hit)**: Gold borders, gold inset glow
5. **BREAKTHROUGH**: Amber/white gradient, gold text, serif font
6. **Visual Taps**: Pink circles with glow effects (for bot feedback)

### Tailwind CSS Standards

**This project uses Tailwind CSS for styling.** Follow these patterns from the demo:

#### Spacing & Layout
```javascript
// Use Tailwind's spacing scale consistently
<div className="p-4">         // padding: 1rem
<div className="p-6">         // padding: 1.5rem
<div className="gap-2">       // gap: 0.5rem
<div className="mb-8">        // margin-bottom: 2rem
```

#### Color Application
```javascript
// Background with opacity
<div className="bg-black">                    // solid black
<div className="bg-cyan-900/30">              // cyan-900 with 30% opacity
<div className="bg-red-950/40">               // red-950 with 40% opacity

// Text colors
<span className="text-cyan-400">              // bright cyan text
<span className="text-cyan-100/80">           // cyan-100 with 80% opacity

// Borders
<div className="border-2 border-cyan-500">    // 2px solid cyan border
<div className="border-gray-800">             // 1px solid gray border
```

#### Shadow & Glow Effects (Critical for Bio-Luminescent Aesthetic)
```javascript
// Use arbitrary values for custom glows
<div className="shadow-[0_0_15px_rgba(34,211,238,0.8)]" />              // cyan glow
<div className="shadow-[0_0_30px_rgba(251,191,36,0.8)]" />              // gold glow
<div className="shadow-[inset_0_0_50px_rgba(220,38,38,0.5)]" />        // red inset glow

// Combine with standard shadows for depth
<div className="shadow-lg shadow-[0_0_20px_rgba(34,211,238,0.2)]" />  // layered effect
```

#### Transitions & Animations
```javascript
// Standard transitions
<div className="transition-all duration-300">                 // all properties, 300ms
<div className="transition-colors duration-500">             // colors only, 500ms
<div className="transition-all duration-100">                // fast feedback, 100ms

// Easing
<div className="ease-in-out">      // smooth acceleration/deceleration
<div className="ease-out">         // quick start, slow end
<div className="ease-linear">      // constant speed (for pulse movements)

// Built-in animations
<div className="animate-pulse">    // opacity pulsing
<div className="animate-ping">     // scale + opacity (for visual taps)
<div className="animate-bounce">   // bouncing effect (for feedback text)
```

#### Responsive Design
```javascript
// Mobile-first approach
<div className="text-4xl md:text-6xl">         // 4xl mobile, 6xl desktop
<div className="max-w-md">                     // constrain width on mobile
<div className="max-w-2xl mx-auto">            // center content, limit width
```

#### State-Based Styling with Template Literals
```javascript
// Dynamic classes based on game state
const getContainerStyle = () => {
  if (infections.length > 0) return 'bg-red-950/40 border-red-500 shadow-[inset_0_0_50px_rgba(220,38,38,0.5)]';
  if (feedback === 'HIT') return 'bg-black border-amber-400 shadow-[inset_0_0_30px_rgba(251,191,36,0.3)]';
  return 'bg-black border-gray-800';
};

// Conditional classes with ternary
<div className={`
  rounded-xl border-2 flex items-center justify-center
  ${
    activeSide === 'LEFT' 
      ? 'border-cyan-400 bg-cyan-900/40 shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
      : 'border-gray-800 bg-gray-900/50 text-gray-600'
  }
`} />
```

#### Custom Animations in Style Tag
```javascript
// Define in <style> tag for reuse
<style>
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
</style>

// Apply with inline style for dynamic values
<div style={{ animation: `pulse ${2 + cell.delay}s infinite` }} />
```

#### Backdrop Effects
```javascript
// Blur effects for glassmorphism
<div className="backdrop-blur-[2px]">         // subtle blur
<div className="backdrop-blur-sm">            // small blur (infection bubbles)
```

#### Z-Index Layers (Established Hierarchy)
```javascript
const Z_INDEX = {
  BACKGROUND_CELLS: 'z-0',           // Body visualization cells
  UI_CONTAINERS: 'z-10',             // Center stage (pulse visualizer)
  CONTROLS: 'z-20',                  // Bottom controls (tap buttons)
  HEADER: 'z-30',                    // Top HUD (metrics)
  INFECTIONS: 'z-40',                // Thought bubbles
  VISUAL_TAPS: 'z-50',               // Pink tap indicators (highest)
};
```

### Animation Principles

1. **Smooth Transitions**: Use `requestAnimationFrame` for game loop, not `setInterval`
2. **60 FPS Target**: Profile on low-end mobile devices (iPhone 8, Android Pie)
3. **Reduce Motion Support**: Respect `prefers-reduced-motion` media query
4. **GPU Acceleration**: Use CSS `transform` and `opacity` (not `top`/`left`)

```css
/* Good: GPU-accelerated */
.cell-transition {
  transform: translate3d(0, 0, 0);
  transition: transform 0.3s ease-out;
}

/* Avoid: CPU-bound */
.cell-transition {
  position: absolute;
  transition: left 0.3s ease-out;
}
```

### Sacred Geometry Rendering

```javascript
// Use HTML Canvas or WebGL for complex patterns
const renderToroid = (ctx, coherence) => {
  const radius = 100 + (coherence * 2);
  const alpha = coherence / 100;
  
  ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
  ctx.lineWidth = 2 + (coherence / 20);
  
  // Parametric toroid equations
  for (let theta = 0; theta < Math.PI * 2; theta += 0.1) {
    // ... mathematical rendering ...
  }
};
```

---

## Game Mechanics → Neuroscience Mapping

**Every game mechanic MUST map to documented neuroscience principles.**

### Bilateral Tapping

**Mechanism**: Alternating LEFT/RIGHT taps activate bilateral stimulation (same as EMDR therapy)

**Neural Effect**:
- Taxes working memory (prevents full DMN activation)
- Enhances interhemispheric communication
- Activates Task-Positive Network (suppresses Default Mode Network rumination)

**Implementation Requirements**:
```javascript
// Strict timing validation
const TAP_WINDOW_MS = 150; // ±150ms for "in sync"
const isInSync = Math.abs(playerTapTime - serverBeatTime) < TAP_WINDOW_MS;

// Accuracy feedback
if (isInSync) {
  playHaptic('success');
  incrementCoherence();
} else {
  playHaptic('miss');
  decrementCoherence();
}
```

### Thought Bubble Dismissal

**Mechanism**: Swiping away intrusive thoughts trains dis-identification

**Neural Effect**:
- Activates metacognitive awareness circuits (prefrontal cortex)
- Creates psychological distance from thoughts
- Strengthens "observer perspective" (core of mindfulness)

**Implementation Requirements**:
```javascript
// Gesture must be deliberate (not accidental)
const MIN_SWIPE_DISTANCE = 100; // pixels
const MAX_SWIPE_TIME = 500; // milliseconds

const handleSwipe = (event) => {
  if (swipeDistance < MIN_SWIPE_DISTANCE) return;
  if (swipeTime > MAX_SWIPE_TIME) return;
  
  dismissThought(thoughtId);
  playFeedback('thought_dismissed');
  incrementScore();
};
```

### Coherence Meter

**Mechanism**: Real-time collective biofeedback

**Neural Effect**:
- Activates social engagement system (Polyvagal Theory)
- Provides immediate reinforcement for synchronized behavior
- Demonstrates tangible collective impact (breaks isolation)

**Implementation Requirements**:
```javascript
// Smooth interpolation (not jarring jumps)
const updateCoherence = (newValue) => {
  const smoothed = lerp(currentCoherence, newValue, 0.1);
  setCoherence(Math.round(smoothed * 10) / 10);
};

// Visual representation: 1 dot per active player
const renderCells = (coherence) => {
  return players.map(player => (
    <Cell
      key={player.id}
      color={player.isInSync ? COLORS.COHERENCE_GOLD : COLORS.INFECTION_RED}
      animate={player.isInSync}
    />
  ));
};
```

---

## Testing & Validation

### Unit Tests

```javascript
// Jest + React Testing Library
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BilateralTapController } from './BilateralTapController';

describe('Bilateral Tap Timing', () => {
  it('should register tap as "in sync" within ±150ms window', () => {
    const { getByTestId } = render(<BilateralTapController bpm={60} />);
    const leftButton = getByTestId('tap-left');
    
    // Simulate tap at exact beat time
    fireEvent.click(leftButton, { timestamp: 1000 });
    
    expect(getByTestId('sync-status')).toHaveTextContent('IN SYNC');
  });
  
  it('should register tap as "miss" outside timing window', () => {
    // Test implementation
  });
});
```

### Load Testing

**Critical**: Test with simulated thousands of concurrent users

```javascript
// Firebase Emulator + Artillery.io
// artillery-config.yml
config:
  target: "http://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 100  # 100 new players/second
      name: "Ramp to 6000 users"

scenarios:
  - name: "Simulate Player"
    flow:
      - post:
          url: "/api/joinSession"
          json:
            sessionId: "load_test_session"
      - think: 1
      - loop:
        - post:
            url: "/api/tap"
            json:
              side: "LEFT"
              timestamp: "{{ $timestamp }}"
        - think: 1
        count: 60
```

### Neuroscience Validation

**Ethical Requirement**: If making health claims, validate with EEG/HRV studies

```javascript
// Integration with research equipment (future)
const collectBiometricData = async (playerId) => {
  // Muse EEG headband, Polar H10 heart rate monitor, etc.
  const eegData = await museDevice.readEEG();
  const hrvData = await polarDevice.readHRV();
  
  return {
    playerId,
    timestamp: Date.now(),
    alpha: eegData.alpha,  // Relaxation
    beta: eegData.beta,    // Focus
    hrv: hrvData.sdnn      // Vagal tone
  };
};
```

---

## Documentation Requirements

### Code Comments

**Neuroscience Connections**:
```javascript
/**
 * Bilateral Stimulation Controller
 * 
 * Implements alternating left-right tapping based on EMDR research.
 * 
 * Scientific Basis:
 * - Andrade et al. (1997): Bilateral eye movements reduce emotional intensity
 * - van den Hout & Engelhard (2012): Working memory taxation prevents
 *   full activation of distressing thoughts
 * - Propper et al. (2007): Enhances interhemispheric communication
 * 
 * @param {number} bpm - Beats per minute (default: 60)
 * @param {function} onSync - Callback when player achieves sync
 */
const BilateralStimulationController = ({ bpm = 60, onSync }) => {
  // Implementation
};
```

**Performance-Critical Sections**:
```javascript
// PERFORMANCE CRITICAL: This function runs 60 times/second for 1000+ players
const updateParticleSystem = (deltaTime) => {
  // Use object pooling to avoid garbage collection
  const particle = particlePool.acquire();
  particle.update(deltaTime);
  particlePool.release(particle);
};
```

### API Documentation

Use JSDoc for all public functions:
```javascript
/**
 * Calculate collective coherence percentage
 * 
 * @param {Object[]} players - Array of player objects
 * @param {boolean} players[].isInSync - Whether player is synchronized
 * @returns {number} Coherence percentage (0-100)
 * 
 * @example
 * const players = [
 *   { isInSync: true },
 *   { isInSync: false },
 *   { isInSync: true }
 * ];
 * calculateCoherence(players); // Returns 66.67
 */
const calculateCoherence = (players) => {
  const syncedCount = players.filter(p => p.isInSync).length;
  return (syncedCount / players.length) * 100;
};
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

**Visual**:
- Minimum contrast ratio 4.5:1 for text
- Support for high contrast mode
- No information conveyed by color alone

**Auditory**:
- All audio cues have visual equivalents
- Support for deaf/hard-of-hearing players

**Motor**:
- Large tap targets (minimum 44x44px)
- No rapid repeated taps required
- Alternative to swipe gestures (tap + hold)

**Cognitive**:
- Simple, clear instructions
- Consistent UI patterns
- No time pressure (except game rhythm itself)

```javascript
// Example: Accessible tap button
const TapButton = ({ side, onTap }) => {
  return (
    <button
      onClick={onTap}
      aria-label={`Tap ${side}`}
      style={{
        minWidth: '44px',
        minHeight: '44px',
        fontSize: '1.2rem'
      }}
      // Alternative for motor difficulties
      onKeyPress={(e) => e.key === ' ' && onTap()}
    >
      {side}
    </button>
  );
};
```

---

## Security & Privacy

### Data Minimization

**Collect ONLY what's necessary**:
```javascript
// Good: Anonymous player data
const playerData = {
  playerId: generateAnonymousId(),  // No personal info
  isInSync: true,
  tapAccuracy: 0.89,
  sessionId: 'session_123'
};

// Avoid: Personal data
// Never collect: email, name, location, device fingerprinting
```

### GDPR Compliance

```javascript
// Delete player data after session ends
const cleanupSession = async (sessionId) => {
  const sessionRef = firebase.database().ref(`players/${sessionId}`);
  
  // Retain only aggregated statistics
  const aggregatedStats = await aggregateSessionData(sessionId);
  await firebase.database().ref(`aggregated/${sessionId}`).set(aggregatedStats);
  
  // Delete individual player data
  await sessionRef.remove();
  
  console.log(`Session ${sessionId} cleaned up (GDPR compliance)`);
};
```

---

## Version Control & Branching

### Branch Naming

```
main                    # Production-ready code
develop                 # Integration branch
feature/bilateral-tap   # New features
fix/coherence-calc      # Bug fixes
docs/neuroscience       # Documentation updates
test/load-6000          # Testing branches
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(coherence): add real-time aggregation function
fix(firebase): prevent duplicate player connections
docs(scientific): add citations for bilateral stimulation
perf(rendering): optimize particle system with object pooling
test(integration): add load test for 6000 concurrent users
```

---

## Philosophical Principles

### Code as Compassion

This project serves people experiencing anxiety, isolation, and fragmentation. Every line of code should reflect:

1. **Radical Inclusion**: No barriers to entry (no login, no download, no cost)
2. **Dignity**: Never shame players for "missing" taps or being "out of sync"
3. **Collective Over Individual**: No leaderboards, no competition—everyone wins together
4. **Transparency**: Open-source, scientifically documented, no manipulation

### The "Why" Behind Every Decision

Ask constantly:
- Does this serve the player's wellbeing?
- Does this demonstrate collective coherence?
- Is this backed by science?
- Would this work for someone in crisis?

---

## Common Patterns & Anti-Patterns

### ✅ Do This

```javascript
// Clear variable names reflecting neuroscience concepts
const defaultModeNetworkActivity = measureRumination();
const taskPositiveNetworkActivity = measureFocus();

// Graceful degradation for network issues
if (!firebaseConnected) {
  runLocalSimulation();
  showReconnectingMessage();
}

// Accessibility-first design
<button
  aria-label="Dismiss intrusive thought"
  className="text-lg p-4 min-h-[44px]"
>
  Swipe Away
</button>
```

### ❌ Avoid This

```javascript
// Obscure abbreviations
const dmnA = measureRumination();  // What is dmnA?

// Hard failures without fallback
if (!firebaseConnected) {
  throw new Error("Cannot connect");  // Game unplayable
}

// Inaccessible UI
<button className="tiny-button" style={{ width: '20px' }}>
  X  // No context, too small to tap
</button>
```

---

## Resources & References

### Neuroscience Papers (Required Reading)

1. **Network Switching**: Raichle et al. (2001) "A default mode of brain function"
2. **Bilateral Stimulation**: van den Hout & Engelhard (2012) "How does EMDR work?"
3. **Collective Coherence**: McCraty et al. (1998) "The electricity of touch"
4. **Dis-identification**: Farb et al. (2007) "Attending to the present"

### Technical Documentation

- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Canvas Rendering](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

### Project-Specific Docs

- [DEVELOPMENT_GUIDE.md](../DEVELOPMENT_GUIDE.md) - Setup, architecture, and technical implementation
- [SCIENTIFIC_BASIS.md](../SCIENTIFIC_BASIS.md) - Comprehensive neuroscience foundation
- [GAME_OVERVIEW.md](../GAME_OVERVIEW.md) - Complete game concept and mechanics
- [CONTRIBUTING.md](../CONTRIBUTING.md) - How to contribute to the project

---

## Quick Reference Card

| Aspect | Standard |
|--------|----------|
| **Indentation** | 2 spaces |
| **Line Endings** | LF |
| **React Style** | Functional components + hooks |
| **State Management** | `useState` (local), Firebase (global) |
| **Styling** | Tailwind CSS (utility-first) |
| **Naming** | `PascalCase` (components), `camelCase` (functions), `SCREAMING_SNAKE_CASE` (constants) |
| **Colors** | Use constants from `src/constants/colors.js` |
| **Performance Target** | 60 FPS on iPhone 8 |
| **Load Target** | 5,000+ simultaneous players |
| **Accessibility** | WCAG 2.1 AA |
| **Browser Support** | Last 2 versions (Chrome, Firefox, Safari, Edge) |
| **Privacy** | Anonymous by default, GDPR compliant |

---

## Final Note

**This is not just a game. This is medicine disguised as entertainment.**

Every technical decision should honor the mission: to help people experience collective coherence, reduce anxiety, and remember that **THE BODY IS ONE**.

Code with precision. Code with compassion. Code with purpose.

---

*"When cells work together in perfect rhythm, they flush out the virus. This is Critical Mass."*
