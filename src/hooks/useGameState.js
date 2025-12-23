/**
 * useGameState Hook
 *
 * Central state management for game phases and transitions
 * Implements state machine: IDLE → PLAYING → BREAKTHROUGH → IDLE
 */

import { useState, useCallback } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';

const { STATES } = GAME_CONFIG;

export const useGameState = () => {
  const [gameState, setGameState] = useState(STATES.IDLE);
  const [sessionId, setSessionId] = useState(null);
  const [playerId, setPlayerId] = useState(null);

  /**
   * Start a new game session
   */
  const startGame = useCallback((newSessionId, newPlayerId) => {
    setSessionId(newSessionId);
    setPlayerId(newPlayerId);
    setGameState(STATES.PLAYING);
  }, []);

  /**
   * Trigger breakthrough state (100% coherence achieved)
   */
  const triggerBreakthrough = useCallback(() => {
    setGameState(STATES.BREAKTHROUGH);
  }, []);

  /**
   * Reset to idle state
   */
  const resetGame = useCallback(() => {
    setGameState(STATES.IDLE);
    setSessionId(null);
    setPlayerId(null);
  }, []);

  return {
    gameState,
    sessionId,
    playerId,
    startGame,
    triggerBreakthrough,
    resetGame,
    isIdle: gameState === STATES.IDLE,
    isPlaying: gameState === STATES.PLAYING,
    isBreakthrough: gameState === STATES.BREAKTHROUGH,
  };
};

export default useGameState;
