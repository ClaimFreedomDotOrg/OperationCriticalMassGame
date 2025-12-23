/**
 * TapButton Component
 *
 * Large, accessible tap targets for bilateral stimulation
 * Minimum 44x44px for accessibility (WCAG 2.1 AA)
 */

import React from 'react';

const TapButton = ({ side, isActive, onTap }) => {
  const baseClasses = "w-32 h-32 rounded-full text-2xl font-bold transition-all duration-100 no-select";

  const activeClasses = isActive
    ? "bg-cyan-900/40 border-4 border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] scale-110"
    : "bg-gray-900/50 border-2 border-gray-800 text-gray-600 scale-100";

  return (
    <button
      onClick={onTap}
      onTouchStart={(e) => {
        e.preventDefault();
        onTap();
      }}
      aria-label={`Tap ${side}`}
      className={`${baseClasses} ${activeClasses} active:scale-95`}
    >
      {side}
    </button>
  );
};

export default TapButton;
