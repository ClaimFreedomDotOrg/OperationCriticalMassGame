/**
 * useDynamicMusic Hook
 *
 * Implements dynamic background music that correlates with coherence level.
 * Music becomes progressively more harmonious as coherence increases,
 * creating a neurophysiological feedback loop that reinforces gameplay.
 *
 * Scientific Basis:
 * - Musical consonance activates reward centers (nucleus accumbens)
 * - Dissonance creates tension/arousal (amygdala activation)
 * - Rhythmic entrainment synchronizes neural oscillations
 * - Harmonic progression supports flow state induction
 *
 * Musical Design:
 * - 0-30% Coherence: Dissonant, chaotic, sparse (only bass drone)
 * - 30-60% Coherence: Adding rhythmic elements, mild harmony
 * - 60-90% Coherence: Full harmony, major key, flowing melody
 * - 90-100% Coherence: Perfect harmony, rich overtones, triumphant
 *
 * Technical Implementation:
 * - Layered oscillators with dynamic mixing based on coherence
 * - Smooth crossfading between dissonant and consonant intervals
 * - Integrated with bilateral audio (complementary frequencies)
 * - Chaos injection on player misses (temporary dissonance burst)
 */

import { useEffect, useRef, useCallback } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';

const { BPM } = GAME_CONFIG;
const BEAT_DURATION = 60 / BPM; // seconds per beat

/**
 * Musical scale degrees and intervals
 * Based on A minor pentatonic (sad/neutral) transitioning to A major (happy/resolved)
 */
const MUSIC_CONFIG = {
  ROOT_FREQ: 110, // A2 - low, grounding frequency (complements 220Hz bilateral tone)
  
  // Scale degrees for different coherence levels
  SCALES: {
    // Dissonant/chaotic (low coherence): minor 2nd and tritone intervals
    CHAOTIC: [1, 1.067, 1.414, 1.587], // Root, minor 2nd, tritone, minor 6th
    
    // Transitional (medium coherence): minor pentatonic
    TRANSITIONAL: [1, 1.2, 1.333, 1.5, 1.778], // Root, minor 3rd, 4th, 5th, minor 7th
    
    // Harmonious (high coherence): major pentatonic
    HARMONIOUS: [1, 1.125, 1.25, 1.5, 1.667], // Root, major 2nd, major 3rd, 5th, major 6th
    
    // Perfect (breakthrough): major triad with overtones
    PERFECT: [1, 1.25, 1.5, 2, 2.5, 3], // Root, major 3rd, 5th, octave, major 10th, 12th
  },
  
  // Volume levels for different layers
  VOLUMES: {
    BASS: 0.15,
    PAD: 0.08,
    MELODY: 0.06,
    CHAOS: 0.12,
  },
  
  // Layer activation thresholds
  THRESHOLDS: {
    BASS: 0, // Always present (grounding)
    PAD: 30, // Harmonic pad enters
    MELODY: 60, // Melodic layer enters
    PERFECT: 90, // Perfect harmony mode
  }
};

