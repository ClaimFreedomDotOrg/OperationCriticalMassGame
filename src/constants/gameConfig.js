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
  BUBBLE_DISMISS_DELAY: 300, // 300ms delay before bubble starts fading (user feedback)
  BUBBLE_FADE_DURATION: 300, // 300ms fade-out animation duration

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
    BREAKTHROUGH_VOLUME: 0.6,
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
 *
 * Designed to be viscerally attacking and self-critical to create
 * a more impactful dis-identification training experience.
 */
export const WORDS_OF_THE_VOICE = [
  "You're Not Good Enough",
  "You're Out of Sync",
  "You'll Never Be Good at This",
  "You Should Just Give Up",
  "Everyone Else Is Better",
  "You're Failing Again",
  "You Always Mess This Up",
  "You're Not Smart Enough",
  "They're All Judging You",
  "You're Wasting Your Time",
  "You're Letting Everyone Down",
  "You'll Never Succeed",
  "You're Too Slow",
  "You're Not Trying Hard Enough",
  "You're Making a Fool of Yourself",
  "You Can't Do Anything Right",
  "Why Even Bother?",
  "You're Hopeless",
  "You're Such a Disappointment",
  "Nobody Believes in You",
  "You're Going to Fail",
  "You're Embarrassing Yourself",
  "You're Not Worth It",
  "You Don't Deserve This",
  "You're Weak",
  "You're Pathetic",
  "You're Falling Behind",
  "You're Not Like Them",
  "You'll Never Fit In",
  "You're Broken",
  "You're Defective",
  "Something's Wrong with You",
  "You Can't Handle This",
  "You're Incompetent",
  "You're a Fraud",
  "They See Right Through You",
  "You're Worthless",
  "You're Incapable",
  "You Don't Belong Here",
  "You're Being Left Behind",
  "You're a Burden",
  "You're Useless",
  "You're an Imposter",
  "You're Just Pretending",
  "You've Already Lost",
  "You're Unworthy",
  "You're Inadequate",
  "You're a Joke",
  "Nobody Respects You",
  "You're a Loser",
  "You're Going to Screw This Up",
  "You Can't Keep Up",
  "You're Overwhelmed",
  "You're Drowning",
  "You're Trapped",
  "You're Stuck",
  "This Is Too Hard for You",
  "You Lack What It Takes",
  "You're Second-Rate",
  "You're Below Average",
  "You're Mediocre at Best",
  "You've Peaked",
  "It's All Downhill from Here",
  "You're Past Your Prime",
  "You Missed Your Chance",
  "It's Too Late for You",
  "You're Behind Schedule",
  "You're Running Out of Time",
  "You're Never Going to Catch Up",
  "You're Destined to Fail",
  "You're Not Cut Out for This",
  "You Lack Talent",
  "You're Ordinary",
  "You're Forgettable",
  "You're Insignificant",
  "Nobody Cares About You",
  "You're Invisible",
  "You Don't Matter",
  "Your Efforts Are Pointless",
  "Nothing You Do Makes a Difference",
  "You're Irrelevant",
  "You're Getting Worse",
  "You're Regressing",
  "You Peaked Too Early",
  "You're in Decline",
  "You're Losing Control",
  "You're Coming Apart",
  "You Can't Trust Yourself",
  "You're Your Own Worst Enemy",
  "You Self-Sabotage Everything",
  "You Always Quit",
  "You Have No Willpower",
  "You're Lazy",
  "You're Undisciplined",
  "You Lack Focus",
  "You Can't Concentrate",
  "Your Mind Is Scattered",
  "You're Distracted",
  "You're Unfocused",
  "You Can't Commit",
  "You're Inconsistent",
  "You're Unreliable",
  "You're Dragging Everyone Down",
  "You're Ruining the Coherence",
  "The Body Is Failing Because of You",
  "You're Breaking the Synchronization",
  "Everyone's Losing Because of You",
  "You're the Weak Link",
  "You're Disrupting the Harmony",
  "The Collective Is Suffering Because of You",
  "You're Poisoning the System",
  "You're Infecting Everyone Else",
  "The Body Rejects You",
  "You're Bringing Down the Group",
  "Others Are Compensating for Your Failures",
  "You're a Liability to the Team",
  "The Coherence Drops When You Touch It",
  "You're Dead Weight",
  "You're Sabotaging the Mission",
  "The Body Would Be Better Without You",
  "You're the Source of the Infection",
  "You're Contaminating the Collective",
  "Everyone Can See You're Failing",
  "You're the Reason We Can't Reach 100%",
  "The Breakthrough Is Impossible Because of You",
  "You're Holding Everyone Back",
  "They're All Waiting for You to Quit",
  "You're the Cancer in the Body",
  "You're Destroying What Others Built",
  "The Numbers Drop Because of You",
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
