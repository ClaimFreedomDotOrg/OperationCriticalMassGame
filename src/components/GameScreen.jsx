/**
 * GameScreen Component
 *
 * Main gameplay interface for mobile players (Cells)
 * Implements bilateral tapping, thought bubble dismissal, and visual feedback
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import useBilateralStimulation from '../hooks/useBilateralStimulation';
import useThoughtBubbles from '../hooks/useThoughtBubbles';
import useFirebaseSync from '../hooks/useFirebaseSync';
import useAudio from '../hooks/useAudio';
import useBilateralAudio from '../hooks/useBilateralAudio';
import useDynamicMusic from '../hooks/useDynamicMusic';
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

const VolumeIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
  </svg>
);

const VolumeOffIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <line x1="23" y1="9" x2="17" y2="15"></line>
    <line x1="17" y1="9" x2="23" y2="15"></line>
  </svg>
);

const GameScreen = ({ sessionId, playerId, gameMode = 'single', cells = [], visualTaps = [], triggerVisualTap, onBreakthrough, onBack, gameStats }) => {
  const [feedback, setFeedback] = useState(null); // 'HIT', 'MISS', or null
  const [score, setScore] = useState(0);
  const [isInSync, setIsInSync] = useState(false);
  const [localCoherence, setLocalCoherence] = useState(0);
  const [playerCoherence, setPlayerCoherence] = useState(0); // Individual player's coherence in multiplayer
  const [localActivePlayers] = useState(1);
  const [syncedButton, setSyncedButton] = useState(null); // Track which button was just synced ('LEFT', 'RIGHT', or null)
  const touchInProgressRef = useRef(false);
  const scoreRef = useRef(0); // Track current score for accurate Firebase updates
  const playerCoherenceRef = useRef(0); // Track player coherence for accurate Firebase updates
  const injectChaosRef = useRef(null); // Ref to chaos injection function for miss handling

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
   * Keep scoreRef in sync with score state
   */
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // NOTE: We do NOT sync playerCoherenceRef from state via useEffect anymore
  // because we update the ref manually in handleMiss/handleSync to avoid race conditions
  // The old useEffect was overwriting our immediate ref updates with stale state values

  // Audio hooks
  const {
    isEnabled: isAudioEnabled,
    isInitialized: isAudioInitialized,
    initAudioContext,
    resumeAudioContext,
    playTapSuccess,
    playTapMiss,
    playThoughtDismiss,
    toggleAudio,
    audioContext,
    masterGain,
  } = useAudio();

  // Auto-initialize audio when game starts (prepare context)
  useEffect(() => {
    // Initialize audio context immediately when game screen mounts
    // This prepares the audio system but browsers may suspend it until user interaction
    if (!isAudioInitialized) {
      initAudioContext();
    }

    // Try to resume immediately in case browser allows it
    resumeAudioContext();

    // Also add a click/touch listener to resume audio on any interaction
    const handleUserInteraction = () => {
      resumeAudioContext();
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [isAudioInitialized, initAudioContext, resumeAudioContext]);

  // Bilateral audio - synchronized with orb position
  // Note: position comes from useBilateralStimulation hook below

  /**
   * Update score in stats whenever it changes
   *
   * Note: Using useEffect to store the function reference prevents React warnings
   * about updating parent component (App) during GameScreen render.
   */
  const updateScoreRef = useRef(null);

  useEffect(() => {
    if (gameStats) {
      updateScoreRef.current = gameStats.updateScore;
    }
  }, [gameStats]);

  useEffect(() => {
    if (updateScoreRef.current) {
      updateScoreRef.current(score);
    }
  }, [score]);

  /**
   * Monitor for breakthrough condition (100% coherence)
   * Update coherence tracking on every change for accurate statistics
   *
   * Note: Using useEffect to store the function reference prevents React warnings
   * about updating parent component (App) during GameScreen render.
   */
  const updateCoherenceRef = useRef(null);

  useEffect(() => {
    if (gameStats) {
      updateCoherenceRef.current = gameStats.updateCoherence;
    }
  }, [gameStats]);

  useEffect(() => {
    if (coherence >= 100 && onBreakthrough) {
      onBreakthrough();
    }
    // Update coherence tracking in stats on every change
    if (updateCoherenceRef.current) {
      updateCoherenceRef.current(coherence);
    }
  }, [coherence, onBreakthrough]);

  /**
   * Handle missed tap
   */
  const handleMiss = useCallback(() => {
    console.log('🔴 handleMiss called - gameMode:', gameMode, 'playerCoherenceRef:', playerCoherenceRef.current);

    setIsInSync(false);
    setFeedback('MISS');

    // Play miss sound
    playTapMiss();

    // Inject chaos into music (temporary dissonance)
    if (injectChaosRef.current) {
      injectChaosRef.current();
    }

    // Update coherence based on game mode
    if (gameMode === 'single') {
      setLocalCoherence(prev => Math.max(0, prev - 1)); // Decrease by 1% per miss
      updatePlayerState({
        isInSync: false,
        score: scoreRef.current,
        lastTap: Date.now(),
      });
    } else if (gameMode === 'multi') {
      // In multiplayer, decrease individual player's coherence
      const oldCoherence = playerCoherenceRef.current;
      const newCoherence = Math.max(0, playerCoherenceRef.current - 1); // Decrease by 1% per miss
      playerCoherenceRef.current = newCoherence; // Update ref immediately
      setPlayerCoherence(newCoherence);

      console.log('🔴 MISS - Coherence:', oldCoherence, '→', newCoherence);

      // Update Firebase with new coherence
      updatePlayerState({
        isInSync: false,
        playerCoherence: newCoherence,
        score: scoreRef.current,
        lastTap: Date.now(),
      });
    }

    setTimeout(() => setFeedback(null), GAME_CONFIG.FEEDBACK_DURATION);
  }, [updatePlayerState, gameMode, playTapMiss]);

  // Bilateral stimulation (pause when connecting in multiplayer)
  const isPaused = gameMode === 'multi' && connectionStatus === 'connecting';

  // Thought bubbles (The Voice) - pause when game is paused
  // In multiplayer, spawn bubbles less frequently (10s vs 5s) since difficulty compounds
  const { activeBubbles, dismissBubble, hasBlockingBubbles } = useThoughtBubbles({
    isActive: true,
    isPaused,
    spawnInterval: gameMode === 'multi' ? 10000 : 5000, // 10s for multiplayer, 5s for single player
    onBubbleExpired: (bubbleId) => {
      handleMiss();
      // Track expired thought bubble
      if (gameStats) {
        gameStats.recordThoughtExpired();
      }
    },
  });

  /**
   * Handle successful sync
   */
  const handleSync = useCallback(() => {
    console.log('🟢 handleSync called - gameMode:', gameMode, 'playerCoherenceRef:', playerCoherenceRef.current);

    setIsInSync(true);
    setFeedback('HIT');

    // Calculate new score
    const newScore = scoreRef.current + 10;
    setScore(newScore);

    // Play success sound
    playTapSuccess();

    // Update coherence based on game mode
    if (gameMode === 'single') {
      setLocalCoherence(prev => Math.min(100, prev + 2)); // Increase by 2% per hit
      updatePlayerState({
        isInSync: true,
        score: newScore,
        lastTap: Date.now(),
      });
    } else if (gameMode === 'multi') {
      // In multiplayer, increase individual player's coherence
      const oldCoherence = playerCoherenceRef.current;
      const newCoherence = Math.min(100, playerCoherenceRef.current + 2); // Increase by 2% per hit
      playerCoherenceRef.current = newCoherence; // Update ref immediately
      setPlayerCoherence(newCoherence);

      console.log('🟢 HIT - Coherence:', oldCoherence, '→', newCoherence);

      // Update Firebase with new coherence
      updatePlayerState({
        isInSync: true,
        playerCoherence: newCoherence,
        score: newScore,
        lastTap: Date.now(),
      });
    }

    // Clear feedback after duration
    setTimeout(() => setFeedback(null), GAME_CONFIG.FEEDBACK_DURATION);
  }, [updatePlayerState, gameMode, playTapSuccess]);

  const { activeSide, handleTap, position } = useBilateralStimulation({
    isActive: true,
    isPaused,
    onSync: handleSync,
    onMiss: handleMiss,
  });

  // Bilateral audio - synchronized with orb position (uses shared audio context)
  useBilateralAudio({
    isActive: !isPaused,
    position,
    audioContext,
    masterGain,
    isEnabled: isAudioEnabled,
  });

  // Dynamic music - correlates with coherence level (uses shared audio context)
  const { injectChaos } = useDynamicMusic({
    isActive: !isPaused,
    coherence,
    audioContext,
    masterGain,
    isEnabled: isAudioEnabled,
  });

  // Keep injectChaos ref updated for use in handleMiss callback
  useEffect(() => {
    injectChaosRef.current = injectChaos;
  }, [injectChaos]);

  /**
   * Initialize audio on user interaction (once)
   */
  const ensureAudioReady = useCallback(() => {
    if (!isAudioInitialized) {
      initAudioContext();
    } else {
      // Only resume if context is suspended
      resumeAudioContext();
    }
  }, [isAudioInitialized, initAudioContext, resumeAudioContext]);

  /**
   * Handle tap button press
   */
  const onTapButton = useCallback((side, event) => {
    // Ensure audio is ready on user interaction
    ensureAudioReady();

    // Cannot tap while game is paused (connecting/reconnecting)
    if (isPaused) {
      return;
    }

    // Cannot tap while bubbles are blocking
    if (hasBlockingBubbles) {
      handleMiss();
      return;
    }

    // Get click/touch position relative to viewport
    if (event && triggerVisualTap) {
      const isTouchEvent = event.type === 'touchstart' || event.type === 'touchend';

      // If this is a click event but a touch just happened, skip it (it's a duplicate)
      if (event.type === 'click' && touchInProgressRef.current) {
        touchInProgressRef.current = false;
        return;
      }

      // If it's a touch event, mark it and prevent the click
      if (isTouchEvent) {
        event.preventDefault();
        touchInProgressRef.current = true;
        // Clear the flag after a short delay
        setTimeout(() => {
          touchInProgressRef.current = false;
        }, 300);
      }

      let clientX, clientY;

      if (isTouchEvent) {
        const touch = event.changedTouches?.[0] || event.touches?.[0];
        if (touch) {
          clientX = touch.clientX;
          clientY = touch.clientY;
        }
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      if (clientX !== undefined && clientY !== undefined) {
        // Convert to percentage of screen
        const tapX = (clientX / window.innerWidth) * 100;
        const tapY = (clientY / window.innerHeight) * 100;

        triggerVisualTap(tapX, tapY, 'TAP');
      }
    }

    // Handle the tap and check if it was successful
    const result = handleTap(side);

    // Track tap in stats
    if (gameStats) {
      gameStats.recordTap({ side, isSync: result?.success || false });
    }

    // If tap was successful (in sync), show green feedback on the button
    if (result?.success) {
      setSyncedButton(side);
      setTimeout(() => {
        setSyncedButton(null);
      }, 300); // Show green for 300ms
    }
  }, [hasBlockingBubbles, handleTap, handleMiss, triggerVisualTap, gameStats, ensureAudioReady, isPaused]);

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
      className={`relative w-full max-w-full h-full overflow-hidden flex flex-col font-mono transition-all duration-300 border-2 md:border-4 ${getContainerStyle()}`}
      onClick={(e) => {
        // If there are blocking bubbles and click wasn't on a bubble, count as miss
        if (hasBlockingBubbles && !e.target.closest('[data-bubble]')) {
          handleMiss();
        }
      }}
    >
      {/* 0. BACKGROUND BODY (The Cells) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        {/* Body Container - Maintains aspect ratio */}
        <div className="relative w-full max-w-md h-full">
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
        </div>
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
      <div className="w-full p-2 md:p-4 z-30 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[2px] flex-shrink-0">
        <div className="max-w-2xl mx-auto relative">
          <div className="flex justify-between items-end mb-1 text-xs uppercase tracking-widest">
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

          <div className="flex justify-between items-center mt-1 text-[10px] md:text-xs text-gray-400 font-bold">
            <span className="flex items-center gap-1">
              <UsersIcon size={12} /> {activePlayers.toLocaleString()} CELLS
            </span>
            <span className={hasBlockingBubbles ? "text-red-500 animate-pulse" : "text-amber-500"}>
              YOU ARE: {hasBlockingBubbles ? "INFECTED (CLEAR IT!)" : "COHERENT"}
            </span>
          </div>

          {/* Audio Toggle Button - positioned below player status line */}
          <div className="flex justify-end mt-1">
            <button
              onClick={() => {
                ensureAudioReady();
                toggleAudio();
              }}
              className="p-1.5 rounded-lg bg-gray-900/80 border border-gray-700 hover:border-cyan-500 transition-colors duration-200 select-none"
              aria-label={isAudioEnabled ? 'Mute audio' : 'Unmute audio'}
            >
              {isAudioEnabled ? <VolumeIcon size={16} /> : <VolumeOffIcon size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. CENTER STAGE (Pulse Visualizer) */}
      <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center overflow-hidden">
        {/* Pause/Connecting Overlay */}
        {isPaused && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-cyan-400 text-2xl md:text-4xl font-bold mb-2 animate-pulse">
                CONNECTING
              </div>
              <div className="text-cyan-100/80 text-sm md:text-base">
                Establishing connection...
              </div>
              <div className="flex gap-2 justify-center mt-4">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '200ms' }}></div>
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '400ms' }}></div>
              </div>
              {onBack && (
                <button
                  onClick={onBack}
                  className="mt-6 px-6 py-2 text-sm md:text-base font-bold text-cyan-400 hover:text-cyan-300 border border-cyan-400/50 hover:border-cyan-300 rounded-lg transition-colors duration-200"
                  aria-label="Go back to start screen"
                >
                  ← BACK
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pulse Orb */}
        <div className="relative w-full max-w-md h-24 z-10 flex items-center px-8">
          {/* Oscillation Line */}
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-cyan-900/50 -translate-y-1/2"></div>

          {/* Center Line */}
          <div className="absolute top-1/2 left-1/2 h-16 w-1 bg-cyan-500/60 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(34,211,238,0.4)]"></div>

          {/* Moving Orb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full blur-sm transition-none bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.8)]"
            style={{
              left: `calc(50% + ${position * 40}% - 1.5rem)`, // -40% to +40% from center (reduced range)
            }}
          >
            <div className="absolute inset-0 bg-white rounded-full opacity-50 animate-ping"></div>
          </div>
        </div>

        {/* Infections/Thought Bubbles */}
        {activeBubbles.map(bubble => (
          <ThoughtBubble
            key={bubble.id}
            bubble={bubble}
            onDismiss={() => {
              dismissBubble(bubble.id);

              // Calculate new score
              const newScore = scoreRef.current + 5;
              setScore(newScore);

              // Play thought dismissal sound
              playThoughtDismiss();

              // Track dismissed thought bubble
              if (gameStats) {
                gameStats.recordThoughtDismissed();
              }
            }}
          />
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

      {/* Feedback - Positioned above instructions without affecting layout */}
      {feedback && (
        <div className="absolute left-0 right-0 z-50 pointer-events-none" style={{ bottom: 'calc(240px + 3.5rem)' }}>
          <div className={`text-4xl font-bold animate-bounce text-center
            ${feedback === 'HIT'
              ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]'
              : 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]'
            }
          `}>
            {feedback === 'HIT' ? 'SYNC' : feedback === 'MISS' ? 'MISS' : 'STATIC'}
          </div>
        </div>
      )}

      {/* Instructions - Above Controls (Hidden at 10% coherence or higher) */}
      {coherence < 10 && (
        <div className="absolute left-0 right-0 z-20 w-full text-center py-3 px-4 bg-black/80 backdrop-blur-sm border-t-2 border-cyan-900/50 pointer-events-none" style={{ bottom: '240px' }}>
          {hasBlockingBubbles ? (
            <div className="flex flex-col items-center gap-2">
              <div className="text-red-400 text-lg md:text-xl font-bold animate-pulse tracking-wide">
                ⚠️ TAP THE THOUGHT BUBBLE TO CLEAR IT
              </div>
              <div className="text-red-300/70 text-xs md:text-sm">
                Click or tap the red bubble above to dismiss the intrusive thought
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="text-cyan-300 text-base md:text-lg font-bold tracking-wide">
                👆 TAP THE <span className="text-cyan-400 animate-pulse">GLOWING</span> SIDE IN RHYTHM
              </div>
              <div className="text-cyan-400/60 text-xs md:text-sm">
                Match the beat timing for better coherence
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. CONTROLS */}
      <div className="w-full min-h-[240px] max-h-[360px] flex gap-2 p-2 md:p-4 pb-3 md:pb-8 z-20 flex-shrink-0">
        <div
          onTouchStart={(e) => onTapButton('LEFT', e)}
          onClick={(e) => onTapButton('LEFT', e)}
          className={`flex-1 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-100 cursor-pointer active:scale-95 select-none
            ${syncedButton === 'LEFT'
              ? 'border-green-400 bg-green-900/40 shadow-[0_0_20px_rgba(34,197,94,0.5)] text-green-400'
              : activeSide === 'LEFT'
              ? 'border-cyan-400 bg-cyan-900/40 shadow-[0_0_20px_rgba(34,211,238,0.2)] text-cyan-400'
              : 'border-gray-800 bg-gray-900/50 text-gray-600'
            }
          `}
        >
          <span className="text-xl md:text-2xl font-bold tracking-widest">LEFT</span>
        </div>
        <div
          onTouchStart={(e) => onTapButton('RIGHT', e)}
          onClick={(e) => onTapButton('RIGHT', e)}
          className={`flex-1 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-100 cursor-pointer active:scale-95 select-none
            ${syncedButton === 'RIGHT'
              ? 'border-green-400 bg-green-900/40 shadow-[0_0_20px_rgba(34,197,94,0.5)] text-green-400'
              : activeSide === 'RIGHT'
              ? 'border-cyan-400 bg-cyan-900/40 shadow-[0_0_20px_rgba(34,211,238,0.2)] text-cyan-400'
              : 'border-gray-800 bg-gray-900/50 text-gray-600'
            }
          `}
        >
          <span className="text-xl md:text-2xl font-bold tracking-widest">RIGHT</span>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
