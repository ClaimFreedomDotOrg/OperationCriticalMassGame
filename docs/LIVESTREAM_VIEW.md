# Livestream View Guide

## Overview

The **Livestream View** is a dedicated display designed for livestream hosts to show on their broadcasts. It provides a stunning, real-time visualization of all connected players and comprehensive statistics about the collective gameplay experience.

## Visual Features

### 🌟 Main Components

1. **Collective Coherence Meter**
   - Large, prominent percentage display (0-100%)
   - Real-time progress bar with glowing effects
   - Color-coded coherence levels:
     - **PERFECT** (90-100%): Gold/Amber
     - **HIGH** (70-89%): Gold/Amber
     - **MEDIUM** (40-69%): Cyan
     - **LOW** (20-39%): Red
     - **CHAOTIC** (0-19%): Red

2. **The Body Visualization**
   - Each connected player appears as a glowing dot/cell
   - **Gold cells**: Players in sync with the rhythm
   - **Red cells**: Players out of sync or infected
   - Cells arranged in an organic, living pattern
   - Sacred geometry overlays appear at 80%+ coherence
   - Stunning radial pulse effect at 95%+ coherence

3. **Real-Time Statistics**
   - **Active Players**: Total number of connected cells
   - **Total Taps**: Aggregate tap count across all players
   - **Accuracy**: Average tap accuracy percentage
   - **Infections Cleared**: Total thought bubbles dismissed
   - **Session Time**: Live timer showing session duration

### 🎨 Aesthetic

The view follows the game's **bio-digital bioluminescence** aesthetic:

- Deep black background with subtle animated grid
- Neon cyan, gold, and red color palette
- Dynamic lighting effects that respond to coherence level
- Sacred geometry that emerges at high coherence
- Smooth animations and transitions

## How to Access

### For Livestream Hosts

1. **Start a multiplayer game session** to get a session ID
2. **Open the livestream view** in a separate browser window/tab using this URL format:

```markdown
https://your-game-url.com/?view=livestream&session=YOUR_SESSION_ID
```

For local development:

```markdown
http://localhost:5173/?view=livestream&session=YOUR_SESSION_ID
```

### Example URLs

**Production (when deployed):**

```markdown
https://criticalmassgame.com/?view=livestream&session=game-2024-12-27-abc123
```

**Local Development:**

```markdown
http://localhost:5173/?view=livestream&session=game-2024-12-27-abc123
```

## Setup for Livestream

### Recommended Setup

1. **Create a multiplayer game session**
   - Either manually create a session ID or join an existing session
   - Note the session ID

2. **Open the livestream view**
   - Open your browser to the livestream view URL with the session ID
   - Full screen this window (F11 on most browsers)

3. **Screen capture setup**
   - Use OBS, Streamlabs, or your preferred streaming software
   - Add a "Browser Source" or "Window Capture"
   - Point it to the livestream view window
   - Set resolution to 1920x1080 (Full HD) or higher

4. **Start your broadcast**
   - Share the regular game URL with your audience
   - Players join using their phones/devices
   - The livestream view automatically updates as players connect

### OBS Studio Setup

1. Add a new **Browser Source**
2. Set the URL to your livestream view URL
3. Set dimensions:
   - Width: 1920
   - Height: 1080
4. Check "Shutdown source when not visible" for performance
5. Check "Refresh browser when scene becomes active"

### Stream Settings Recommendations

- **Resolution**: 1920x1080 (1080p)
- **Frame Rate**: 30 or 60 fps
- **Bitrate**: 4500-6000 kbps for smooth visuals
- **Encoder**: H.264 (hardware encoding recommended)

## Features Explained

### Dynamic Background Effects

The background subtly responds to the coherence level:

- Low coherence: Minimal glow, cooler tones
- Medium coherence: Soft cyan glow
- High coherence: Warm amber glow
- Perfect coherence: Intense golden radiance

### Cell Visualization Behavior

- **Organic Positioning**: Cells are distributed naturally across the screen with slight randomness
- **Real-Time Updates**: As players sync or desync, their cells change color instantly
- **Smooth Animations**: All transitions use smooth animations (300ms duration)
- **Pulsing Effect**: Synchronized cells pulse gently to indicate active participation

### Sacred Geometry

When coherence reaches 80%+, sacred geometry appears:

- Two concentric rotating circles (toroid representation)
- Gold and cyan colors representing the dual aspects of coherence
- Slow rotation speeds (20-30 seconds per rotation)
- Creates mesmerizing visual focus point

## Technical Details

### Performance

- **Optimized for real-time updates**: Uses Firebase real-time database listeners
- **Efficient rendering**: Only re-renders changed elements
- **Scales to thousands of players**: Cell visualization uses percentage-based positioning
- **Low latency**: Sub-second updates from Firebase

### Data Sources

The view pulls data from:

- `sessions/{sessionId}` - Session metadata and coherence
- `players/{sessionId}` - Individual player states
- Real-time listeners ensure instant updates

### Browser Compatibility

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Mobile browsers**: Works but not optimized (use desktop for livestreaming)

## Troubleshooting

### View shows "No active session"

- Check that the session ID in the URL is correct
- Ensure the session exists (someone must have started a game)
- Verify Firebase connection is active

### Players not appearing

- Confirm players are joining the correct session ID
- Check Firebase console for player data
- Ensure Firebase security rules allow read access

### Performance issues

- Close unnecessary browser tabs
- Use hardware acceleration in browser settings
- Reduce number of active effects in OBS
- Consider lowering stream resolution/frame rate

### Stats not updating

- Check browser console for Firebase connection errors
- Verify network connection is stable
- Refresh the browser window
- Check Firebase quota limits

## Customization Ideas

### For Advanced Users

The livestream view can be customized by modifying the component:

1. **Adjust cell size**: Change the `width` and `height` in the cell rendering
2. **Modify colors**: Edit the color scheme in the coherence level logic
3. **Add custom effects**: Add additional visual effects at milestone coherence levels
4. **Custom stats**: Add tracking for specific metrics relevant to your stream

### Future Enhancements

Potential additions (not yet implemented):

- Chat integration showing player messages
- Top performers leaderboard
- Historical coherence graph
- Breakthrough celebration animation
- Custom branding/logo overlay
- Multi-session comparison view

## Best Practices

### For Hosts

1. **Test before going live**: Always test the view before your actual broadcast
2. **Have a backup**: Keep a static image ready in case of technical issues
3. **Monitor the stats**: Use stats to engage with your audience ("We're at 75%! Keep going!")
4. **Explain the view**: Tell viewers what they're seeing to increase engagement
5. **Capture breakthrough moments**: The 100% coherence moment is peak content

### For Engagement

- Point out synchronized cells: "Look at all that gold!"
- Call out stats: "500 infections cleared! The Body is healing!"
- Build tension: "We're so close to breakthrough..."
- Celebrate together: "CRITICAL MASS ACHIEVED!"

## Support

For issues or questions:

- Check the [Development Guide](DEVELOPMENT_GUIDE.md)
- Review [Firebase Setup](../src/config/firebase.js)
- Open an issue on GitHub
- Join the community Discord (if available)

---

> **"When thousands synchronize, the impossible becomes inevitable. This is Critical Mass."**

*The Body is One.*
