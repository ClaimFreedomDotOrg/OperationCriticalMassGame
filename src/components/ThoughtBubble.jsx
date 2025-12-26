/**
 * ThoughtBubble Component
 *
 * Represents intrusive thoughts (The Voice) that must be dismissed.
 * Implements swipe-to-dismiss gesture for dis-identification training.
 * 
 * Design: Clean, minimal thought bubble with subtle indicator dots,
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
      {/* Clean, minimal thought bubble design */}
      <div className="relative inline-block max-w-xs">
        {/* Main bubble - clean rounded rectangle */}
        <div className="relative bg-red-950/90 border-2 border-red-500 rounded-2xl px-5 py-3
                        shadow-[0_0_20px_rgba(220,38,38,0.5)] backdrop-blur-sm">
          {/* Thought bubble content */}
          <p className="text-red-100 text-sm md:text-base font-medium text-center leading-snug">
            {bubble.word}
          </p>
        </div>
        
        {/* Minimal thought bubble indicator (two small dots) */}
        <div className="absolute -bottom-4 left-8">
          <div className="absolute bottom-0 left-0 w-3 h-3 bg-red-950/90 border border-red-500 rounded-full
                          shadow-[0_0_8px_rgba(220,38,38,0.4)]"></div>
          <div className="absolute -bottom-2 -left-1 w-1.5 h-1.5 bg-red-950/90 border border-red-500 rounded-full
                          shadow-[0_0_5px_rgba(220,38,38,0.3)]"></div>
        </div>
      </div>
    </div>
  );
};

export default ThoughtBubble;
