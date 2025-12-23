/**
 * useBilateralStimulation Hook
 *
 * Implements bilateral stimulation based on EMDR research.
 *
 * Scientific Basis:
 * - Andrade et al. (1997): Bilateral eye movements reduce emotional intensity
 * - van den Hout & Engelhard (2012): Working memory taxation prevents
 *   full activation of distressing thoughts
 * - Propper et al. (2007): Enhances interhemispheric communication
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';

const { TAP_WINDOW_MS, BEAT_INTERVAL_MS } = GAME_CONFIG;

export const useBilateralStimulation = ({ isActive, onSync, onMiss }) => {
  const [activeSide, setActiveSide] = useState('LEFT'); // Current beat side
  const [lastBeatTime, setLastBeatTime] = useState(0);
  const intervalRef = useRef(null);
  const beatCountRef = useRef(0);

  /**
   * Start the bilateral pulse rhythm
   */
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initialize first beat
    const startTime = Date.now();
    setLastBeatTime(startTime);
    beatCountRef.current = 0;

    // Alternating beat timer
    intervalRef.current = setInterval(() => {
      beatCountRef.current += 1;
      const currentSide = beatCountRef.current % 2 === 0 ? 'LEFT' : 'RIGHT';
      setActiveSide(currentSide);
      setLastBeatTime(Date.now());
    }, BEAT_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  /**
   * Handle player tap
   * Validates timing within TAP_WINDOW_MS
   */
  const handleTap = useCallback((side) => {
    const now = Date.now();
    const timeSinceLastBeat = now - lastBeatTime;

    // Check if tap is within the timing window
    const isInSync = Math.abs(timeSinceLastBeat) < TAP_WINDOW_MS;

    // Check if correct side
    const isCorrectSide = side === activeSide;

    if (isInSync && isCorrectSide) {
      onSync?.();
      return { success: true, timing: timeSinceLastBeat };
    } else {
      onMiss?.();
      return { success: false, timing: timeSinceLastBeat };
    }
  }, [lastBeatTime, activeSide, onSync, onMiss]);

  /**
   * Calculate accuracy for a given tap time
   * Returns value from 0 (worst) to 1 (perfect)
   */
  const calculateAccuracy = useCallback((tapTime) => {
    const timeDiff = Math.abs(tapTime - lastBeatTime);
    return Math.max(0, 1 - (timeDiff / TAP_WINDOW_MS));
  }, [lastBeatTime]);

  return {
    activeSide,
    lastBeatTime,
    handleTap,
    calculateAccuracy,
    beatCount: beatCountRef.current,
  };
};

export default useBilateralStimulation;
