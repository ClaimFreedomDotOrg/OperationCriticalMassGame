/**
 * StatsModal Component
 *
 * Displays comprehensive game statistics in a modal overlay
 * Shown on the breakthrough screen via a button
 */

import React from 'react';

const StatsModal = ({ stats, isOpen, onClose, getTapAccuracy, getThoughtBubbleSuccessRate }) => {
  if (!isOpen) return null;

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 
      ? `${minutes}m ${remainingSeconds}s`
      : `${seconds}s`;
  };

  const tapAccuracy = getTapAccuracy();
  const thoughtSuccessRate = getThoughtBubbleSuccessRate();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-amber-50 to-white rounded-2xl border-4 border-amber-600 shadow-[0_0_40px_rgba(217,119,6,0.6)] p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-amber-900/20 hover:bg-amber-900/30 text-amber-900 transition-all duration-200 active:scale-95"
          aria-label="Close stats"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-amber-600 mb-2 font-serif">
            Session Statistics
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Your journey to coherence
          </p>
        </div>

        {/* Stats Grid */}
        <div className="space-y-6">
          {/* Overall Performance */}
          <section className="bg-white/50 rounded-xl p-4 border-2 border-amber-200">
            <h3 className="text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              Overall Performance
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-100/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-amber-900">{stats.finalScore}</div>
                <div className="text-xs text-gray-600 uppercase">Final Score</div>
              </div>
              <div className="bg-amber-100/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-amber-900">{formatTime(stats.sessionDuration)}</div>
                <div className="text-xs text-gray-600 uppercase">Duration</div>
              </div>
            </div>
          </section>

          {/* Tap Statistics */}
          <section className="bg-white/50 rounded-xl p-4 border-2 border-cyan-200">
            <h3 className="text-xl font-bold text-cyan-800 mb-3 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              Bilateral Tapping
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Taps</span>
                <span className="font-bold text-gray-900">{stats.totalTaps}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Synced Taps</span>
                <span className="font-bold text-green-600">{stats.syncedTaps}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Missed Taps</span>
                <span className="font-bold text-red-600">{stats.missedTaps}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Tap Accuracy</span>
                <span className={`font-bold ${tapAccuracy >= 70 ? 'text-green-600' : tapAccuracy >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                  {tapAccuracy}%
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-700">Left Side</span>
                <span className="font-bold text-gray-900">{stats.leftTaps}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Right Side</span>
                <span className="font-bold text-gray-900">{stats.rightTaps}</span>
              </div>
            </div>
          </section>

          {/* Thought Bubble Statistics */}
          <section className="bg-white/50 rounded-xl p-4 border-2 border-red-200">
            <h3 className="text-xl font-bold text-red-800 mb-3 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Thought Management
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Thoughts</span>
                <span className="font-bold text-gray-900">{stats.totalThoughtBubbles}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Dismissed</span>
                <span className="font-bold text-green-600">{stats.thoughtBubblesDismissed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Expired (Missed)</span>
                <span className="font-bold text-red-600">{stats.thoughtBubblesExpired}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Success Rate</span>
                <span className={`font-bold ${thoughtSuccessRate >= 70 ? 'text-green-600' : thoughtSuccessRate >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                  {thoughtSuccessRate}%
                </span>
              </div>
            </div>
          </section>

          {/* Timing Statistics */}
          {stats.averageResponseTime > 0 && (
            <section className="bg-white/50 rounded-xl p-4 border-2 border-purple-200">
              <h3 className="text-xl font-bold text-purple-800 mb-3 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Response Timing
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Average</span>
                  <span className="font-bold text-gray-900">{stats.averageResponseTime}ms</span>
                </div>
                {stats.fastestTap && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Fastest</span>
                    <span className="font-bold text-green-600">{stats.fastestTap}ms</span>
                  </div>
                )}
                {stats.slowestTap && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Slowest</span>
                    <span className="font-bold text-amber-600">{stats.slowestTap}ms</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Coherence Statistics */}
          <section className="bg-white/50 rounded-xl p-4 border-2 border-amber-200">
            <h3 className="text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 12h8"></path>
                <path d="M12 8v8"></path>
              </svg>
              Coherence Tracking
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Peak Coherence</span>
                <span className="font-bold text-amber-900">{stats.peakCoherence.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Average Coherence</span>
                <span className="font-bold text-gray-900">{stats.averageCoherence}%</span>
              </div>
              {stats.timeAtMaxCoherence > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Time at 100%</span>
                  <span className="font-bold text-green-600">{stats.timeAtMaxCoherence} intervals</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-gray-600 italic">
          Every tap, every dismissed thought, every moment of coherence—<br />
          you contributed to the Body.
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
