/**
 * App Component
 *
 * Root component managing game state and screen transitions
 */

import React, { useCallback, useEffect, useState, useMemo } from 'react';
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
  const [visualTaps, setVisualTaps] = useState([]); // { id, x, y, type }
  const [gameMode, setGameMode] = useState(null); // 'single' or 'multi'

  /**
   * Generate body cells for visualization
   */
  const cells = useMemo(() => {
    const generatedCells = [];
    const parts = [
      { count: 30, xMin: 45, xMax: 55, yMin: 15, yMax: 25 }, // Head
      { count: 100, xMin: 40, xMax: 60, yMin: 25, yMax: 55 }, // Torso
      { count: 40, xMin: 20, xMax: 40, yMin: 28, yMax: 50 }, // Left Arm
      { count: 40, xMin: 60, xMax: 80, yMin: 28, yMax: 50 }, // Right Arm
      { count: 45, xMin: 40, xMax: 48, yMin: 55, yMax: 85 }, // Left Leg
      { count: 45, xMin: 52, xMax: 60, yMin: 55, yMax: 85 }, // Right Leg
    ];

    parts.forEach((part, partIndex) => {
      for (let i = 0; i < part.count; i++) {
        generatedCells.push({
          id: `${partIndex}-${i}`,
          left: part.xMin + Math.random() * (part.xMax - part.xMin),
          top: part.yMin + Math.random() * (part.yMax - part.yMin),
          delay: Math.random() * 2,
          size: Math.random() * 3 + 2
        });
      }
    });
    return generatedCells;
  }, []);

  /**
   * Trigger visual tap indicator
   */
  const triggerVisualTap = useCallback((x, y, type = 'TAP') => {
    const id = Date.now() + Math.random();
    setVisualTaps(prev => [...prev, { id, x, y, type }]);
    setTimeout(() => {
      setVisualTaps(prev => prev.filter(t => t.id !== id));
    }, 600);
  }, []);

  /**
   * Handle game start
   */
  const handleStart = useCallback(({ mode, gameId }) => {
    setGameMode(mode);
    const newSessionId = mode === 'multi' && gameId ? gameId : generateSessionId();
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
    setGameMode(null);
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
      {isIdle && (
        <IdleScreen
          onStart={handleStart}
          visualTaps={visualTaps}
          triggerVisualTap={triggerVisualTap}
        />
      )}

      {isPlaying && (
        <GameScreen
          sessionId={sessionId}
          playerId={playerId}
          gameMode={gameMode}
          cells={cells}
          visualTaps={visualTaps}
          triggerVisualTap={triggerVisualTap}
        />
      )}

      {isBreakthrough && (
        <BreakthroughScreen
          onReset={handleReset}
          sessionStats={sessionStats}
          visualTaps={visualTaps}
          triggerVisualTap={triggerVisualTap}
        />
      )}
    </div>
  );
}

export default App;
