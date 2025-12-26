# Audio System Documentation

## Overview

The game features a scientifically-grounded audio system based on EMDR (Eye Movement Desensitization and Reprocessing) research. The audio provides real-time feedback and creates an immersive bilateral stimulation experience.

## Key Features

✅ **Bilateral Audio**: Continuous tone that pans left-right synchronized with the orb  
✅ **Sound Effects**: Tap success, tap miss, thought dismissal, breakthrough  
✅ **Zero Downloads**: All audio synthesized in real-time using Web Audio API  
✅ **Performance**: Single shared AudioContext, efficient oscillator management  
✅ **Browser Compatible**: Works on Chrome, Firefox, Safari with autoplay handling  

## Custom Hooks

### `useAudio` - Core Audio Management

**Location**: `src/hooks/useAudio.js`

**Sound Effects**:
- `playTapSuccess()` - C5 + E5 major third (positive reinforcement)
- `playTapMiss()` - 220Hz square wave (gentle correction)
- `playThoughtDismiss()` - 200Hz → 800Hz sweep (whoosh effect)
- `playBreakthrough()` - C major arpeggio (triumph)

### `useBilateralAudio` - EMDR-Inspired Bilateral Sound

**Location**: `src/hooks/useBilateralAudio.js`

**Technical Details**:
- **Frequency**: 220Hz (A3 note - calming, meditative)
- **Waveform**: Sine wave
- **Panning**: -1.0 (full left) to +1.0 (full right)
- **Volume**: 0.3 base, modulates ±0.1 based on orb position

## Scientific Foundation

Based on EMDR research showing bilateral stimulation:
- Reduces emotional intensity of distressing thoughts
- Activates both brain hemispheres
- Taxes working memory (prevents rumination)
- Enhances present-moment awareness

**References**:
- van den Hout & Engelhard (2012). How does EMDR work?
- Propper et al. (2007). Interhemispheric communication
- Shapiro, F. (1989). Eye movement desensitization

## Browser Compatibility

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (iOS/macOS) with webkit prefix
- ⚠️ Older browsers - graceful degradation (silent mode)

## Performance

**Optimizations**:
- Single shared AudioContext (not one per hook)
- Oscillators cleaned up after use
- No audio file downloads
- Works efficiently with thousands of simultaneous players
