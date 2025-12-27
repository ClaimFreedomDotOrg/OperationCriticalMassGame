/**
 * useThoughtBubbles Hook
 *
 * Manages intrusive thought bubbles (The Voice) that disrupt player flow.
 *
 * Implements cognitive fusion/defusion training:
 * - Thoughts appear as objects separate from player
 * - Player must actively dismiss (swipe) to continue
 * - Trains metacognitive awareness and dis-identification
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GAME_CONFIG, WORDS_OF_THE_VOICE } from '../constants/gameConfig';

const { INFECTION_SPAWN_INTERVAL, INFECTION_DURATION, BUBBLE_DISMISS_DELAY, BUBBLE_FADE_DURATION } = GAME_CONFIG;

export const useThoughtBubbles = ({ isActive, onBubbleExpired }) => {
  const [activeBubbles, setActiveBubbles] = useState([]);
  const spawnIntervalRef = useRef(null);
  const bubbleIdCounter = useRef(0);
  const onBubbleExpiredRef = useRef(onBubbleExpired);

  // Keep ref up to date
  useEffect(() => {
    onBubbleExpiredRef.current = onBubbleExpired;
  }, [onBubbleExpired]);

  /**
   * Calculate distance between two bubble positions
   * Uses Euclidean distance formula accounting for viewport percentages
   */
  const calculateDistance = (pos1, pos2) => {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  /**
   * Check if a position overlaps with existing bubbles
   * Minimum distance threshold is ~25% of viewport to ensure clear separation
   * (accounts for bubble width of ~20rem max, which is roughly 15-20% of typical mobile viewport)
   */
  const isPositionValid = (newPos, existingBubbles) => {
    const MIN_DISTANCE = 25; // Minimum distance in percentage units
    
    for (const bubble of existingBubbles) {
      const distance = calculateDistance(newPos, bubble.position);
      if (distance < MIN_DISTANCE) {
        return false;
      }
    }
    return true;
  };

  /**
   * Spawn new thought bubble
   * 
   * Position calculation accounts for:
   * - Top HUD: ~15% of viewport height
   * - Bottom controls: ~30% of viewport height  
   * - Horizontal margins: ~10% on each side
   * - Collision detection: Ensures bubbles don't overlap
   * 
   * Bubbles use dynamic max-width constraints (via CSS calc) to prevent
   * overflow on the right edge, ensuring full visibility across all viewports.
   */
  const spawnBubble = useCallback(() => {
    const randomWord = WORDS_OF_THE_VOICE[Math.floor(Math.random() * WORDS_OF_THE_VOICE.length)];
    const bubbleId = `bubble_${bubbleIdCounter.current++}`;

    setActiveBubbles(prev => {
      // Try to find a non-overlapping position
      let position = null;
      const MAX_ATTEMPTS = 20; // Maximum attempts to find valid position
      
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const candidatePosition = {
          x: Math.random() * 70 + 10, // 10-80% from left
          y: Math.random() * 35 + 20, // 20-55% from top
        };
        
        if (isPositionValid(candidatePosition, prev)) {
          position = candidatePosition;
          break;
        }
      }
      
      // Fallback: If no valid position found after max attempts,
      // use a position anyway but space it vertically from others
      if (!position) {
        position = {
          x: Math.random() * 70 + 10,
          y: (prev.length * 12 + 20) % 35 + 20, // Stagger vertically based on count
        };
      }

      // Calculate safe spawn area accounting for bubble dimensions
      // Horizontal: 10-80% (leaving ~10% margin on each side for bubble width)
      // Vertical: 20-55% (avoiding HUD at top 15%, controls at bottom 30%, with margins)
      const newBubble = {
        id: bubbleId,
        word: randomWord,
        spawnTime: Date.now(),
        position,
      };

      return [...prev, newBubble];
    });

    // Auto-remove after duration
    setTimeout(() => {
      setActiveBubbles(prev => {
        const bubble = prev.find(b => b.id === bubbleId);
        // If bubble still exists (wasn't dismissed), it expired naturally
        if (bubble && onBubbleExpiredRef.current) {
          onBubbleExpiredRef.current(bubbleId);
        }
        return prev.filter(b => b.id !== bubbleId);
      });
    }, INFECTION_DURATION);
  }, []);

  /**
   * Start spawning bubbles
   */
  useEffect(() => {
    if (!isActive) {
      setActiveBubbles([]);
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
        spawnIntervalRef.current = null;
      }
      return;
    }

    // Spawn first bubble after delay
    const firstBubbleTimeout = setTimeout(() => {
      spawnBubble();
    }, INFECTION_SPAWN_INTERVAL);

    // Regular spawning
    spawnIntervalRef.current = setInterval(() => {
      spawnBubble();
    }, INFECTION_SPAWN_INTERVAL);

    return () => {
      clearTimeout(firstBubbleTimeout);
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [isActive, spawnBubble]);

  /**
   * Dismiss a bubble (swipe action)
   */
  const dismissBubble = useCallback((bubbleId) => {
    // Mark bubble as dismissing (triggers CSS animation)
    setActiveBubbles(prev => prev.map(b =>
      b.id === bubbleId ? { ...b, isDismissing: true } : b
    ));

    // Remove from DOM after animation completes
    setTimeout(() => {
      setActiveBubbles(prev => prev.filter(b => b.id !== bubbleId));
    }, BUBBLE_DISMISS_DELAY + BUBBLE_FADE_DURATION);

    return true;
  }, []);

  /**
   * Check if any bubbles are blocking the player
   */
  const hasBlockingBubbles = activeBubbles.length > 0;

  return {
    activeBubbles,
    dismissBubble,
    hasBlockingBubbles,
    bubbleCount: activeBubbles.length,
    spawnBubble, // Expose for manual spawning (e.g., on miss)
  };
};

export default useThoughtBubbles;
