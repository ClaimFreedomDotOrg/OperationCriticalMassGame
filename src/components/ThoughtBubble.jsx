/**
 * ThoughtBubble Component
 *
 * Represents intrusive thoughts (The Voice) that must be dismissed.
 * Implements swipe-to-dismiss gesture for dis-identification training.
 */

import React, { useState, useRef, useEffect } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';

const { MIN_SWIPE_DISTANCE, MAX_SWIPE_TIME } = GAME_CONFIG;

const ThoughtBubble = ({ bubble, onDismiss }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [adjustedPosition, setAdjustedPosition] = useState({ x: bubble.position.x, y: bubble.position.y });
  const startPos = useRef({ x: 0, y: 0, time: 0 });
  const bubbleRef = useRef(null);

  /**
   * Adjust position to keep bubble within viewport bounds
   */
  useEffect(() => {
    if (!bubbleRef.current) return;

    const rect = bubbleRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = bubble.position.x;
    let adjustedY = bubble.position.y;

    // Calculate actual pixel position
    const leftPixels = (bubble.position.x / 100) * viewportWidth;
    const topPixels = (bubble.position.y / 100) * viewportHeight;

    // Check right edge
    if (leftPixels + rect.width > viewportWidth) {
      adjustedX = ((viewportWidth - rect.width - 10) / viewportWidth) * 100;
    }

    // Check left edge
    if (leftPixels < 0) {
      adjustedX = 1; // 1% from left
    }

    // Check bottom edge
    if (topPixels + rect.height > viewportHeight) {
      adjustedY = ((viewportHeight - rect.height - 10) / viewportHeight) * 100;
    }

    // Check top edge
    if (topPixels < 0) {
      adjustedY = 1; // 1% from top
    }

    setAdjustedPosition({ x: adjustedX, y: adjustedY });
  }, [bubble.position.x, bubble.position.y]);

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

  return (
    <div
      ref={bubbleRef}
      className="absolute z-40 animate-thought-float cursor-grab active:cursor-grabbing"
      style={{
        left: `${adjustedPosition.x}%`,
        top: `${adjustedPosition.y}%`,
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
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
      <div
        className="bg-red-950/90 border-2 border-red-500 rounded-full px-3 py-2 md:px-6 md:py-3
                   shadow-[0_0_30px_rgba(220,38,38,0.6)] backdrop-blur-sm"
      >
        <p className="text-red-100 text-sm md:text-lg font-semibold whitespace-nowrap">
          {bubble.word}
        </p>
      </div>
    </div>
  );
};

export default ThoughtBubble;
