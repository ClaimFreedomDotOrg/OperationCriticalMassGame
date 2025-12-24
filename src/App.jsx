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
      { count: 60, xMin: 38, xMax: 62, yMin: 12, yMax: 22 }, // Head (wider and more circular)
      { count: 20, xMin: 46, xMax: 54, yMin: 22, yMax: 28 }, // Neck (narrower)
      { count: 80, xMin: 38, xMax: 62, yMin: 28, yMax: 42 }, // Upper Torso (chest)
      { count: 60, xMin: 40, xMax: 60, yMin: 42, yMax: 56 }, // Lower Torso (abdomen)
      { count: 35, xMin: 22, xMax: 38, yMin: 30, yMax: 44 }, // Left Upper Arm
      { count: 25, xMin: 18, xMax: 28, yMin: 44, yMax: 58 }, // Left Forearm
      { count: 35, xMin: 62, xMax: 78, yMin: 30, yMax: 44 }, // Right Upper Arm
      { count: 25, xMin: 72, xMax: 82, yMin: 44, yMax: 58 }, // Right Forearm
      { count: 50, xMin: 38, xMax: 48, yMin: 56, yMax: 72 }, // Left Thigh
      { count: 35, xMin: 40, xMax: 48, yMin: 72, yMax: 88 }, // Left Calf
      { count: 50, xMin: 52, xMax: 62, yMin: 56, yMax: 72 }, // Right Thigh
      { count: 35, xMin: 52, xMax: 60, yMin: 72, yMax: 88 }, // Right Calf
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
    <div className="App w-full max-w-full h-full overflow-hidden">
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
          onBreakthrough={triggerBreakthrough}
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
