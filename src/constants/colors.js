/**
 * Operation: Critical Mass - Color Palette
 * 
 * Bio-digital bioluminescence aesthetic: like watching neurons fire or cells under a microscope.
 * All colors extracted from the actual demo implementation for consistency.
 * 
 * Scientific Basis:
 * - Dark backgrounds reduce visual fatigue during extended play
 * - High-contrast accents ensure clear visual feedback
 * - Warm gold represents coherence (activating reward systems)
 * - Cool cyan represents neural activity (calming, focused state)
 * - Red represents infection/error (immediate threat detection)
 */

export const COLORS = {
  // === BACKGROUNDS ===
  VOID_BLACK: '#000000',           // Primary background, the void of potential
  GRAY_900: '#111827',             // Secondary backgrounds, UI containers
  GRAY_950: '#030712',             // Deepest backgrounds with slight warmth
  
  // === NEURAL/CONNECTION COLORS (Cyan Family) ===
  NEURAL_CYAN: '#00FFFF',          // Pure cyan - unused in current demo but reserved
  CYAN_100: 'rgba(207, 250, 254, 0.8)', // Light cyan text (idle state descriptions)
  CYAN_200: 'rgba(165, 243, 252, 0.5)', // Subtle cyan text (simulated operator message)
  CYAN_400: '#22d3ee',             // Bright cyan - active pulse, buttons, primary actions
  CYAN_500: '#06b6d4',             // Standard cyan - progress bars, borders
  CYAN_900: 'rgba(22, 78, 99, 0.3)', // Dark cyan backgrounds - button backgrounds
  
  // === INFECTION/ERROR COLORS (Red Family) ===
  INFECTION_RED: '#FF0033',        // Pure red - unused in current demo but reserved
  RED_100: '#fee2e2',              // Light red text
  RED_400: '#f87171',              // Medium red - infection bubble icons
  RED_500: '#ef4444',              // Standard red - borders, feedback, errors
  RED_900: 'rgba(127, 29, 29, 0.6)', // Deep red cells - unsynced state
  RED_950: 'rgba(69, 10, 10, 0.4)', // Deepest red backgrounds - infection container overlay
  
  // === COHERENCE/SUCCESS COLORS (Gold/Amber Family) ===
  COHERENCE_GOLD: '#FFD700',       // Pure gold - unused in current demo but reserved
  AMBER_50: '#fffbeb',             // Lightest amber - breakthrough background
  AMBER_100: '#fef3c7',            // Light amber - breakthrough gradient
  AMBER_400: '#fbbf24',            // Bright amber/gold - synced cells, high coherence, victory
  AMBER_500: '#f59e0b',            // Standard amber - status indicators
  AMBER_600: '#d97706',            // Deep amber - breakthrough title
  AMBER_800: 'rgba(146, 64, 14, 0.8)', // Darker amber - breakthrough subtitle
  AMBER_900: 'rgba(120, 53, 15, 0.5)', // Darkest amber - breakthrough reset button text
  
  // === NEUTRAL/UI COLORS (Gray Family) ===
  GRAY_400: '#9ca3af',             // Medium gray - secondary text
  GRAY_600: '#4b5563',             // Dark gray - inactive button text
  GRAY_800: '#1f2937',             // Very dark gray - borders, inactive states
  WHITE: '#ffffff',                // Pure white - for overlays and highlights
  
  // === SPECIAL EFFECT COLORS ===
  PINK_500: '#ec4899',             // Neon pink - visual tap indicators (bot feedback)
  BLUE_600: '#2563eb',             // Deep blue - used in gradients
  
  // === RGBA VARIANTS (for dynamic opacity) ===
  BLACK_80: 'rgba(0, 0, 0, 0.8)',  // Black with 80% opacity
  BLACK_90: 'rgba(0, 0, 0, 0.9)',  // Black with 90% opacity
  WHITE_20: 'rgba(255, 255, 255, 0.2)', // White with 20% opacity - pulse overlays
  WHITE_50: 'rgba(255, 255, 255, 0.5)', // White with 50% opacity - vignettes, orb centers
  
  // === SHADOW COLORS (for glow effects) ===
  CYAN_GLOW: 'rgba(34, 211, 238, 0.8)',      // Cyan glow for active pulse
  CYAN_GLOW_SUBTLE: 'rgba(34, 211, 238, 0.5)', // Subtle cyan glow for progress bars
  CYAN_GLOW_FAINT: 'rgba(0, 255, 255, 0.1)',   // Very faint cyan for container shadows
  AMBER_GLOW: 'rgba(251, 191, 36, 0.8)',     // Gold glow for synced cells
  AMBER_GLOW_STRONG: 'rgba(251, 191, 36, 0.8)', // Strong gold glow for high coherence
  RED_GLOW: 'rgba(239, 68, 68, 0.8)',        // Red glow for errors/infections
  RED_GLOW_INFECTION: 'rgba(220, 38, 38, 0.6)', // Red glow for infection bubbles
  RED_GLOW_CONTAINER: 'rgba(220, 38, 38, 0.5)', // Red glow for infected container
  RED_GLOW_SUBTLE: 'rgba(220, 38, 38, 0.4)',  // Subtle red glow for bubble indicators
  RED_GLOW_FAINT: 'rgba(220, 38, 38, 0.3)',   // Faint red glow for small bubble dots
  PINK_GLOW: 'rgba(236, 72, 153, 0.8)',      // Pink glow for visual taps
  PINK_GLOW_INSET: 'rgba(236, 72, 153, 0.5)', // Pink inset glow for visual taps
};

