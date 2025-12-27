/**
 * ThoughtBubble Component
 *
 * Represents intrusive thoughts (The Voice) that must be dismissed.
 * Implements tap-to-dismiss or swipe-to-dismiss gestures for dis-identification training.
 * 
 * Design: Clean, minimal thought bubble with subtle indicator dots,
 * matching the bio-luminescent neuroscience aesthetic.
 * 
 * Positioning: Bubbles use responsive max-width constraints to prevent overflow.
 * The combination of percentage-based positioning and max-width ensures bubbles
 * remain fully visible across all viewport sizes without transform-based centering.
 */

import React, { useState, useRef } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';
import COLORS from '../constants/colors';

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

    // Valid tap: minimal movement (< 10px) OR valid swipe (sufficient distance and quick enough)
    const isTap = distance < 10;
    const isSwipe = distance >= MIN_SWIPE_DISTANCE && duration <= MAX_SWIPE_TIME;
    
    if (isTap || isSwipe) {
      onDismiss();
    } else {
      // Reset position if invalid gesture
      setPosition({ x: 0, y: 0 });
    }

    setIsDragging(false);
  };

  // Calculate total dismiss animation duration
  const dismissDuration = BUBBLE_DISMISS_DELAY + BUBBLE_FADE_DURATION;

  return (
    <div
      data-bubble="true"
      className={`absolute z-40 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${
        bubble.isDismissing ? 'animate-bubble-dismiss' : ''
      }`}
      style={{
        left: `clamp(0.75rem, ${bubble.position.x}%, calc(100vw - 12rem))`, // Clamp between min margin and max position
        top: `${bubble.position.y}%`,
        transform: bubble.isDismissing ? undefined : `translate(${position.x}px, ${position.y}px)`,
        animationDuration: bubble.isDismissing ? `${dismissDuration}ms` : undefined,
        // Constrain width to never exceed viewport with margins
        // This overrides the max-w-xs (20rem) Tailwind class when needed, while min-w-[11rem] ensures readability
        maxWidth: `min(20rem, calc(100vw - ${bubble.position.x}% - 1.5rem))`,
      }}
      onClick={(e) => e.stopPropagation()}
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
      <div className="relative inline-block max-w-xs min-w-[11rem]">
        {/* Main bubble - clean rounded rectangle with min 44x44px for accessibility */}
        <div 
          className="relative bg-red-950/90 border-2 border-red-500 rounded-2xl px-5 py-3 backdrop-blur-sm min-h-[2.75rem]"
          style={{
            boxShadow: `0 0 20px ${COLORS.RED_GLOW_INFECTION}`
          }}
        >
          {/* Thought bubble content */}
          <p className="text-red-100 text-sm md:text-base font-medium text-center leading-snug select-none">
            {bubble.word}
          </p>
        </div>
        
        {/* Minimal thought bubble indicator (two small dots) */}
        <div className="absolute -bottom-4 left-8">
          <div 
            className="absolute bottom-0 left-0 w-3 h-3 bg-red-950/90 border border-red-500 rounded-full"
            style={{
              boxShadow: `0 0 8px ${COLORS.RED_GLOW_SUBTLE}`
            }}
          ></div>
          <div 
            className="absolute -bottom-2 -left-1 w-1.5 h-1.5 bg-red-950/90 border border-red-500 rounded-full"
            style={{
              boxShadow: `0 0 5px ${COLORS.RED_GLOW_FAINT}`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ThoughtBubble;
