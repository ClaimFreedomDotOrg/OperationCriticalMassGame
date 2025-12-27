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

export const useThoughtBubbles = ({ isActive, isPaused = false, onBubbleExpired }) => {
  const [activeBubbles, setActiveBubbles] = useState([]);
  const spawnIntervalRef = useRef(null);
  const bubbleIdCounter = useRef(0);
  const onBubbleExpiredRef = useRef(onBubbleExpired);
  const pauseStartTimeRef = useRef(null);
  const totalPausedTimeRef = useRef(0);
  const bubbleTimersRef = useRef(new Map()); // Track timeout IDs for each bubble
  const isPausedRef = useRef(isPaused); // Track current pause state

  // Keep refs up to date
  useEffect(() => {
    onBubbleExpiredRef.current = onBubbleExpired;
  }, [onBubbleExpired]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  /**
   * Spawn new thought bubble
   *
   * Position calculation accounts for:
   * - Top HUD: ~15% of viewport height
   * - Bottom controls: ~30% of viewport height
   * - Horizontal margins: ~10% on each side
   *
   * Bubbles use dynamic max-width constraints (via CSS calc) to prevent
   * overflow on the right edge, ensuring full visibility across all viewports.
   */
  const spawnBubble = useCallback(() => {
    const randomWord = WORDS_OF_THE_VOICE[Math.floor(Math.random() * WORDS_OF_THE_VOICE.length)];
    const bubbleId = `bubble_${bubbleIdCounter.current++}`;

    // Calculate safe spawn area accounting for bubble dimensions
    // Horizontal: 10-80% (leaving ~10% margin on each side for bubble width)
    // Vertical: 20-55% (avoiding HUD at top 15%, controls at bottom 30%, with margins)
    const newBubble = {
      id: bubbleId,
      word: randomWord,
      spawnTime: Date.now(),
      pausedTime: 0, // Track total time this bubble has been paused
      position: {
        x: Math.random() * 70 + 10, // 10-80% from left
        y: Math.random() * 35 + 20, // 20-55% from top
      },
    };

    setActiveBubbles(prev => [...prev, newBubble]);

    // Set up expiration timer (will be managed by pause/resume logic)
    const timerId = setTimeout(() => {
      // Don't expire if currently paused
      if (isPausedRef.current) {
        return;
      }

      setActiveBubbles(prev => {
        const bubble = prev.find(b => b.id === bubbleId);
        // If bubble still exists (wasn't dismissed), it expired naturally
        if (bubble && onBubbleExpiredRef.current) {
          onBubbleExpiredRef.current(bubbleId);
        }
        bubbleTimersRef.current.delete(bubbleId);
        return prev.filter(b => b.id !== bubbleId);
      });
    }, INFECTION_DURATION);

    bubbleTimersRef.current.set(bubbleId, {
      timerId,
      spawnTime: Date.now(),
      remainingTime: INFECTION_DURATION,
    });
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

    // Don't start spawning if already paused
    if (isPaused) {
      return;
    }

    // Spawn first bubble after delay
    const firstBubbleTimeout = setTimeout(() => {
      if (!isPausedRef.current) {
        spawnBubble();
      }
    }, INFECTION_SPAWN_INTERVAL);

    // Regular spawning
    spawnIntervalRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        spawnBubble();
      }
    }, INFECTION_SPAWN_INTERVAL);

    return () => {
      clearTimeout(firstBubbleTimeout);
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [isActive, isPaused, spawnBubble]);

  /**
   * Handle pause/resume state
   */
  useEffect(() => {
    if (!isActive) return;

    if (isPaused) {
      // Pause: Clear spawn interval and record pause start time
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
        spawnIntervalRef.current = null;
      }
      pauseStartTimeRef.current = Date.now();

      // Clear all bubble expiration timers (we'll restart them on resume)
      bubbleTimersRef.current.forEach(({ timerId, spawnTime }, bubbleId) => {
        clearTimeout(timerId);
        const elapsed = Date.now() - spawnTime;
        const remaining = Math.max(0, INFECTION_DURATION - elapsed);
        bubbleTimersRef.current.set(bubbleId, {
          timerId: null,
          spawnTime,
          remainingTime: remaining,
        });
      });
    } else if (pauseStartTimeRef.current) {
      // Resume: Restart spawn interval and bubble timers with remaining time
      const pauseDuration = Date.now() - pauseStartTimeRef.current;
      totalPausedTimeRef.current += pauseDuration;
      pauseStartTimeRef.current = null;

      // Restart spawn interval
      spawnIntervalRef.current = setInterval(() => {
        spawnBubble();
      }, INFECTION_SPAWN_INTERVAL);
// Double-check we're not paused when timer fires
            if (isPausedRef.current) {
              return;
            }


      // Restart bubble expiration timers with remaining time
      bubbleTimersRef.current.forEach(({ remainingTime, spawnTime }, bubbleId) => {
        if (remainingTime > 0) {
          const timerId = setTimeout(() => {
            setActiveBubbles(prev => {
              const bubble = prev.find(b => b.id === bubbleId);
              if (bubble && onBubbleExpiredRef.current) {
                onBubbleExpiredRef.current(bubbleId);
              }
              bubbleTimersRef.current.delete(bubbleId);
              return prev.filter(b => b.id !== bubbleId);
            });
          }, remainingTime);

          bubbleTimersRef.current.set(bubbleId, {
            timerId,
            spawnTime,
            remainingTime,
          });
        }
      });
    }
  }, [isPaused, isActive, spawnBubble]);

  /**
   * Dismiss a bubble (swipe action)
   */
  const dismissBubble = useCallback((bubbleId) => {
    // Clear any pending expiration timer
    const timerInfo = bubbleTimersRef.current.get(bubbleId);
    if (timerInfo?.timerId) {
      clearTimeout(timerInfo.timerId);
    }
    bubbleTimersRef.current.delete(bubbleId);

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
