/**
 * BreakthroughScreen Component
 *
 * Victory state: 100% Coherence achieved
 * Displays the moment of collective transformation
 */

import React, { useState } from 'react';
import StatsModal from './StatsModal';

const BreakthroughScreen = ({ onReset, sessionStats, visualTaps = [], triggerVisualTap, gameStats }) => {
  const [showStatsModal, setShowStatsModal] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-full h-full bg-amber-50 text-amber-900 font-serif p-3 md:p-6 text-center select-none animate-in fade-in duration-1000 relative overflow-y-auto overflow-x-hidden">
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

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-100 to-white opacity-50"></div>

      {/* Sacred Geometry - Toroid visualization */}
      <div className="mb-4 md:mb-8 relative w-48 h-48 md:w-64 md:h-64 z-20 flex-shrink-0">
        <div className="absolute inset-0 rounded-full border-4 border-amber-600 animate-pulse-glow opacity-70" />
        <div
          className="absolute inset-8 rounded-full border-4 border-amber-500 animate-pulse-glow opacity-50"
          style={{ animationDelay: '0.5s' }}
        />
        <div
          className="absolute inset-16 rounded-full border-4 border-amber-400 animate-pulse-glow opacity-30"
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-amber-600 mb-3 md:mb-4 tracking-tighter drop-shadow-lg">
          BREAKTHROUGH
        </h1>
        <p className="text-xl sm:text-2xl text-amber-800/80 font-semibold mb-3 md:mb-4">
          CRITICAL MASS ACHIEVED
        </p>
        <p className="text-lg md:text-xl text-gray-700 mb-4 md:mb-8 max-w-lg mx-auto text-center px-4">
          The Body is One.
        </p>

        {/* Session Stats */}
        {sessionStats && (
          <div className="mb-4 md:mb-8 text-center">
            <p className="text-sm md:text-base text-gray-600 mb-1 md:mb-2">
              {sessionStats.activePlayers} Cells synchronized
            </p>
            <p className="text-sm md:text-base text-gray-600">
              Duration: {Math.round(sessionStats.duration / 1000)}s
            </p>
          </div>
        )}

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="px-6 py-3 md:px-8 md:py-4 bg-amber-900/50 border-2 border-amber-900/30 text-amber-900 rounded-xl text-base md:text-lg font-semibold transition-all duration-300 hover:bg-amber-900/60 active:scale-95 mb-4 md:mb-8"
        >
          Begin Again
        </button>

        {/* View Stats Button */}
        {gameStats && (
          <button
            onClick={() => setShowStatsModal(true)}
            className="px-6 py-3 md:px-8 md:py-4 bg-cyan-900/50 border-2 border-cyan-600/50 text-cyan-900 rounded-xl text-base md:text-lg font-semibold transition-all duration-300 hover:bg-cyan-900/60 active:scale-95 mb-4 md:mb-8 flex items-center justify-center gap-2 mx-auto"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            View Stats
          </button>
        )}

        {/* Debrief Text */}
        <div className="mt-4 md:mt-8 max-w-2xl text-gray-600 text-xs md:text-sm text-center space-y-2 md:space-y-4 px-4">
          <p>
            For a few minutes, you weren't worrying about the past or future.
            You were fully present—performing your function as a Cell in the Body.
          </p>
          <p>
            That state of focused presence is always available.
            You just proved you can access it.
          </p>
          <p className="italic text-amber-700 font-medium">
            You are not separate. When we synchronize, we are One.
          </p>
        </div>
      </div>

      {/* Stats Modal */}
      {gameStats && (
        <StatsModal
          stats={gameStats.stats}
          isOpen={showStatsModal}
          onClose={() => setShowStatsModal(false)}
          getTapAccuracy={gameStats.getTapAccuracy}
          getThoughtBubbleSuccessRate={gameStats.getThoughtBubbleSuccessRate}
        />
      )}
    </div>
  );
};

export default BreakthroughScreen;
