/**
 * PlayerFeedback Component
 *
 * Visual feedback for tap accuracy (HIT/MISS)
 */

import React from 'react';

const PlayerFeedback = ({ feedback }) => {
  const isHit = feedback === 'HIT';

  return (
    <div
      className={`absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                  text-6xl font-bold animate-bounce pointer-events-none z-50 ${
        isHit
          ? 'text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]'
          : 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]'
      }`}
    >
      {feedback}
    </div>
  );
};

export default PlayerFeedback;
