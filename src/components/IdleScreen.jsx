/**
 * IdleScreen Component
 *
 * Initial state: Invitation to join the collective experience
 */

import React from 'react';
import COLORS from '../constants/colors';

const IdleScreen = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      {/* Title with gradient */}
      <h1
        className="text-4xl md:text-6xl font-bold text-center mb-8 animate-pulse-glow"
        style={{
          background: 'linear-gradient(135deg, #22d3ee 0%, #2563eb 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Operation: Critical Mass
      </h1>

      {/* Description */}
      <p className="text-cyan-100/80 text-center max-w-md mb-4 text-lg">
        Join thousands of players in a collective experience of synchronization and coherence.
      </p>

      <p className="text-cyan-100/80 text-center max-w-md mb-8">
        Tap in rhythm. Dismiss intrusive thoughts. Achieve collective breakthrough.
      </p>

      {/* Start Button */}
      <button
        onClick={onStart}
        className="px-8 py-4 bg-cyan-900/30 border-2 border-cyan-500 text-cyan-400 rounded-xl
                   text-xl font-semibold transition-all duration-300 hover:bg-cyan-900/40
                   hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] active:scale-95"
      >
        Become a Cell
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
