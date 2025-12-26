/**
 * ThoughtBubble Component
 *
 * Represents intrusive thoughts (The Voice) that must be dismissed.
 * Implements swipe-to-dismiss gesture for dis-identification training.
 * 
 * Design: Classic thought bubble with circular puffs and connection dots,
 * matching the bio-luminescent neuroscience aesthetic.
 */

import React, { useState, useRef } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';

const { MIN_SWIPE_DISTANCE, MAX_SWIPE_TIME, BUBBLE_DISMISS_DELAY, BUBBLE_FADE_DURATION } = GAME_CONFIG;

const ThoughtBubble = ({ bubble, onDismiss }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0, time: 0 });

  /**
   * Handle touch/mouse start
   */
  const handleStart = (clientX, clientY) => {
    setIsDragging(true);
    startPos.current = {
      x: clientX,
      y: clientY,
      time: Date.now(),
    };
  };

  /**
   * Handle touch/mouse move
   */
  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;

    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    setPosition({ x: deltaX, y: deltaY });
  };

  /**
   * Handle touch/mouse end
   */
  const handleEnd = () => {
    if (!isDragging) return;

    const distance = Math.sqrt(
      position.x ** 2 + position.y ** 2
    );
    const duration = Date.now() - startPos.current.time;

    // Valid swipe: sufficient distance and quick enough
    if (distance >= MIN_SWIPE_DISTANCE && duration <= MAX_SWIPE_TIME) {
      onDismiss();
    } else {
      // Reset position if invalid swipe
      setPosition({ x: 0, y: 0 });
    }

    setIsDragging(false);
  };

  // Calculate total dismiss animation duration
  const dismissDuration = BUBBLE_DISMISS_DELAY + BUBBLE_FADE_DURATION;

  return (
    <div
      className={`absolute z-40 cursor-grab active:cursor-grabbing ${
        bubble.isDismissing ? 'animate-bubble-dismiss' : ''
      }`}
      style={{
        left: `${bubble.position.x}%`,
        top: `${bubble.position.y}%`,
        transform: bubble.isDismissing ? undefined : `translate(${position.x}px, ${position.y}px)`,
        animationDuration: bubble.isDismissing ? `${dismissDuration}ms` : undefined,
      }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
      }}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }}
      onTouchEnd={handleEnd}
    >
      {/* Thought bubble with classic comic-style design */}
      <div className="relative inline-block max-w-xs">
        {/* Main bubble cloud */}
        <div className="relative bg-red-950/95 border-2 border-red-500 rounded-3xl px-6 py-4
                        shadow-[0_0_30px_rgba(220,38,38,0.7)] backdrop-blur-sm">
          {/* Top decorative puffs */}
          <div className="absolute -top-2 left-1/4 w-10 h-10 bg-red-950/95 border-2 border-red-500 rounded-full"></div>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-12 bg-red-950/95 border-2 border-red-500 rounded-full"></div>
          <div className="absolute -top-2 right-1/4 w-10 h-10 bg-red-950/95 border-2 border-red-500 rounded-full"></div>
          
          {/* Thought bubble content */}
          <div className="relative z-10">
            <p className="text-red-100 text-sm md:text-base font-semibold text-center leading-tight">
              {bubble.word}
            </p>
          </div>
        </div>
        
        {/* Thought bubble tail (small connecting circles) */}
        <div className="absolute -bottom-8 left-6">
          <div className="relative">
            <div className="absolute bottom-0 left-0 w-5 h-5 bg-red-950/95 border-2 border-red-500 rounded-full
                            shadow-[0_0_15px_rgba(220,38,38,0.7)]"></div>
            <div className="absolute -bottom-5 -left-2 w-3 h-3 bg-red-950/95 border-2 border-red-500 rounded-full
                            shadow-[0_0_10px_rgba(220,38,38,0.6)]"></div>
            <div className="absolute -bottom-8 -left-3 w-2 h-2 bg-red-950/95 border border-red-500 rounded-full
                            shadow-[0_0_8px_rgba(220,38,38,0.5)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThoughtBubble;
