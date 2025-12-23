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

export const useBilateralStimulation = ({ isActive, onSync, onMiss }) => {
  const [position, setPosition] = useState(0); // -1 (left) to 1 (right), 0 is center
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  /**
   * Start the smooth oscillation animation
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

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      // Sine wave oscillation: -1 to 1
      const newPosition = Math.sin((elapsed / OSCILLATION_PERIOD) * Math.PI * 2);
      setPosition(newPosition);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive]);

  /**
   * Handle player tap
   * Validates if tap side matches current oscillation side
   */
  const handleTap = useCallback((side) => {
    // Determine which side of center the oscillation is on
    const oscillationSide = position < 0 ? 'LEFT' : 'RIGHT';

    // Check if tapped side matches oscillation side
    const isCorrectSide = side === oscillationSide;

    if (isCorrectSide) {
      onSync?.();
      return { success: true, position };
    } else {
      onMiss?.();
      return { success: false, position };
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