export const useDynamicMusic = ({ 
  isActive, 
  coherence = 0, 
  audioContext, 
  masterGain, 
  isEnabled 
}) => {
  // Oscillator references for each layer
  const bassOscillatorRef = useRef(null);
  const bassGainRef = useRef(null);
  
  const padOscillatorsRef = useRef([]); // Array of oscillators for pad chords
  const padGainRef = useRef(null);
  
  const melodyOscillatorRef = useRef(null);
  const melodyGainRef = useRef(null);
  
  const chaosOscillatorRef = useRef(null);
  const chaosGainRef = useRef(null);
  
  const isPlayingRef = useRef(false);
  const animationFrameRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);
  const currentCoherenceRef = useRef(0);
  
  // Melody pattern state
  const melodyIndexRef = useRef(0);
  const lastMelodyTimeRef = useRef(0);

  /**
   * Get current scale based on coherence level
   */
  const getScale = useCallback((coherenceLevel) => {
    if (coherenceLevel >= MUSIC_CONFIG.THRESHOLDS.PERFECT) {
      return MUSIC_CONFIG.SCALES.PERFECT;
    } else if (coherenceLevel >= MUSIC_CONFIG.THRESHOLDS.MELODY) {
      return MUSIC_CONFIG.SCALES.HARMONIOUS;
    } else if (coherenceLevel >= MUSIC_CONFIG.THRESHOLDS.PAD) {
      return MUSIC_CONFIG.SCALES.TRANSITIONAL;
    } else {
      return MUSIC_CONFIG.SCALES.CHAOTIC;
    }
  }, []);

  /**
   * Create bass drone (always playing, changes tone with coherence)
   */
  const startBassLayer = useCallback(() => {
    if (!audioContext || !masterGain) return;

    try {
      // Bass oscillator - deep drone
      bassOscillatorRef.current = audioContext.createOscillator();
      bassOscillatorRef.current.type = 'sine';
      bassOscillatorRef.current.frequency.value = MUSIC_CONFIG.ROOT_FREQ;

      bassGainRef.current = audioContext.createGain();
      bassGainRef.current.gain.value = MUSIC_CONFIG.VOLUMES.BASS;

      bassOscillatorRef.current.connect(bassGainRef.current);
      bassGainRef.current.connect(masterGain);

      bassOscillatorRef.current.start();
    } catch (error) {
      console.warn('Error starting bass layer:', error);
    }
  }, [audioContext, masterGain]);

  /**
   * Create harmonic pad (chord tones that evolve with coherence)
   */
  const startPadLayer = useCallback(() => {
    if (!audioContext || !masterGain || padOscillatorsRef.current.length > 0) return;

    try {
      padGainRef.current = audioContext.createGain();
      padGainRef.current.gain.value = 0; // Start silent, fade in based on coherence
      padGainRef.current.connect(masterGain);

      // Create 3 oscillators for a chord
      const scale = getScale(currentCoherenceRef.current);
      for (let i = 0; i < 3; i++) {
        const osc = audioContext.createOscillator();
        osc.type = 'triangle'; // Soft, pad-like tone
        osc.frequency.value = MUSIC_CONFIG.ROOT_FREQ * scale[i % scale.length] * 2; // One octave higher
        osc.connect(padGainRef.current);
        osc.start();
        padOscillatorsRef.current.push(osc);
      }
    } catch (error) {
      console.warn('Error starting pad layer:', error);
    }
  }, [audioContext, masterGain, getScale]);

  /**
   * Create melody layer (arpeggiated pattern based on coherence)
   */
  const startMelodyLayer = useCallback(() => {
    if (!audioContext || !masterGain) return;

    try {
      melodyOscillatorRef.current = audioContext.createOscillator();
      melodyOscillatorRef.current.type = 'sine';
      melodyOscillatorRef.current.frequency.value = MUSIC_CONFIG.ROOT_FREQ * 4; // Two octaves up

      melodyGainRef.current = audioContext.createGain();
      melodyGainRef.current.gain.value = 0; // Start silent
      melodyGainRef.current.connect(masterGain);

      melodyOscillatorRef.current.connect(melodyGainRef.current);
      melodyOscillatorRef.current.start();
    } catch (error) {
      console.warn('Error starting melody layer:', error);
    }
  }, [audioContext, masterGain]);

  /**
   * Update all music layers based on coherence
   * Uses smooth transitions to avoid jarring changes
   */
  const updateMusicLayers = useCallback(() => {
    if (!audioContext || !isPlayingRef.current) return;

    const now = audioContext.currentTime;
    const coherenceLevel = currentCoherenceRef.current;
    const scale = getScale(coherenceLevel);

    // Smooth transition time (1 second for all changes)
    const transitionTime = 1.0;

    try {
      // Update bass tone (subtle frequency shifts based on coherence)
      if (bassOscillatorRef.current) {
        const bassMultiplier = coherenceLevel >= 90 ? 1.0 : 
                               coherenceLevel >= 60 ? 1.0 :
                               coherenceLevel >= 30 ? 0.98 : // Slightly flat when struggling
                               0.95; // More flat when chaotic
        bassOscillatorRef.current.frequency.linearRampToValueAtTime(
          MUSIC_CONFIG.ROOT_FREQ * bassMultiplier,
          now + transitionTime
        );
      }

      // Update pad layer
      if (padGainRef.current) {
        const padVolume = coherenceLevel >= MUSIC_CONFIG.THRESHOLDS.PAD
          ? MUSIC_CONFIG.VOLUMES.PAD * Math.min(1, (coherenceLevel - 30) / 40) // Fade in 30-70%
          : 0;
        
        padGainRef.current.gain.linearRampToValueAtTime(padVolume, now + transitionTime);

        // Update pad chord frequencies
        padOscillatorsRef.current.forEach((osc, i) => {
          if (osc) {
            const freq = MUSIC_CONFIG.ROOT_FREQ * scale[i % scale.length] * 2;
            osc.frequency.linearRampToValueAtTime(freq, now + transitionTime);
          }
        });
      }

      // Update melody layer (arpeggio pattern)
      if (melodyGainRef.current) {
        const melodyVolume = coherenceLevel >= MUSIC_CONFIG.THRESHOLDS.MELODY
          ? MUSIC_CONFIG.VOLUMES.MELODY * Math.min(1, (coherenceLevel - 60) / 30) // Fade in 60-90%
          : 0;
        
        melodyGainRef.current.gain.linearRampToValueAtTime(melodyVolume, now + transitionTime);
      }

      // Melody note changes (every 2 beats)
      if (melodyOscillatorRef.current && now - lastMelodyTimeRef.current > BEAT_DURATION * 2) {
        lastMelodyTimeRef.current = now;
        melodyIndexRef.current = (melodyIndexRef.current + 1) % scale.length;
        
        const melodyFreq = MUSIC_CONFIG.ROOT_FREQ * scale[melodyIndexRef.current] * 4;
        melodyOscillatorRef.current.frequency.linearRampToValueAtTime(melodyFreq, now + 0.05);
      }

    } catch (error) {
      console.warn('Error updating music layers:', error);
    }
  }, [audioContext, getScale]);

  /**
   * Inject temporary chaos into music (on player miss)
   * Creates dissonant burst to increase stress/attention
   */
  const injectChaos = useCallback(() => {
    if (!audioContext || !masterGain || !isEnabled) return;

    try {
      const now = audioContext.currentTime;
      const duration = 0.3; // 300ms burst

      // Create harsh dissonant tone
      const chaosOsc = audioContext.createOscillator();
      chaosOsc.type = 'sawtooth'; // Harsh waveform
      chaosOsc.frequency.value = MUSIC_CONFIG.ROOT_FREQ * 1.414; // Tritone (most dissonant interval)

      const chaosGain = audioContext.createGain();
      chaosGain.gain.setValueAtTime(MUSIC_CONFIG.VOLUMES.CHAOS, now);
      chaosGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      chaosOsc.connect(chaosGain);
      chaosGain.connect(masterGain);

      chaosOsc.start(now);
      chaosOsc.stop(now + duration);

      chaosOsc.onended = () => {
        chaosGain.disconnect();
        chaosOsc.disconnect();
      };
    } catch (error) {
      console.warn('Error injecting chaos:', error);
    }
  }, [audioContext, masterGain, isEnabled]);

  /**
   * Stop all music layers
   */
  const stopMusic = useCallback(() => {
    // Stop bass
    if (bassOscillatorRef.current) {
      try {
        bassOscillatorRef.current.stop();
        bassOscillatorRef.current.disconnect();
      } catch (e) { /* may already be stopped */ }
      bassOscillatorRef.current = null;
    }
    if (bassGainRef.current) {
      bassGainRef.current.disconnect();
      bassGainRef.current = null;
    }

    // Stop pad
    padOscillatorsRef.current.forEach(osc => {
      if (osc) {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) { /* may already be stopped */ }
      }
    });
    padOscillatorsRef.current = [];
    if (padGainRef.current) {
      padGainRef.current.disconnect();
      padGainRef.current = null;
    }

    // Stop melody
    if (melodyOscillatorRef.current) {
      try {
        melodyOscillatorRef.current.stop();
        melodyOscillatorRef.current.disconnect();
      } catch (e) { /* may already be stopped */ }
      melodyOscillatorRef.current = null;
    }
    if (melodyGainRef.current) {
      melodyGainRef.current.disconnect();
      melodyGainRef.current = null;
    }

    isPlayingRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  /**
   * Start all music layers
   */
  const startMusic = useCallback(() => {
    if (isPlayingRef.current) return;

    startBassLayer();
    startPadLayer();
    startMelodyLayer();

    isPlayingRef.current = true;
    lastUpdateTimeRef.current = audioContext.currentTime;

    // Start update loop
    const updateLoop = () => {
      const now = audioContext.currentTime;
      
      // Update every 100ms to keep music responsive
      if (now - lastUpdateTimeRef.current > 0.1) {
        updateMusicLayers();
        lastUpdateTimeRef.current = now;
      }

      if (isPlayingRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateLoop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateLoop);
  }, [audioContext, startBassLayer, startPadLayer, startMelodyLayer, updateMusicLayers]);

  /**
   * Effect: Start/stop music based on isActive
   */
  useEffect(() => {
    if (isActive && isEnabled && audioContext && masterGain) {
      startMusic();
    } else {
      stopMusic();
    }

    return () => {
      stopMusic();
    };
  }, [isActive, isEnabled, audioContext, masterGain, startMusic, stopMusic]);

  /**
   * Effect: Update coherence reference when it changes
   */
  useEffect(() => {
    currentCoherenceRef.current = coherence;
  }, [coherence]);

  return {
    injectChaos,
    isPlaying: isPlayingRef.current,
  };
};

export default useDynamicMusic;
