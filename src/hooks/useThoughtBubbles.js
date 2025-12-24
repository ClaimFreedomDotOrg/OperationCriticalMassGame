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
   * Spawn new thought bubble
   */
  const spawnBubble = useCallback(() => {
    const randomWord = WORDS_OF_THE_VOICE[Math.floor(Math.random() * WORDS_OF_THE_VOICE.length)];
    const bubbleId = `bubble_${bubbleIdCounter.current++}`;

    const newBubble = {
      id: bubbleId,
      word: randomWord,
      spawnTime: Date.now(),
      position: {
        x: Math.random() * 70 + 15, // 15-85% from left (avoid edges)
        y: Math.random() * 50 + 20, // 20-70% from top (avoid HUD and controls)
      },
    };

    setActiveBubbles(prev => [...prev, newBubble]);

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
    // Mark bubble as dismissing
    setActiveBubbles(prev => prev.map(b =>
      b.id === bubbleId ? { ...b, isDismissing: true } : b
    ));

    // After delay, start fade animation
    // Use requestAnimationFrame to ensure browser renders dismissing state first
    setTimeout(() => {
      requestAnimationFrame(() => {
        setActiveBubbles(prev => prev.map(b =>
          b.id === bubbleId ? { ...b, isFading: true } : b
        ));
      });
    }, BUBBLE_DISMISS_DELAY);

    // Remove after delay + fade duration
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
