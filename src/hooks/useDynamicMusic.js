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
  
  // Volume levels for different layers (increased for more presence)
  VOLUMES: {
    BASS: 0.25, // Increased from 0.15
    PAD: 0.18, // Increased from 0.08
    MELODY: 0.15, // Increased from 0.06
    CHAOS: 0.25, // Increased from 0.12 for more impact on miss
  },
  
  // Layer activation thresholds (lowered so music is audible from start)
  THRESHOLDS: {
    BASS: 0, // Always present (grounding)
    PAD: 0, // Start immediately (was 30)
    MELODY: 20, // Start early (was 60)
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
  const bassPannerRef = useRef(null);
  const bassTremoloRef = useRef(null); // LFO for bass tremolo
  
  const padOscillatorsRef = useRef([]); // Array of oscillators for pad chords
  const padGainRef = useRef(null);
  const padPannersRef = useRef([]);
  const padTremoloRef = useRef(null); // LFO for pad tremolo (rhythmic pulsing)
  
  const melodyOscillatorRef = useRef(null);
  const melodyGainRef = useRef(null);
  const melodyPannerRef = useRef(null);
  const melodyVibratoRef = useRef(null); // LFO for melody vibrato
  
  const chaosOscillatorRef = useRef(null);
  const chaosGainRef = useRef(null);
  
  const isPlayingRef = useRef(false);
  const animationFrameRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);
  const currentCoherenceRef = useRef(0);
  
  // Melody pattern state
  const melodyIndexRef = useRef(0);
  const lastMelodyTimeRef = useRef(0);
  
  // Bilateral panning state (alternates like bilateral audio)
  const panningPhaseRef = useRef(0);

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
   * Now with rhythmic tremolo (pulsing) and bilateral panning
   */
  const startBassLayer = useCallback(() => {
    if (!audioContext || !masterGain) return;

    try {
      // Bass oscillator - deep drone
      bassOscillatorRef.current = audioContext.createOscillator();
      bassOscillatorRef.current.type = 'sine';
      bassOscillatorRef.current.frequency.value = MUSIC_CONFIG.ROOT_FREQ;

      // Create tremolo LFO (rhythmic pulsing at 1 Hz - slow pulse)
      bassTremoloRef.current = audioContext.createOscillator();
      bassTremoloRef.current.type = 'sine';
      bassTremoloRef.current.frequency.value = 1; // 1 Hz pulse

      // Tremolo gain (modulates the main gain)
      const tremoloGain = audioContext.createGain();
      tremoloGain.gain.value = 0.15; // Tremolo depth (15% modulation)

      bassTremoloRef.current.connect(tremoloGain);
      
      bassGainRef.current = audioContext.createGain();
      bassGainRef.current.gain.value = MUSIC_CONFIG.VOLUMES.BASS;
      
      // Connect tremolo to modulate the gain
      tremoloGain.connect(bassGainRef.current.gain);

      // Add stereo panner for bilateral effect
      if (audioContext.createStereoPanner) {
        bassPannerRef.current = audioContext.createStereoPanner();
        bassPannerRef.current.pan.value = 0; // Start at center
        bassOscillatorRef.current.connect(bassGainRef.current);
        bassGainRef.current.connect(bassPannerRef.current);
        bassPannerRef.current.connect(masterGain);
      } else {
        bassOscillatorRef.current.connect(bassGainRef.current);
        bassGainRef.current.connect(masterGain);
      }

      bassOscillatorRef.current.start();
      bassTremoloRef.current.start();
    } catch (error) {
      console.warn('Error starting bass layer:', error);
    }
  }, [audioContext, masterGain]);

  /**
   * Create harmonic pad (chord tones that evolve with coherence)
   * Now with rhythmic tremolo synchronized to the beat (60 BPM = 1 Hz)
   */
  const startPadLayer = useCallback(() => {
    if (!audioContext || !masterGain || padOscillatorsRef.current.length > 0) return;

    try {
      // Create tremolo LFO for rhythmic pulsing (sync with 60 BPM beat)
      padTremoloRef.current = audioContext.createOscillator();
      padTremoloRef.current.type = 'sine';
      padTremoloRef.current.frequency.value = BPM / 60; // 1 Hz for 60 BPM
      
      // Tremolo gain (modulates the main pad gain)
      const tremoloGain = audioContext.createGain();
      tremoloGain.gain.value = 0.25; // 25% modulation depth for rhythmic pulsing
      
      padTremoloRef.current.connect(tremoloGain);
      
      padGainRef.current = audioContext.createGain();
      padGainRef.current.gain.value = MUSIC_CONFIG.VOLUMES.PAD;
      
      // Connect tremolo to modulate the gain
      tremoloGain.connect(padGainRef.current.gain);
      padGainRef.current.connect(masterGain);

      // Create 3 oscillators for a chord with stereo panning
      const scale = getScale(currentCoherenceRef.current);
      const panPositions = [-0.5, 0, 0.5]; // Left, center, right
      
      for (let i = 0; i < 3; i++) {
        const osc = audioContext.createOscillator();
        osc.type = 'triangle'; // Soft, pad-like tone
        osc.frequency.value = MUSIC_CONFIG.ROOT_FREQ * scale[i % scale.length] * 2; // One octave higher
        
        // Add stereo panner for each oscillator
        if (audioContext.createStereoPanner) {
          const panner = audioContext.createStereoPanner();
          panner.pan.value = panPositions[i];
          osc.connect(panner);
          panner.connect(padGainRef.current);
          padPannersRef.current.push(panner);
        } else {
          osc.connect(padGainRef.current);
        }
        
        osc.start();
        padOscillatorsRef.current.push(osc);
      }
      
      padTremoloRef.current.start();
    } catch (error) {
      console.warn('Error starting pad layer:', error);
    }
  }, [audioContext, masterGain, getScale]);

  /**
   * Create melody layer (arpeggiated pattern based on coherence)
   * Now with vibrato (frequency modulation) for organic, musical sound
   */
  const startMelodyLayer = useCallback(() => {
    if (!audioContext || !masterGain) return;

    try {
      melodyOscillatorRef.current = audioContext.createOscillator();
      melodyOscillatorRef.current.type = 'sine';
      melodyOscillatorRef.current.frequency.value = MUSIC_CONFIG.ROOT_FREQ * 4; // Two octaves up

      // Create vibrato LFO (subtle frequency modulation)
      melodyVibratoRef.current = audioContext.createOscillator();
      melodyVibratoRef.current.type = 'sine';
      melodyVibratoRef.current.frequency.value = 5; // 5 Hz vibrato (natural vocal vibrato speed)
      
      // Vibrato gain (modulates the oscillator frequency)
      const vibratoGain = audioContext.createGain();
      vibratoGain.gain.value = 8; // ±8 Hz vibrato depth (subtle, musical)
      
      melodyVibratoRef.current.connect(vibratoGain);
      vibratoGain.connect(melodyOscillatorRef.current.frequency);

      melodyGainRef.current = audioContext.createGain();
      melodyGainRef.current.gain.value = 0; // Start silent, fade in at threshold

      // Add stereo panner for bilateral effect
      if (audioContext.createStereoPanner) {
        melodyPannerRef.current = audioContext.createStereoPanner();
        melodyPannerRef.current.pan.value = 0;
        melodyOscillatorRef.current.connect(melodyGainRef.current);
        melodyGainRef.current.connect(melodyPannerRef.current);
        melodyPannerRef.current.connect(masterGain);
      } else {
        melodyOscillatorRef.current.connect(melodyGainRef.current);
        melodyGainRef.current.connect(masterGain);
      }

      melodyOscillatorRef.current.start();
      melodyVibratoRef.current.start();
    } catch (error) {
      console.warn('Error starting melody layer:', error);
    }
  }, [audioContext, masterGain]);

  /**
   * Update all music layers based on coherence
   * Uses smooth transitions to avoid jarring changes
   * Adds bilateral panning animation for immersive stereo effect
   */
  const updateMusicLayers = useCallback(() => {
    if (!audioContext || !isPlayingRef.current) return;

    const now = audioContext.currentTime;
    const coherenceLevel = currentCoherenceRef.current;
    const scale = getScale(coherenceLevel);

    // Smooth transition time (1 second for all changes)
    const transitionTime = 1.0;

    try {
      // Update bilateral panning phase (slow oscillation for immersive effect)
      panningPhaseRef.current += 0.01; // Increment phase
      const panValue = Math.sin(panningPhaseRef.current * 0.5) * 0.7; // Slow sine wave, max ±0.7

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
        
        // Add subtle panning to bass
        if (bassPannerRef.current) {
          bassPannerRef.current.pan.linearRampToValueAtTime(panValue * 0.3, now + 0.1);
        }
      }

      // Update pad layer with full volume from start
      if (padGainRef.current) {
        // Volume scales with coherence but starts immediately
        const padVolume = MUSIC_CONFIG.VOLUMES.PAD * Math.min(1, 0.3 + (coherenceLevel / 100) * 0.7);
        padGainRef.current.gain.linearRampToValueAtTime(padVolume, now + transitionTime);

        // Update pad chord frequencies
        padOscillatorsRef.current.forEach((osc, i) => {
          if (osc) {
            const freq = MUSIC_CONFIG.ROOT_FREQ * scale[i % scale.length] * 2;
            osc.frequency.linearRampToValueAtTime(freq, now + transitionTime);
          }
        });
        
        // Animate pad panners for wide stereo field
        padPannersRef.current.forEach((panner, i) => {
          if (panner) {
            const offset = (i - 1) * 0.5; // -0.5, 0, 0.5
            const dynamicPan = offset + panValue * 0.2;
            panner.pan.linearRampToValueAtTime(Math.max(-1, Math.min(1, dynamicPan)), now + 0.1);
          }
        });
      }

      // Update melody layer with earlier activation
      if (melodyGainRef.current) {
        const melodyVolume = coherenceLevel >= MUSIC_CONFIG.THRESHOLDS.MELODY
          ? MUSIC_CONFIG.VOLUMES.MELODY * Math.min(1, (coherenceLevel - 20) / 60) // Fade in 20-80%
          : 0;
        
        melodyGainRef.current.gain.linearRampToValueAtTime(melodyVolume, now + transitionTime);
        
        // Animate melody panning for bilateral effect
        if (melodyPannerRef.current) {
          melodyPannerRef.current.pan.linearRampToValueAtTime(panValue * 0.5, now + 0.1);
        }
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
   * Creates dramatic dissonant burst to increase stress/attention
   * Now with multiple oscillators for more chaotic effect
   */
  const injectChaos = useCallback(() => {
    if (!audioContext || !masterGain || !isEnabled) return;

    try {
      const now = audioContext.currentTime;
      const duration = 0.4; // Longer 400ms burst for more impact

      // Create multiple harsh dissonant tones for maximum chaos
      const chaosFrequencies = [
        MUSIC_CONFIG.ROOT_FREQ * 1.414, // Tritone
        MUSIC_CONFIG.ROOT_FREQ * 1.067, // Minor 2nd (very dissonant)
        MUSIC_CONFIG.ROOT_FREQ * 2.8,   // Dissonant high overtone
      ];

      chaosFrequencies.forEach((freq, i) => {
        const chaosOsc = audioContext.createOscillator();
        chaosOsc.type = i === 0 ? 'sawtooth' : 'square'; // Mix harsh waveforms
        chaosOsc.frequency.value = freq;

        const chaosGain = audioContext.createGain();
        const volume = MUSIC_CONFIG.VOLUMES.CHAOS * (1 - i * 0.3); // Decreasing volumes
        chaosGain.gain.setValueAtTime(volume, now);
        chaosGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        // Add stereo panning for chaotic spatial effect
        if (audioContext.createStereoPanner) {
          const chaosPanner = audioContext.createStereoPanner();
          chaosPanner.pan.value = (i - 1) * 0.7; // Spread across stereo field
          chaosOsc.connect(chaosGain);
          chaosGain.connect(chaosPanner);
          chaosPanner.connect(masterGain);
        } else {
          chaosOsc.connect(chaosGain);
          chaosGain.connect(masterGain);
        }

        chaosOsc.start(now);
        chaosOsc.stop(now + duration);

        chaosOsc.onended = () => {
          chaosGain.disconnect();
          chaosOsc.disconnect();
        };
      });
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
    if (bassTremoloRef.current) {
      try {
        bassTremoloRef.current.stop();
        bassTremoloRef.current.disconnect();
      } catch (e) { /* may already be stopped */ }
      bassTremoloRef.current = null;
    }
    if (bassGainRef.current) {
      bassGainRef.current.disconnect();
      bassGainRef.current = null;
    }
    if (bassPannerRef.current) {
      bassPannerRef.current.disconnect();
      bassPannerRef.current = null;
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
    if (padTremoloRef.current) {
      try {
        padTremoloRef.current.stop();
        padTremoloRef.current.disconnect();
      } catch (e) { /* may already be stopped */ }
      padTremoloRef.current = null;
    }
    padPannersRef.current.forEach(panner => {
      if (panner) {
        try {
          panner.disconnect();
        } catch (e) { /* may already be disconnected */ }
      }
    });
    padPannersRef.current = [];
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
    if (melodyVibratoRef.current) {
      try {
        melodyVibratoRef.current.stop();
        melodyVibratoRef.current.disconnect();
      } catch (e) { /* may already be stopped */ }
      melodyVibratoRef.current = null;
    }
    if (melodyGainRef.current) {
      melodyGainRef.current.disconnect();
      melodyGainRef.current = null;
    }
    if (melodyPannerRef.current) {
      melodyPannerRef.current.disconnect();
      melodyPannerRef.current = null;
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
