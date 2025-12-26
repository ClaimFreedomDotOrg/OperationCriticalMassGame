/**
 * useBilateralAudio Hook
 *
 * Implements bilateral auditory stimulation synchronized with the visual orb.
 * The audio pans left-right in sync with the orb's oscillation, creating an
 * immersive EMDR-like experience.
 *
 * Scientific Basis:
 * - Bilateral auditory stimulation activates bilateral brain regions
 * - Enhances interhemispheric communication (Propper et al., 2007)
 * - Supports working memory taxation (van den Hout & Engelhard, 2012)
 * - Creates rhythmic entrainment for flow state induction
 *
 * Technical Implementation:
 * - Uses Web Audio API StereoPannerNode for precise L-R positioning
 * - Synchronizes with orb position (-1 = full left, +1 = full right)
 * - Generates smooth continuous tone with position-based volume modulation
 * - Optimized for performance with requestAnimationFrame
 */

import { useEffect, useRef, useCallback } from 'react';

export const useBilateralAudio = ({ isActive, position, audioContext, masterGain, isEnabled }) => {
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const pannerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isPlayingRef = useRef(false);

  /**
   * Start bilateral audio tone
   * Creates a continuous tone that pans left-right with the orb
   */
  const startBilateralAudio = useCallback(() => {
    if (!audioContext || !masterGain || !isEnabled || isPlayingRef.current) {
      return;
    }

    try {
      // Create oscillator for continuous tone
      oscillatorRef.current = audioContext.createOscillator();
      oscillatorRef.current.type = 'sine';
      oscillatorRef.current.frequency.value = 220; // A3 - calming frequency

      // Create gain node for volume control
      gainNodeRef.current = audioContext.createGain();
      gainNodeRef.current.gain.value = 0.2; // Gentle volume (reduced to blend with music)

      // Create stereo panner for left-right positioning
      if (audioContext.createStereoPanner) {
        pannerRef.current = audioContext.createStereoPanner();
        pannerRef.current.pan.value = 0; // Start at center
      } else {
        // Fallback for browsers without StereoPanner (older Safari)
        pannerRef.current = audioContext.createPanner();
        pannerRef.current.panningModel = 'equalpower';
      }

      // Connect: oscillator -> gain -> panner -> master gain -> destination
      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(pannerRef.current);
      pannerRef.current.connect(masterGain);

      // Start oscillator
      oscillatorRef.current.start();
      isPlayingRef.current = true;
    } catch (error) {
      console.warn('Error starting bilateral audio:', error);
    }
  }, [audioContext, masterGain, isEnabled]);

  /**
   * Stop bilateral audio tone
   */
  const stopBilateralAudio = useCallback(() => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      } catch (error) {
        // Oscillator may already be stopped
      }
    }

    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }

    if (pannerRef.current) {
      pannerRef.current.disconnect();
      pannerRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    isPlayingRef.current = false;
  }, []);

  /**
   * Update audio panning based on orb position
   * Smoothly transitions audio from left to right speaker
   */
  const updatePanning = useCallback(() => {
    if (!pannerRef.current || !audioContext) return;

    try {
      const now = audioContext.currentTime;
      const rampTime = 0.016; // ~60fps smoothing

      if (pannerRef.current.pan) {
        // Modern StereoPanner API
        // Use linearRamp for smooth transitions between position updates
        pannerRef.current.pan.linearRampToValueAtTime(position, now + rampTime);
      } else if (pannerRef.current.setPosition) {
        // Fallback for older PannerNode API
        // Map position to 3D space (x-axis only)
        pannerRef.current.setPosition(position, 0, 0);
      }

      // Set a stable gain level; panning alone provides the bilateral effect
      if (gainNodeRef.current) {
        const baseGain = 0.25; // Stable volume (reduced to blend with music)
        gainNodeRef.current.gain.linearRampToValueAtTime(baseGain, now + rampTime);
      }
    } catch (error) {
      console.warn('Error updating panning:', error);
    }
  }, [position, audioContext]);

  /**
   * Effect: Start/stop bilateral audio based on isActive and isEnabled
   * Depends on primitive values to avoid unnecessary restarts
   */
  useEffect(() => {
    if (isActive && isEnabled && audioContext && masterGain) {
      startBilateralAudio();
    } else {
      stopBilateralAudio();
    }

    return () => {
      stopBilateralAudio();
    };
  }, [isActive, isEnabled, audioContext, masterGain]);

  /**
   * Effect: Update panning continuously based on orb position
   * Calls updatePanning directly inline to avoid circular dependency
   */
  useEffect(() => {
    if (isPlayingRef.current && pannerRef.current && audioContext) {
      const now = audioContext.currentTime;
      const rampTime = 0.016;

      try {
        if (pannerRef.current.pan) {
          pannerRef.current.pan.linearRampToValueAtTime(position, now + rampTime);
        } else if (pannerRef.current.setPosition) {
          pannerRef.current.setPosition(position, 0, 0);
        }

        if (gainNodeRef.current) {
          const baseGain = 0.25; // Stable volume (reduced to blend with music)
          gainNodeRef.current.gain.linearRampToValueAtTime(baseGain, now + rampTime);
        }
      } catch (error) {
        console.warn('Error updating panning:', error);
      }
    }
  }, [position, audioContext]);

  return {
    isPlaying: isPlayingRef.current, // Note: This is not reactive; returns current ref value
  };
};

export default useBilateralAudio;
