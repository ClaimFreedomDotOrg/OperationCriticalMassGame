/**
 * Operation: Critical Mass - Game Configuration
 *
 * Core constants and configuration for game mechanics.
 * All timing values are scientifically calibrated for optimal neurophysiological effect.
 */

export const GAME_CONFIG = {
  // Game States
  STATES: {
    IDLE: 'IDLE',
    PLAYING: 'PLAYING',
    BREAKTHROUGH: 'BREAKTHROUGH',
  },

  // Bilateral Stimulation Configuration
  BPM: 60, // Beats per minute (matches comfortable heart rate)
  TAP_WINDOW_MS: 150, // ±150ms window for "in sync" (based on EMDR research)
  BEAT_INTERVAL_MS: 1000, // Calculated from BPM (60 BPM = 1000ms)

  // Thought Bubble (Attack) Configuration
  INFECTION_SPAWN_INTERVAL: 5000, // New thought every 5 seconds
  INFECTION_DURATION: 8000, // Bubble exists for 8 seconds
  MIN_SWIPE_DISTANCE: 100, // Minimum pixels for valid swipe
  MAX_SWIPE_TIME: 500, // Maximum milliseconds for valid swipe

  // Coherence Thresholds
  COHERENCE_THRESHOLDS: {
    LOW: 30, // Below this = struggling
    MEDIUM: 70, // Above this = momentum building
    HIGH: 90, // Above this = near breakthrough
    BREAKTHROUGH: 100, // Critical mass achieved
  },

  // Visual Feedback Timing
  FEEDBACK_DURATION: 300, // How long to show HIT/MISS feedback
  CELL_TRANSITION_DURATION: 300, // Cell color transition time

  // Audio Configuration
  AUDIO: {
    MASTER_VOLUME: 0.7,
    TAP_VOLUME: 0.5,
    MISS_VOLUME: 0.3,
    BREAKTHROUGH_VOLUME: 1.0,
  },

  // Z-Index Layers (Established Hierarchy)
  Z_INDEX: {
    BACKGROUND_CELLS: 0,
    UI_CONTAINERS: 10,
    CONTROLS: 20,
    HEADER: 30,
    INFECTIONS: 40,
    VISUAL_TAPS: 50,
  },
};

/**
 * Words of The Voice - Intrusive thoughts that disrupt flow
 *
 * These represent universal patterns of Default Mode Network rumination:
 * - Self-referential negative evaluation (mPFC hyperactivity)
 * - Amygdala-based threat simulation
 * - Temporal displacement from present moment
 */
export const WORDS_OF_THE_VOICE = [
  'Not Enough',
  'Fear',
  'Anxiety',
  'Past',
  'Future',
  'Failure',
  'Doom',
  'Regret',
  'Worry',
  'Shame',
  'Doubt',
  'Alone',
];

/**
 * Performance optimization constants
 * Critical: Game must handle thousands of simultaneous users
 */
export const PERFORMANCE = {
  FIREBASE_THROTTLE_MS: 200, // Batch player updates every 200ms
  CANVAS_FPS_TARGET: 60, // Target frame rate
  MAX_PARTICLES: 1000, // Maximum particles for visual effects
  CELL_RENDER_BATCH_SIZE: 100, // Render cells in batches
};

export default GAME_CONFIG;
