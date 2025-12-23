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

// Icon components
const ActivityIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const UsersIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const ShieldAlertIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const GameScreen = ({ sessionId, playerId, gameMode = 'single', cells = [], visualTaps = [], triggerVisualTap }) => {
  const [feedback, setFeedback] = useState(null); // 'HIT', 'MISS', or null
  const [score, setScore] = useState(0);
  const [isInSync, setIsInSync] = useState(false);
  const [localCoherence, setLocalCoherence] = useState(0);
  const [localActivePlayers] = useState(1);

  // Firebase sync (only in multiplayer mode)
  const firebaseSync = gameMode === 'multi' ? useFirebaseSync({
    sessionId,
    playerId,
  }) : null;

  // Use Firebase data in multiplayer, local state in single player
  const coherence = gameMode === 'multi' ? (firebaseSync?.coherence || 0) : localCoherence;
  const activePlayers = gameMode === 'multi' ? (firebaseSync?.activePlayers || 0) : localActivePlayers;
  const updatePlayerState = gameMode === 'multi' ? firebaseSync?.updatePlayerState : () => {};
  const connectionStatus = gameMode === 'multi' ? (firebaseSync?.connectionStatus || 'connecting') : 'local';

  /**
   * Handle missed tap
   */
  const handleMiss = useCallback(() => {
    setIsInSync(false);
    setFeedback('MISS');

    // Update local coherence in single-player mode
    if (gameMode === 'single') {
      setLocalCoherence(prev => Math.max(0, prev - 1)); // Decrease by 1% per miss
    }

    updatePlayerState({
      isInSync: false,
      score,
      lastTap: Date.now(),
    });

    setTimeout(() => setFeedback(null), GAME_CONFIG.FEEDBACK_DURATION);
  }, [score, updatePlayerState, gameMode]);

  // Thought bubbles (The Voice)
  const { activeBubbles, dismissBubble, hasBlockingBubbles } = useThoughtBubbles({
    isActive: true,
    onBubbleExpired: handleMiss,
  });

  /**
   * Handle successful sync
   */
  const handleSync = useCallback(() => {
    setIsInSync(true);
    setFeedback('HIT');
    setScore(prev => prev + 10);

    // Update local coherence in single-player mode
    if (gameMode === 'single') {
      setLocalCoherence(prev => Math.min(100, prev + 2)); // Increase by 2% per hit
    }

    // Update Firebase with sync status in multiplayer
    updatePlayerState({
      isInSync: true,
      score: score + 10,
      lastTap: Date.now(),
    });

    // Clear feedback after duration
    setTimeout(() => setFeedback(null), GAME_CONFIG.FEEDBACK_DURATION);
  }, [score, updatePlayerState, gameMode]);

  // Bilateral stimulation
  const { activeSide, handleTap, position } = useBilateralStimulation({
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

    // Trigger visual tap indicator
    let tapX, tapY;
    if (side === 'LEFT') {
      tapX = 15 + Math.random() * 20;
    } else {
      tapX = 65 + Math.random() * 20;
    }
    tapY = 78 + Math.random() * 10;

    if (triggerVisualTap) {
      triggerVisualTap(tapX, tapY, 'TAP');
    }

    handleTap(side);
  }, [hasBlockingBubbles, handleTap, handleMiss, triggerVisualTap]);

  /**
   * Handle bubble swipe dismissal
   */
  const onDismissBubble = useCallback((bubbleId) => {
    const bubble = activeBubbles.find(b => b.id === bubbleId);
    if (bubble && triggerVisualTap) {
      triggerVisualTap(bubble.position.x, bubble.position.y, 'CLEAR');
    }

    dismissBubble(bubbleId);
    setScore(prev => prev + 5);
  }, [dismissBubble, activeBubbles, triggerVisualTap]);

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
      className={`relative w-full h-screen overflow-hidden flex flex-col font-mono transition-all duration-300 border-[10px] ${getContainerStyle()}`}
      onClick={(e) => {
        // If there are blocking bubbles and click wasn't on a bubble, count as miss
        if (hasBlockingBubbles && !e.target.closest('[data-bubble]')) {
          handleMiss();
        }
      }}
    >
      {/* 0. BACKGROUND BODY (The Cells) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {cells.map((cell, idx) => {
          const isAwake = (idx % 100) < coherence;

          return (
            <div
              key={cell.id}
              className={`absolute rounded-full transition-colors duration-1000 ease-in-out opacity-60
                ${isAwake ? 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)]' : 'bg-red-900/60'}
              `}
              style={{
                left: `${cell.left}%`,
                top: `${cell.top}%`,
                width: `${cell.size}px`,
                height: `${cell.size}px`,
                animation: `pulse ${2 + cell.delay}s infinite`
              }}
            />
          );
        })}
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/90"></div>
      </div>

      {/* Connection Status - Above HUD (Multiplayer only) */}
      {gameMode === 'multi' && connectionStatus !== 'connected' && (
        <div className="w-full py-2 bg-red-900/50 text-red-200 text-center text-sm animate-pulse z-40">
          Reconnecting...
        </div>
      )}

      {/* 1. TOP HUD (Global Metrics) */}
      <div className="w-full p-4 z-30 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[2px]">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-end mb-2 text-xs uppercase tracking-widest">
            <span className="text-cyan-500 flex items-center gap-2">
              <ActivityIcon size={14} /> Global Body Status
            </span>
            <span className={`font-bold transition-colors duration-500 ${coherence > 80 ? 'text-amber-400' : 'text-cyan-400'}`}>
              {coherence.toFixed(1)}% COHERENT
            </span>
          </div>

          <div className="w-full h-4 bg-gray-900 rounded-full overflow-hidden border border-gray-800 shadow-[0_0_15px_rgba(0,255,255,0.1)]">
            <div
              className={`h-full transition-all duration-300 ease-out relative overflow-hidden ${
                coherence > 90
                  ? 'bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.8)]'
                  : 'bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
              }`}
              style={{ width: `${coherence}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>

          <div className="flex justify-between mt-2 text-xs text-gray-400 font-bold">
            <span className="flex items-center gap-1">
              <UsersIcon size={12} /> {activePlayers.toLocaleString()} CELLS CONNECTED
            </span>
            <span className={hasBlockingBubbles ? "text-red-500 animate-pulse" : "text-amber-500"}>
              YOU ARE: {hasBlockingBubbles ? "INFECTED (CLEAR IT!)" : "COHERENT"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. CENTER STAGE (Pulse Visualizer) */}
      <div className="flex-1 relative flex flex-col items-center justify-center">
        {/* Instructions */}
        <div className="w-full text-center mb-8 z-20 px-4">
          {hasBlockingBubbles ? (
            <div className="text-red-400/70 text-sm animate-pulse">
              Tap the thought bubble to dismiss it
            </div>
          ) : (
            <div className="text-cyan-400/50 text-sm">
              Tap the glowing side in rhythm
            </div>
          )}
        </div>

        {/* Pulse Orb */}
        <div className="relative w-full max-w-md h-24 z-10 flex items-center">
          {/* Oscillation Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-cyan-900/50 -translate-y-1/2"></div>

          {/* Center Line */}
          <div className="absolute top-1/2 left-1/2 h-16 w-1 bg-cyan-500/60 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(34,211,238,0.4)]"></div>

          {/* Moving Orb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full blur-sm transition-none bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.8)]"
            style={{
              left: `calc(50% + ${position * 50}% - 1.5rem)`, // -50% to +50% from center
            }}
          >
            <div className="absolute inset-0 bg-white rounded-full opacity-50 animate-ping"></div>
          </div>
          {feedback && (
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold animate-bounce z-50
              ${feedback === 'HIT'
                ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                : 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]'
              }
            `}>
              {feedback === 'HIT' ? 'SYNC' : feedback === 'MISS' ? 'MISS' : 'STATIC'}
            </div>
          )}
        </div>

        {/* Infections/Thought Bubbles */}
        {activeBubbles.map(bubble => (
          <div
            key={bubble.id}
            data-bubble="true"
            className="absolute z-50 px-6 py-8 bg-red-950/90 border-2 border-red-500 text-red-100 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.6)] animate-bounce backdrop-blur-sm cursor-pointer max-w-xs"
            style={{ left: `${bubble.position.x}%`, top: `${bubble.position.y}%` }}
            onClick={(e) => {
              e.stopPropagation();
              onDismissBubble(bubble.id);
            }}
          >
            <div className="flex flex-col items-center">
              <ShieldAlertIcon size={24} className="mb-2 text-red-400" />
              <span className="font-bold text-sm uppercase tracking-wider text-center">{bubble.word}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. VISUAL TAPS */}
      {visualTaps && visualTaps.length > 0 && (
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
          {visualTaps.map(tap => (
            <div
              key={tap.id}
              className="absolute w-12 h-12 rounded-full border-2 border-pink-500 bg-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.8),inset_0_0_10px_rgba(236,72,153,0.5)] animate-ping"
              style={{
                left: `${tap.x}%`,
                top: `${tap.y}%`,
                animationDuration: '0.6s'
              }}
            />
          ))}
        </div>
      )}

      {/* 4. CONTROLS */}
      <div className="h-1/3 w-full flex gap-2 p-4 pb-8 z-20">
        <div
          onClick={() => onTapButton('LEFT')}
          className={`flex-1 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-100 cursor-pointer active:scale-95
            ${activeSide === 'LEFT'
              ? 'border-cyan-400 bg-cyan-900/40 shadow-[0_0_20px_rgba(34,211,238,0.2)] text-cyan-400'
              : 'border-gray-800 bg-gray-900/50 text-gray-600'
            }
          `}
        >
          <span className="text-2xl font-bold tracking-widest mb-2">LEFT</span>
        </div>
        <div
          onClick={() => onTapButton('RIGHT')}
          className={`flex-1 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-100 cursor-pointer active:scale-95
            ${activeSide === 'RIGHT'
              ? 'border-cyan-400 bg-cyan-900/40 shadow-[0_0_20px_rgba(34,211,238,0.2)] text-cyan-400'
              : 'border-gray-800 bg-gray-900/50 text-gray-600'
            }
          `}
        >
          <span className="text-2xl font-bold tracking-widest mb-2">RIGHT</span>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
