/**
 * useGameStats Hook
 *
 * Comprehensive statistics tracking for gameplay session
 * Tracks every conceivable metric for post-game analysis
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export const useGameStats = () => {
  const sessionStartTime = useRef(null);
  const lastTapTime = useRef(null);
  const responseTimes = useRef([]);
  const coherenceHistory = useRef([]);
  
  const [stats, setStats] = useState({
    // Tap Metrics
    totalTaps: 0,
    syncedTaps: 0,
    missedTaps: 0,
    leftTaps: 0,
    rightTaps: 0,
    
    // Thought Bubble Metrics
    thoughtBubblesDismissed: 0,
    thoughtBubblesExpired: 0,
    totalThoughtBubbles: 0,
    
    // Timing Metrics
    sessionDuration: 0,
    averageResponseTime: 0,
    fastestTap: null,
    slowestTap: null,
    
    // Coherence Metrics
    peakCoherence: 0,
    averageCoherence: 0,
    timeAtMaxCoherence: 0,
    
    // Score
    finalScore: 0,
  });

  /**
   * Initialize session start time
   */
  useEffect(() => {
    if (!sessionStartTime.current) {
      sessionStartTime.current = Date.now();
    }
  }, []);

  /**
   * Record a tap event
   */
  const recordTap = useCallback(({ side, isSync }) => {
    const currentTime = Date.now();
    
    // Calculate response time if there was a previous tap
    if (lastTapTime.current) {
      const responseTime = currentTime - lastTapTime.current;
      responseTimes.current.push(responseTime);
    }
    lastTapTime.current = currentTime;

    setStats(prev => {
      const newStats = {
        ...prev,
        totalTaps: prev.totalTaps + 1,
        leftTaps: side === 'LEFT' ? prev.leftTaps + 1 : prev.leftTaps,
        rightTaps: side === 'RIGHT' ? prev.rightTaps + 1 : prev.rightTaps,
      };

      if (isSync) {
        newStats.syncedTaps = prev.syncedTaps + 1;
      } else {
        newStats.missedTaps = prev.missedTaps + 1;
      }

      // Calculate average response time
      if (responseTimes.current.length > 0) {
        const sum = responseTimes.current.reduce((a, b) => a + b, 0);
        newStats.averageResponseTime = Math.round(sum / responseTimes.current.length);
        newStats.fastestTap = Math.min(...responseTimes.current);
        newStats.slowestTap = Math.max(...responseTimes.current);
      }

      return newStats;
    });
  }, []);

  /**
   * Record thought bubble dismissed
   */
  const recordThoughtDismissed = useCallback(() => {
    setStats(prev => ({
      ...prev,
      thoughtBubblesDismissed: prev.thoughtBubblesDismissed + 1,
      totalThoughtBubbles: prev.totalThoughtBubbles + 1,
    }));
  }, []);

  /**
   * Record thought bubble expired (missed)
   */
  const recordThoughtExpired = useCallback(() => {
    setStats(prev => ({
      ...prev,
      thoughtBubblesExpired: prev.thoughtBubblesExpired + 1,
      totalThoughtBubbles: prev.totalThoughtBubbles + 1,
    }));
  }, []);

  /**
   * Update coherence tracking
   */
  const updateCoherence = useCallback((coherence) => {
    coherenceHistory.current.push(coherence);
    
    setStats(prev => {
      const newPeak = Math.max(prev.peakCoherence, coherence);
      const avgCoherence = coherenceHistory.current.length > 0
        ? Math.round(coherenceHistory.current.reduce((a, b) => a + b, 0) / coherenceHistory.current.length)
        : 0;
      
      let timeAtMax = prev.timeAtMaxCoherence;
      if (coherence >= 100) {
        timeAtMax += 1; // Increment counter (depends on update frequency)
      }

      return {
        ...prev,
        peakCoherence: newPeak,
        averageCoherence: avgCoherence,
        timeAtMaxCoherence: timeAtMax,
      };
    });
  }, []);

  /**
   * Update score
   */
  const updateScore = useCallback((score) => {
    setStats(prev => ({
      ...prev,
      finalScore: score,
    }));
  }, []);

  /**
   * Update session duration
   */
  const updateDuration = useCallback(() => {
    if (sessionStartTime.current) {
      const duration = Date.now() - sessionStartTime.current;
      setStats(prev => ({
        ...prev,
        sessionDuration: duration,
      }));
    }
  }, []);

  /**
   * Calculate tap accuracy percentage
   */
  const getTapAccuracy = useCallback(() => {
    if (stats.totalTaps === 0) return 0;
    return Math.round((stats.syncedTaps / stats.totalTaps) * 100);
  }, [stats.totalTaps, stats.syncedTaps]);

  /**
   * Calculate thought bubble success rate
   */
  const getThoughtBubbleSuccessRate = useCallback(() => {
    if (stats.totalThoughtBubbles === 0) return 0;
    return Math.round((stats.thoughtBubblesDismissed / stats.totalThoughtBubbles) * 100);
  }, [stats.totalThoughtBubbles, stats.thoughtBubblesDismissed]);

  /**
   * Reset all stats
   */
  const resetStats = useCallback(() => {
    sessionStartTime.current = Date.now();
    lastTapTime.current = null;
    responseTimes.current = [];
    coherenceHistory.current = [];
    
    setStats({
      totalTaps: 0,
      syncedTaps: 0,
      missedTaps: 0,
      leftTaps: 0,
      rightTaps: 0,
      thoughtBubblesDismissed: 0,
      thoughtBubblesExpired: 0,
      totalThoughtBubbles: 0,
      sessionDuration: 0,
      averageResponseTime: 0,
      fastestTap: null,
      slowestTap: null,
      peakCoherence: 0,
      averageCoherence: 0,
      timeAtMaxCoherence: 0,
      finalScore: 0,
    });
  }, []);

  return {
    stats,
    recordTap,
    recordThoughtDismissed,
    recordThoughtExpired,
    updateCoherence,
    updateScore,
    updateDuration,
    getTapAccuracy,
    getThoughtBubbleSuccessRate,
    resetStats,
  };
};

export default useGameStats;
