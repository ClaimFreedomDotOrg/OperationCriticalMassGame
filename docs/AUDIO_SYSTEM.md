# Audio System Documentation

## Overview

The game features a scientifically-grounded audio system that combines:

1. **Bilateral Stimulation** (EMDR-based left-right audio panning)
2. **Dynamic Music System** (Audio-based neurofeedback)
3. **Sound Effects** (Immediate behavioral feedback)

Together, these create an immersive neurophysiological training environment that guides players toward optimal brain states through real-time auditory feedback.

## Key Features

✅ **Bilateral Audio**: Continuous tone that pans left-right synchronized with the orb (EMDR-inspired)  
✅ **Dynamic Neurofeedback Music**: Music evolves from dissonant to consonant based on coherence (operant conditioning)  
✅ **Sound Effects**: Tap success, tap miss, thought dismissal, breakthrough (immediate feedback)  
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
- **Volume**: 0.2-0.25 (reduced to allow music prominence)

**Scientific Basis**: Based on EMDR research showing bilateral stimulation reduces emotional intensity and enhances interhemispheric communication.

### `useDynamicMusic` - Audio-Based Neurofeedback

**Location**: `src/hooks/useDynamicMusic.js`

**Technical Details**:

- **Bass Layer**: 110Hz (A2) - grounding frequency, always active
- **Pad Layer**: 220-330Hz chord tones - harmonic content (active 0%+)
- **Melody Layer**: 440-660Hz arpeggio - melodic progression (active 20%+)
- **Chaos Injection**: 155.6Hz tritone burst on miss events (300ms)

**Neurofeedback Mechanism**:

1. Coherence level = proxy for player's mental state (focused vs. distracted)
2. Music parameters dynamically adjust based on coherence
3. Low coherence → Dissonant intervals → Amygdala activation → Motivation to improve
4. High coherence → Consonant intervals → Reward circuits activation → Dopamine release
5. Brain learns association through operant conditioning

**Musical Scales by Coherence**:

- **0-29%**: Chaotic (minor 2nd, tritone) - Maximum tension
- **30-59%**: Transitional (minor pentatonic) - Building momentum  
- **60-89%**: Harmonious (major pentatonic) - Flow state
- **90-100%**: Perfect (major triad + overtones) - Breakthrough

See [DYNAMIC_MUSIC.md](./DYNAMIC_MUSIC.md) for complete documentation.

## Scientific Foundation

### EMDR and Bilateral Stimulation

Based on EMDR research showing bilateral stimulation:

- Reduces emotional intensity of distressing thoughts (van den Hout & Engelhard, 2012)
- Activates both brain hemispheres (Propper et al., 2007)
- Taxes working memory (prevents rumination)
- Enhances present-moment awareness

### Neurofeedback and Musical Conditioning

The dynamic music system implements **audio-based neurofeedback**:

**Neurofeedback Definition**: Using real-time displays of brain/behavioral activity to teach self-regulation through operant conditioning.

**Traditional Approach**: EEG sensors measure brainwaves → Visual/audio feedback → Patient learns to modulate brain state

**Our Innovation**: Coherence % measures behavioral state (proxy for brain state) → Musical feedback (consonance/dissonance) → Player learns to access flow state

**Scientific Support**:

- **Blood & Zatorre (2001)**: Consonant music activates reward circuits (nucleus accumbens, VTA)
- **Koelsch et al. (2006)**: Dissonant music activates threat detection (amygdala)
- **Egner & Gruzelier (2004)**: Neurofeedback creates lasting EEG changes after just 10 sessions
- **Zatorre et al. (2007)**: Rhythmic prediction activates dopamine release in motor circuits

**Key Advantage**: Audio feedback is faster than visual (8-10ms vs. 20-40ms to cortex), enabling more rapid learning.

**References**:

- van den Hout & Engelhard (2012). How does EMDR work?
- Propper et al. (2007). Interhemispheric communication
- Shapiro, F. (1989). Eye movement desensitization
- Blood, A. J., & Zatorre, R. J. (2001). Musical pleasure and reward circuits
- Koelsch, S. (2014). Brain correlates of music-evoked emotions
- Egner & Gruzelier (2004). EEG biofeedback and neural plasticity

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
