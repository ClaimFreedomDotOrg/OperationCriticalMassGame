/**
 * IdleScreen Component
 *
 * Initial state: Invitation to join the collective experience
 */

import React from 'react';
import COLORS from '../constants/colors';

// Play icon SVG
const PlayIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const IdleScreen = ({ onStart, visualTaps = [], triggerVisualTap }) => {
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
        Join thousands of players in a collective experience of synchronization and coherence.
      </p>

      <p className="text-md mb-8 max-w-md text-cyan-200/70 relative z-10">
        Tap in rhythm. Dismiss intrusive thoughts. Achieve collective breakthrough.
      </p>

      {/* Start Button */}
      <button
        onClick={onStart}
        className="group relative z-20 px-8 py-4 bg-cyan-900/30 border-2 border-cyan-500 hover:bg-cyan-500/20 transition-all rounded-xl overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] active:scale-95"
      >
        <div className="absolute inset-0 bg-cyan-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        <span className="relative flex items-center gap-3 text-xl font-bold tracking-widest text-cyan-400">
          <PlayIcon size={24} /> BECOME A CELL
        </span>
      </button>

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
