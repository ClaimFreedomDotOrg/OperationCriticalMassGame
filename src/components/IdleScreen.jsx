/**
 * IdleScreen Component
 *
 * Initial state: Invitation to join the collective experience
 */

import React, { useState } from 'react';
import COLORS from '../constants/colors';

// Play icon SVG
const PlayIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

// User icon SVG
const UserIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// Users icon SVG
const UsersIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const IdleScreen = ({ onStart, visualTaps = [], triggerVisualTap }) => {
  const [mode, setMode] = useState(null); // null, 'single', 'multi'
  const [gameId, setGameId] = useState('');

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
  };

  const handleStartGame = () => {
    if (mode === 'single') {
      onStart({ mode: 'single', gameId: null });
    } else if (mode === 'multi' && gameId.trim()) {
      onStart({ mode: 'multi', gameId: gameId.trim() });
    }
  };

  const handleBack = () => {
    setMode(null);
    setGameId('');
  };
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-black text-cyan-400 font-mono p-6 text-center select-none overflow-hidden relative">
      {/* Visual Taps Overlay */}
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

      {/* Title with gradient */}
      <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 relative z-10 animate-pulse-glow">
        OPERATION: CRITICAL MASS
      </h1>

      {/* Description */}
      <p className="text-lg md:text-xl mb-4 max-w-md text-cyan-100/80 relative z-10">
        Join other players in a collective experience of synchronization and coherence.
      </p>

      <p className="text-md mb-8 max-w-md text-cyan-200/70 relative z-10">
        Tap in rhythm. Dismiss intrusive thoughts. Achieve collective breakthrough.
      </p>

      {/* Mode Selection */}
      {!mode ? (
        <div className="flex flex-col gap-4 relative z-20">
          {/* Single Player Button */}
          <button
            onClick={() => handleModeSelect('single')}
            className="group relative px-8 py-4 bg-cyan-900/30 border-2 border-cyan-500 hover:bg-cyan-500/20 transition-all rounded-xl overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] active:scale-95 min-w-[280px]"
          >
            <div className="absolute inset-0 bg-cyan-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative flex items-center justify-center gap-3 text-xl font-bold tracking-widest text-cyan-400">
              <UserIcon size={24} /> SINGLE PLAYER
            </span>
            <span className="relative block text-xs text-cyan-300/60 mt-1">Play offline</span>
          </button>

          {/* Multiplayer Button */}
          <button
            onClick={() => handleModeSelect('multi')}
            className="group relative px-8 py-4 bg-amber-900/30 border-2 border-amber-500 hover:bg-amber-500/20 transition-all rounded-xl overflow-hidden shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] active:scale-95 min-w-[280px]"
          >
            <div className="absolute inset-0 bg-amber-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative flex items-center justify-center gap-3 text-xl font-bold tracking-widest text-amber-400">
              <UsersIcon size={24} /> MULTIPLAYER
            </span>
            <span className="relative block text-xs text-amber-300/60 mt-1">Join collective game</span>
          </button>
        </div>
      ) : mode === 'single' ? (
        <div className="flex flex-col gap-4 relative z-20">
          {/* Single Player Confirmation */}
          <button
            onClick={handleStartGame}
            className="group relative px-8 py-4 bg-cyan-900/30 border-2 border-cyan-500 hover:bg-cyan-500/20 transition-all rounded-xl overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] active:scale-95 min-w-[280px]"
          >
            <div className="absolute inset-0 bg-cyan-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative flex items-center justify-center gap-3 text-xl font-bold tracking-widest text-cyan-400">
              <PlayIcon size={24} /> START GAME
            </span>
          </button>
          <button
            onClick={handleBack}
            className="text-cyan-400/60 hover:text-cyan-400 transition-colors text-sm"
          >
            ← Back
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 relative z-20 w-full max-w-md">
          {/* Multiplayer Game ID Input */}
          <div className="flex flex-col gap-2">
            <label className="text-amber-400 text-sm font-bold tracking-wider">ENTER GAME ID</label>
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="e.g., CRITICAL-MASS-2024"
              className="px-4 py-3 bg-gray-900/50 border-2 border-amber-500/50 rounded-lg text-amber-100 placeholder-gray-600 focus:outline-none focus:border-amber-400 focus:shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all"
              onKeyPress={(e) => e.key === 'Enter' && gameId.trim() && handleStartGame()}
            />
          </div>
          <button
            onClick={handleStartGame}
            disabled={!gameId.trim()}
            className="group relative px-8 py-4 bg-amber-900/30 border-2 border-amber-500 hover:bg-amber-500/20 transition-all rounded-xl overflow-hidden shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-900/30"
          >
            <div className="absolute inset-0 bg-amber-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative flex items-center justify-center gap-3 text-xl font-bold tracking-widest text-amber-400">
              <PlayIcon size={24} /> JOIN GAME
            </span>
          </button>
          <button
            onClick={handleBack}
            className="text-amber-400/60 hover:text-amber-400 transition-colors text-sm"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Scientific Note */}
      <div className="mt-12 text-cyan-200/50 text-xs text-center max-w-lg">
        <p className="mb-2">
          This game uses bilateral stimulation based on EMDR research to promote
          hemispheric integration and present-moment awareness.
        </p>
        <p>
          Play with headphones for optimal experience.
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-gray-600 text-xs">
        The Body is One
      </div>
    </div>
  );
};

export default IdleScreen;
