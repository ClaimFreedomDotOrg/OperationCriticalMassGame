/**
 * useBilateralStimulation Hook
 *
 * Implements bilateral stimulation based on EMDR research.
 * Uses smooth oscillation across a center line rather than discrete beats.
 *
 * Scientific Basis:
 * - Andrade et al. (1997): Bilateral eye movements reduce emotional intensity
 * - van den Hout & Engelhard (2012): Working memory taxation prevents
 *   full activation of distressing thoughts
 * - Propper et al. (2007): Enhances interhemispheric communication
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';

const { BPM } = GAME_CONFIG;
const OSCILLATION_PERIOD = (60000 / BPM) * 2; // Full left-right-left cycle time

export const useBilateralStimulation = ({ isActive, isPaused = false, onSync, onMiss }) => {
  const [position, setPosition] = useState(0); // -1 (left) to 1 (right), 0 is center
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0); // Track how long we've been paused
  const pauseStartRef = useRef(null); // When pause started
  const lastTappedSideRef = useRef(null); // Track which side was last successfully tapped
  const previousSideRef = useRef(null); // Track the previous oscillation side

  /**
   * Start the smooth oscillation animation (pauses when isPaused is true)
   */
  useEffect(() => {
    if (!isActive) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;

    const animate = () => {
      // Handle pause state
      if (isPaused) {
        if (!pauseStartRef.current) {
          pauseStartRef.current = Date.now();
        }
        // Keep position frozen while paused
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      } else if (pauseStartRef.current) {
        // Resuming from pause - add paused duration to total paused time
        pausedTimeRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }

      const elapsed = Date.now() - startTimeRef.current - pausedTimeRef.current;
      // Sine wave oscillation: -1 to 1
      const newPosition = Math.sin((elapsed / OSCILLATION_PERIOD) * Math.PI * 2);
      setPosition(newPosition);

      // Detect side change and reset tap tracking
      const currentSide = newPosition < 0 ? 'LEFT' : 'RIGHT';
      if (previousSideRef.current !== null && previousSideRef.current !== currentSide) {
        // Side changed, allow taps again on the new side
        lastTappedSideRef.current = null;
      }
      previousSideRef.current = currentSide;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      pauseStartRef.current = null;
      pausedTimeRef.current = 0;
    };
  }, [isActive, isPaused]);

  /**
   * Handle player tap
   * Validates if tap side matches current oscillation side
   * Only counts the first successful tap per side
   */
  const handleTap = useCallback((side) => {
    // Determine which side of center the oscillation is on
    const oscillationSide = position < 0 ? 'LEFT' : 'RIGHT';

    // Check if this side was already tapped successfully
    if (lastTappedSideRef.current === oscillationSide) {
      // Already tapped this side, ignore (don't count as miss or success)
      return { success: false, position, alreadyTapped: true };
    }

    // Check if tapped side matches oscillation side
    const isCorrectSide = side === oscillationSide;

    if (isCorrectSide) {
      lastTappedSideRef.current = oscillationSide; // Mark this side as tapped
      onSync?.();
      return { success: true, position, alreadyTapped: false };
    } else {
      onMiss?.();
      return { success: false, position, alreadyTapped: false };
    }
  }, [position, onSync, onMiss]);

  /**
   * Get which side the oscillation is currently on
   */
  const activeSide = position < 0 ? 'LEFT' : 'RIGHT';

  return {
    position, // -1 to 1, for visual rendering
    activeSide,
    handleTap,
  };
};

export default useBilateralStimulation;
