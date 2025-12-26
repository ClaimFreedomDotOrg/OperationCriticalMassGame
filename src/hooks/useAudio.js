/**
 * useAudio Hook
 *
 * Manages Web Audio API context and provides helper functions for sound synthesis.
 * Implements efficient audio playback suitable for real-time gameplay with
 * thousands of simultaneous users.
 *
 * Technical Approach:
 * - Uses Web Audio API (not HTML5 Audio) for precise timing and low latency
 * - Synthesizes tones programmatically (no audio file downloads required)
 * - Reuses AudioContext to avoid memory leaks
 * - Respects user's autoplay policies (requires user interaction)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';

const { AUDIO } = GAME_CONFIG;

export const useAudio = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null);

  /**
   * Initialize AudioContext
   * Must be called after user interaction due to browser autoplay policies
   */
  const initAudioContext = useCallback(() => {
    if (audioContextRef.current) return;

    try {
      // Create AudioContext (supports both standard and webkit prefixed)
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();

      // Create master gain node for volume control
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = AUDIO.MASTER_VOLUME;
      masterGainRef.current.connect(audioContextRef.current.destination);

      setIsInitialized(true);
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      setIsInitialized(false);
    }
  }, []);

  /**
   * Resume AudioContext if suspended (browser autoplay policy)
   */
  const resumeAudioContext = useCallback(async () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (error) {
        console.warn('Failed to resume AudioContext:', error);
      }
    }
  }, []);

  /**
   * Play a synthesized tone
   *
   * @param {number} frequency - Frequency in Hz
   * @param {number} duration - Duration in seconds
   * @param {number} volume - Volume multiplier (0-1)
   * @param {string} waveType - Oscillator type: 'sine', 'square', 'sawtooth', 'triangle'
   * @param {number} fadeOut - Fade out duration in seconds (prevents clicks)
   */
  const playTone = useCallback((frequency, duration, volume = 1, waveType = 'sine', fadeOut = 0.05) => {
    if (!isEnabled || !isInitialized || !audioContextRef.current || !masterGainRef.current) {
      return;
    }

    try {
      const context = audioContextRef.current;
      const now = context.currentTime;

      // Create oscillator (tone generator)
      const oscillator = context.createOscillator();
      oscillator.type = waveType;
      oscillator.frequency.value = frequency;

      // Create gain node for this specific sound
      const gainNode = context.createGain();
      gainNode.gain.value = volume;

      // Apply fade out to prevent clicking
      // Hold volume until fade out time, then ramp down
      const fadeStartTime = now + duration - fadeOut;
      gainNode.gain.setValueAtTime(volume, fadeStartTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, fadeStartTime + fadeOut);

      // Connect: oscillator -> gain -> master gain -> destination
      oscillator.connect(gainNode);
      gainNode.connect(masterGainRef.current);

      // Schedule playback
      oscillator.start(now);
      oscillator.stop(now + duration);

      // Clean up after playback
      oscillator.onended = () => {
        gainNode.disconnect();
        oscillator.disconnect();
      };
    } catch (error) {
      console.warn('Error playing tone:', error);
    }
  }, [isEnabled, isInitialized]);

  /**
   * Play a tap success sound
   * Bright, positive tone (major third interval)
   */
  const playTapSuccess = useCallback(() => {
    playTone(523.25, 0.1, AUDIO.TAP_VOLUME, 'sine'); // C5
    playTone(659.25, 0.1, AUDIO.TAP_VOLUME * 0.5, 'sine'); // E5
  }, [playTone]);

  /**
   * Play a tap miss sound
   * Lower, dissonant tone
   */
  const playTapMiss = useCallback(() => {
    playTone(220, 0.15, AUDIO.MISS_VOLUME, 'square');
  }, [playTone]);

  /**
   * Play thought dismissal sound
   * Quick upward sweep (whoosh effect)
   */
  const playThoughtDismiss = useCallback(() => {
    if (!isEnabled || !isInitialized || !audioContextRef.current || !masterGainRef.current) {
      return;
    }

    try {
      const context = audioContextRef.current;
      const now = context.currentTime;
      const duration = 0.2;

      const oscillator = context.createOscillator();
      oscillator.type = 'sine';
      
      // Sweep from 200Hz to 800Hz
      oscillator.frequency.setValueAtTime(200, now);
      oscillator.frequency.exponentialRampToValueAtTime(800, now + duration);

      const gainNode = context.createGain();
      gainNode.gain.setValueAtTime(AUDIO.TAP_VOLUME * 0.7, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      oscillator.connect(gainNode);
      gainNode.connect(masterGainRef.current);

      oscillator.start(now);
      oscillator.stop(now + duration);

      oscillator.onended = () => {
        gainNode.disconnect();
        oscillator.disconnect();
      };
    } catch (error) {
      console.warn('Error playing thought dismiss sound:', error);
    }
  }, [isEnabled, isInitialized]);

  /**
   * Play breakthrough achievement sound
   * Triumphant ascending arpeggio
   */
  const playBreakthrough = useCallback(() => {
    if (!isEnabled || !isInitialized || !audioContextRef.current || !masterGainRef.current) {
      return;
    }

    try {
      const context = audioContextRef.current;
      const now = context.currentTime;

      // C Major arpeggio: C5, E5, G5, C6
      const notes = [
        { freq: 523.25, delay: 0 },
        { freq: 659.25, delay: 0.15 },
        { freq: 783.99, delay: 0.3 },
        { freq: 1046.50, delay: 0.45 },
      ];

      // Use Web Audio API scheduling for precise timing
      notes.forEach(({ freq, delay }) => {
        const oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = freq;

        const gainNode = context.createGain();
        gainNode.gain.value = AUDIO.BREAKTHROUGH_VOLUME * 0.8;

        // Apply fade out
        const duration = 0.5;
        const fadeOut = 0.2;
        gainNode.gain.setValueAtTime(AUDIO.BREAKTHROUGH_VOLUME * 0.8, now + delay + duration - fadeOut);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

        oscillator.connect(gainNode);
        gainNode.connect(masterGainRef.current);

        // Schedule precise start/stop times
        oscillator.start(now + delay);
        oscillator.stop(now + delay + duration);

        oscillator.onended = () => {
          gainNode.disconnect();
          oscillator.disconnect();
        };
      });
    } catch (error) {
      console.warn('Error playing breakthrough sound:', error);
    }
  }, [isEnabled, isInitialized]);

  /**
   * Toggle audio on/off
   */
  const toggleAudio = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  /**
   * Set master volume
   */
  const setVolume = useCallback((volume) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = Math.max(0, Math.min(1, volume));
    }
  }, []);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    // AudioContext initialization is deferred until user interaction
    // This is handled by calling initAudioContext on first user action
    return () => {
      // Cleanup: close AudioContext on unmount
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isEnabled,
    isInitialized,
    initAudioContext,
    resumeAudioContext,
    playTone,
    playTapSuccess,
    playTapMiss,
    playThoughtDismiss,
    playBreakthrough,
    toggleAudio,
    setVolume,
    audioContext: audioContextRef.current,
    masterGain: masterGainRef.current,
  };
};

export default useAudio;
