/**
 * App Component
 *
 * Root component managing game state and screen transitions
 */

import React, { useCallback, useEffect, useState } from 'react';
import useGameState from './hooks/useGameState';
import IdleScreen from './components/IdleScreen';
import GameScreen from './components/GameScreen';
import BreakthroughScreen from './components/BreakthroughScreen';
import { generatePlayerId, generateSessionId } from './config/firebase';
import { GAME_CONFIG } from './constants/gameConfig';

function App() {
  const {
    gameState,
    sessionId,
    playerId,
    startGame,
    triggerBreakthrough,
    resetGame,
    isIdle,
    isPlaying,
    isBreakthrough,
  } = useGameState();

  const [sessionStats, setSessionStats] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  /**
   * Handle game start
   */
  const handleStart = useCallback(() => {
    const newSessionId = generateSessionId();
    const newPlayerId = generatePlayerId();
    setSessionStartTime(Date.now());
    startGame(newSessionId, newPlayerId);
  }, [startGame]);

  /**
   * Handle game reset
   */
  const handleReset = useCallback(() => {
    setSessionStats(null);
    setSessionStartTime(null);
    resetGame();
  }, [resetGame]);

  /**
   * Monitor for breakthrough condition
   * In a real implementation, this would listen to Firebase for 100% coherence
   */
  useEffect(() => {
    if (!isPlaying) return;

    // TODO: Connect to Firebase coherence meter
    // For now, this is a placeholder for testing breakthrough screen
    // const checkBreakthrough = setInterval(() => {
    //   if (coherence >= 100) {
    //     triggerBreakthrough();
    //   }
    // }, 1000);

    // return () => clearInterval(checkBreakthrough);
  }, [isPlaying, triggerBreakthrough]);

  /**
   * Calculate session stats on breakthrough
   */
  useEffect(() => {
    if (isBreakthrough && sessionStartTime) {
      setSessionStats({
        duration: Date.now() - sessionStartTime,
        activePlayers: 1, // TODO: Get from Firebase
      });
    }
  }, [isBreakthrough, sessionStartTime]);

  return (
    <div className="App">
      {isIdle && <IdleScreen onStart={handleStart} />}

      {isPlaying && (
        <GameScreen
          sessionId={sessionId}
          playerId={playerId}
        />
      )}

      {isBreakthrough && (
        <BreakthroughScreen
          onReset={handleReset}
          sessionStats={sessionStats}
        />
      )}
    </div>
  );
}

export default App;
