/**
 * GameScreen Component
 *
 * Main gameplay interface for mobile players (Cells)
 * Implements bilateral tapping, thought bubble dismissal, and visual feedback
 */

import React, { useState, useCallback, useEffect } from 'react';
import useBilateralStimulation from '../hooks/useBilateralStimulation';
import useThoughtBubbles from '../hooks/useThoughtBubbles';
import useFirebaseSync from '../hooks/useFirebaseSync';
import ThoughtBubble from './ThoughtBubble';
import TapButton from './TapButton';
import PlayerFeedback from './PlayerFeedback';
import { GAME_CONFIG } from '../constants/gameConfig';

const GameScreen = ({ sessionId, playerId }) => {
  const [feedback, setFeedback] = useState(null); // 'HIT', 'MISS', or null
  const [score, setScore] = useState(0);
  const [isInSync, setIsInSync] = useState(false);

  // Firebase sync
  const { coherence, activePlayers, updatePlayerState, connectionStatus } = useFirebaseSync({
    sessionId,
    playerId,
  });

  // Thought bubbles (The Voice)
  const { activeBubbles, dismissBubble, hasBlockingBubbles } = useThoughtBubbles({
    isActive: true,
  });

  /**
   * Handle successful sync
   */
  const handleSync = useCallback(() => {
    setIsInSync(true);
    setFeedback('HIT');
    setScore(prev => prev + 10);

    // Update Firebase with sync status
    updatePlayerState({
      isInSync: true,
      score: score + 10,
      lastTap: Date.now(),
    });

    // Clear feedback after duration
    setTimeout(() => setFeedback(null), GAME_CONFIG.FEEDBACK_DURATION);
  }, [score, updatePlayerState]);

  /**
   * Handle missed tap
   */
  const handleMiss = useCallback(() => {
    setIsInSync(false);
    setFeedback('MISS');

    updatePlayerState({
      isInSync: false,
      score,
      lastTap: Date.now(),
    });

    setTimeout(() => setFeedback(null), GAME_CONFIG.FEEDBACK_DURATION);
  }, [score, updatePlayerState]);

  // Bilateral stimulation
  const { activeSide, handleTap } = useBilateralStimulation({
    isActive: true,
    onSync: handleSync,
    onMiss: handleMiss,
  });

  /**
   * Handle tap button press
   */
  const onTapButton = useCallback((side) => {
    // Cannot tap while bubbles are blocking
    if (hasBlockingBubbles) {
      handleMiss();
      return;
    }

    handleTap(side);
  }, [hasBlockingBubbles, handleTap, handleMiss]);

  /**
   * Handle bubble swipe dismissal
   */
  const onDismissBubble = useCallback((bubbleId) => {
    dismissBubble(bubbleId);
    setScore(prev => prev + 5);
  }, [dismissBubble]);

  /**
   * Determine container style based on state
   */
  const getContainerStyle = () => {
    if (hasBlockingBubbles) {
      return 'bg-red-950/40 border-red-500 shadow-[inset_0_0_50px_rgba(220,38,38,0.5)]';
    }
    if (feedback === 'HIT') {
      return 'bg-black border-amber-400 shadow-[inset_0_0_30px_rgba(251,191,36,0.3)]';
    }
    return 'bg-black border-gray-800';
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-all duration-300 border-4 rounded-xl ${getContainerStyle()}`}
      style={{ touchAction: 'none' }}
    >
      {/* Header: Score and Coherence */}
      <div className="p-4 flex justify-between items-center text-sm z-30">
        <div className="text-cyan-400">
          Score: <span className="font-bold text-lg">{score}</span>
        </div>
        <div className="text-amber-400">
          Coherence: <span className="font-bold text-lg">{Math.round(coherence)}%</span>
        </div>
        <div className="text-gray-400 text-xs">
          Players: {activePlayers}
        </div>
      </div>

      {/* Connection Status Warning */}
      {connectionStatus !== 'connected' && (
        <div className="px-4 py-2 bg-red-900/50 text-red-200 text-xs text-center">
          Connection lost. You're still contributing—reconnecting...
        </div>
      )}

      {/* Main Play Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-6 z-10">

        {/* Pulse Visualizer */}
        <div className="mb-12 w-full max-w-md">
          <div className="flex justify-between items-center h-32">
            {/* Left Pulse */}
            <div
              className={`w-24 h-24 rounded-full transition-all duration-100 ${
                activeSide === 'LEFT'
                  ? 'bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.8)] scale-110'
                  : 'bg-gray-800 opacity-30'
              }`}
            />

            {/* Center Line */}
            <div className="flex-1 h-1 bg-gray-800 mx-4" />

            {/* Right Pulse */}
            <div
              className={`w-24 h-24 rounded-full transition-all duration-100 ${
                activeSide === 'RIGHT'
                  ? 'bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.8)] scale-110'
                  : 'bg-gray-800 opacity-30'
              }`}
            />
          </div>
        </div>

        {/* Feedback Display */}
        {feedback && <PlayerFeedback feedback={feedback} />}

        {/* Thought Bubbles */}
        {activeBubbles.map(bubble => (
          <ThoughtBubble
            key={bubble.id}
            bubble={bubble}
            onDismiss={() => onDismissBubble(bubble.id)}
          />
        ))}
      </div>

      {/* Bottom Controls: Tap Buttons */}
      <div className="p-6 flex justify-center gap-8 z-20">
        <TapButton
          side="LEFT"
          isActive={activeSide === 'LEFT' && !hasBlockingBubbles}
          onTap={() => onTapButton('LEFT')}
        />
        <TapButton
          side="RIGHT"
          isActive={activeSide === 'RIGHT' && !hasBlockingBubbles}
          onTap={() => onTapButton('RIGHT')}
        />
      </div>

      {/* Instructions */}
      <div className="p-4 text-center text-gray-500 text-xs">
        {hasBlockingBubbles
          ? 'Swipe away thoughts to continue'
          : 'Tap the glowing button in rhythm'}
      </div>
    </div>
  );
};

export default GameScreen;
