/**
 * BreakthroughScreen Component
 *
 * Victory state: 100% Coherence achieved
 * Displays the moment of collective transformation
 */

import React from 'react';

const BreakthroughScreen = ({ onReset, sessionStats }) => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 animate-pulse-glow"
      style={{
        background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)',
      }}
    >
      {/* Sacred Geometry - Toroid visualization placeholder */}
      <div className="mb-8 relative w-64 h-64">
        <div
          className="absolute inset-0 rounded-full border-4 border-amber-600
                     animate-pulse-glow opacity-70"
        />
        <div
          className="absolute inset-8 rounded-full border-4 border-amber-500
                     animate-pulse-glow opacity-50"
          style={{ animationDelay: '0.5s' }}
        />
        <div
          className="absolute inset-16 rounded-full border-4 border-amber-400
                     animate-pulse-glow opacity-30"
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Victory Message */}
      <h1
        className="text-5xl md:text-7xl font-bold text-amber-600 text-center mb-4"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        BREAKTHROUGH
      </h1>

      <p className="text-2xl text-amber-800/80 text-center mb-8 max-w-md font-semibold">
        CRITICAL MASS ACHIEVED
      </p>

      <p className="text-xl text-gray-700 text-center mb-12 max-w-lg">
        The Body is One.
      </p>

      {/* Session Stats */}
      {sessionStats && (
        <div className="mb-8 text-center">
          <p className="text-gray-600 mb-2">
            {sessionStats.activePlayers} Cells synchronized
          </p>
          <p className="text-gray-600">
            Duration: {Math.round(sessionStats.duration / 1000)}s
          </p>
        </div>
      )}

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="px-8 py-4 bg-amber-900/50 border-2 border-amber-900/30 text-amber-900
                   rounded-xl text-lg font-semibold transition-all duration-300
                   hover:bg-amber-900/60 active:scale-95"
      >
        Begin Again
      </button>

      {/* Debrief Text */}
      <div className="mt-12 max-w-2xl text-gray-600 text-sm text-center space-y-4">
        <p>
          For a few minutes, you weren't worrying about the past or future.
          You were fully present—performing your function as a Cell in the Body.
        </p>
        <p>
          That state of focused presence is always available.
          You just proved you can access it.
        </p>
        <p className="italic text-amber-700">
          You are not separate. When we synchronize, we are One.
        </p>
      </div>
    </div>
  );
};

export default BreakthroughScreen;