/**
 * Color Usage Guidelines:
 * 
 * 1. IDLE STATE:
 *    - Background: VOID_BLACK
 *    - Title: gradient from CYAN_400 to BLUE_600
 *    - Text: CYAN_100 (80% opacity)
 *    - Button: CYAN_900 background, CYAN_500 border, CYAN_400 text/hover
 * 
 * 2. PLAYING STATE - NORMAL:
 *    - Background: VOID_BLACK
 *    - Border: GRAY_800
 *    - Cells (unsynced): RED_900 with 60% opacity
 *    - Cells (synced): AMBER_400 with AMBER_GLOW
 *    - Pulse: CYAN_400 with CYAN_GLOW
 *    - Progress bar: CYAN_500 with CYAN_GLOW_SUBTLE
 * 
 * 3. PLAYING STATE - INFECTED:
 *    - Background: RED_950 with 40% opacity
 *    - Border: RED_500
 *    - Container shadow: RED_GLOW_CONTAINER (inset)
 *    - Infection bubble: RED_950 90% opacity, RED_500 border, RED_GLOW_INFECTION
 * 
 * 4. PLAYING STATE - HIT FEEDBACK:
 *    - Border: AMBER_400
 *    - Container shadow: AMBER_GLOW with 30% opacity (inset)
 *    - Feedback text: AMBER_400 with AMBER_GLOW
 * 
 * 5. PLAYING STATE - HIGH COHERENCE (>90%):
 *    - Progress bar: AMBER_400 instead of CYAN_500
 *    - Progress glow: AMBER_GLOW_STRONG
 * 
 * 6. BREAKTHROUGH STATE:
 *    - Background: AMBER_50 with gradient to WHITE
 *    - Title: AMBER_600
 *    - Subtitle: AMBER_800 with 80% opacity
 *    - Reset button: AMBER_900 with 50% opacity, 30% on border
 * 
 * 7. VISUAL EFFECTS:
 *    - Visual taps: PINK_500 border, PINK_500 30% background, PINK_GLOW + PINK_GLOW_INSET
 *    - Pulse animation: WHITE_20 overlay with pulse animation
 *    - Active buttons: CYAN_400 border, CYAN_900 40% background, CYAN_GLOW_SUBTLE shadow
 */

/**
 * Tailwind CSS Class Mappings (for reference):
 * 
 * Background Colors:
 * - bg-black → VOID_BLACK
 * - bg-gray-900 → GRAY_900
 * - bg-cyan-900/30 → CYAN_900 with 30% opacity
 * - bg-red-950/40 → RED_950 with 40% opacity
 * - bg-amber-50 → AMBER_50
 * 
 * Border Colors:
 * - border-gray-800 → GRAY_800
 * - border-cyan-400 → CYAN_400
 * - border-cyan-500 → CYAN_500
 * - border-red-500 → RED_500
 * - border-amber-400 → AMBER_400
 * 
 * Text Colors:
 * - text-cyan-400 → CYAN_400
 * - text-cyan-100/80 → CYAN_100 with 80% opacity
 * - text-amber-400 → AMBER_400
 * - text-red-500 → RED_500
 * 
 * Shadow/Glow Effects:
 * - shadow-[0_0_15px_rgba(34,211,238,0.8)] → CYAN_GLOW
 * - shadow-[0_0_15px_rgba(251,191,36,0.8)] → AMBER_GLOW
 * - shadow-[0_0_30px_rgba(220,38,38,0.6)] → RED_GLOW_INFECTION
 * - shadow-[inset_0_0_50px_rgba(220,38,38,0.5)] → RED_GLOW_CONTAINER (inset)
 */

export default COLORS;
