/**
 * LivestreamView Component
 *
 * The main view displayed on the livestream for the host and audience.
 * Shows all connected players, real-time stats, and collective coherence visualization.
 *
 * Scientific Basis: Collective biofeedback - making the invisible (group coherence) visible
 * Aesthetic: Bio-digital bioluminescence with sacred geometry
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { db } from '../config/firebase';
import COLORS from '../constants/colors';
import QRCode from 'qrcode';

const LivestreamView = ({ sessionId }) => {
  const [sessionData, setSessionData] = useState(null);
  const [players, setPlayers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationTriggered, setCelebrationTriggered] = useState(false);
  // Ref to track the last known valid startTime (persists across renders/resets)
  const lastValidStartTimeRef = useRef(null);
  // Captured stats at moment of breakthrough (before reset)
  const [breakthroughStats, setBreakthroughStats] = useState({
    activePlayers: 0,
    sessionDuration: 0,
    totalTaps: 0,
    successfulTaps: 0,
    missedTaps: 0,
    infectionsCleared: 0,
    avgAccuracy: 0,
  });
  const [stats, setStats] = useState({
    totalTaps: 0,
    successfulTaps: 0,
    missedTaps: 0,
    infectionsCleared: 0,
    avgAccuracy: 0,
    sessionDuration: 0,
  });

  // Reset stats when sessionId changes (new session)
  useEffect(() => {
    console.log('🔄 LivestreamView: Resetting stats for new session:', sessionId);
    setStats({
      totalTaps: 0,
      successfulTaps: 0,
      missedTaps: 0,
      infectionsCleared: 0,
      avgAccuracy: 0,
      sessionDuration: 0,
    });
    setPlayers({}); // Also reset players
  }, [sessionId]);

  // Generate QR code for join URL
  useEffect(() => {
    if (!sessionId) return;

    const joinUrl = `${window.location.origin}/?session=${sessionId}`;

    QRCode.toDataURL(joinUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#22d3ee', // cyan-400
        light: '#000000', // black
      },
    })
      .then(url => {
        setQrCodeUrl(url);
      })
      .catch(err => {
        console.error('Failed to generate QR code:', err);
      });
  }, [sessionId]);

  // Register LivestreamView presence with heartbeat
  useEffect(() => {
    if (!sessionId || !db.database) return;

    console.log('📺 LivestreamView: Registering active presence');

    const updateHeartbeat = async () => {
      try {
        const sessionRef = db.ref(db.database, `sessions/${sessionId}`);
        await db.update(sessionRef, {
          livestreamActive: true,
          livestreamHeartbeat: Date.now(),
        });
      } catch (err) {
        console.error('Failed to update livestream heartbeat:', err);
      }
    };

    // Initial heartbeat
    updateHeartbeat();

    // Update heartbeat every 10 seconds
    const heartbeatInterval = setInterval(updateHeartbeat, 10000);

    // Cleanup on unmount
    return () => {
      clearInterval(heartbeatInterval);
      console.log('📺 LivestreamView: Unregistering presence');
      const sessionRef = db.ref(db.database, `sessions/${sessionId}`);
      db.update(sessionRef, {
        livestreamActive: false,
        livestreamHeartbeat: Date.now(),
      }).catch(err => console.error('Failed to unregister livestream:', err));
    };
  }, [sessionId]);

  // Listen to session data
  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    if (!db.database) {
      setError('Firebase not initialized');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const sessionRef = db.ref(db.database, `sessions/${sessionId}`);

    const unsubscribe = db.onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSessionData(data);
        setError(null);
      } else {
        setError('Session not found. Waiting for session to be created...');
      }
      setIsLoading(false);
    }, (err) => {
      setError(`Firebase error: ${err.message}`);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId]);

  // Listen to players data
  useEffect(() => {
    if (!sessionId || !db.database) return;

    const playersRef = db.ref(db.database, `players/${sessionId}`);
    const unsubscribe = db.onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPlayers(data);
        calculateStats(data);
      } else {
        // No players - reset to empty object
        console.log('📭 No players in session - resetting players state');
        setPlayers({});
      }
    });

    return () => unsubscribe();
  }, [sessionId]); // calculateStats is memoized with useCallback, no need to include it

  // Calculate aggregate statistics
  const calculateStats = useCallback((playersData) => {
    const playerArray = Object.values(playersData);
    const totalTaps = playerArray.reduce((sum, p) => sum + (p.totalTaps || 0), 0);
    const successfulTaps = playerArray.reduce((sum, p) => sum + (p.successfulTaps || 0), 0);
    const missedTaps = totalTaps - successfulTaps;
    const infectionsCleared = playerArray.reduce((sum, p) => sum + (p.infectionsCleaned || 0), 0);
    const avgAccuracy = totalTaps > 0 ? (successfulTaps / totalTaps * 100) : 0;

    setStats({
      totalTaps,
      successfulTaps,
      missedTaps,
      infectionsCleared,
      avgAccuracy,
    });
  }, []);

  // Reset stats and timer when no players are active
  useEffect(() => {
    const playerCount = Object.keys(players).length;

    if (playerCount === 0 && sessionId && db.database) {
      console.log('🔄 No players active - resetting stats and timer');

      // Reset local stats
      setStats({
        totalTaps: 0,
        successfulTaps: 0,
        missedTaps: 0,
        infectionsCleared: 0,
        avgAccuracy: 0,
        sessionDuration: 0,
      });

      // Reset startTime and coherence in Firebase so timer starts fresh when next player joins
      const sessionRef = db.ref(db.database, `sessions/${sessionId}`);
      db.update(sessionRef, { startTime: null, coherence: 0 }).catch(err => {
        console.error('Failed to reset session:', err);
      });
    }
  }, [players, sessionId]);

  // Update session duration (only if there are players and startTime exists)
  useEffect(() => {
    const playerCount = Object.keys(players).length;
    const startTime = sessionData?.startTime;

    // Ensure we have a valid startTime number and at least one player
    if (!startTime || typeof startTime !== 'number' || isNaN(startTime) || playerCount === 0) {
      console.log('⏱️ Timer not starting:', { startTime, playerCount, isValid: typeof startTime === 'number' });
      return;
    }

    // Store the valid startTime in ref for breakthrough capture
    lastValidStartTimeRef.current = startTime;
    console.log('⏱️ Starting session timer with startTime:', new Date(startTime).toISOString());

    // Set initial duration immediately
    const initialDuration = Math.floor((Date.now() - startTime) / 1000);
    setStats(prev => ({ ...prev, sessionDuration: initialDuration }));

    // Update every second
    const interval = setInterval(() => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      setStats(prev => ({ ...prev, sessionDuration: duration }));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionData?.startTime, players]);

  // Cleanup inactive players (no activity for 30+ seconds)
  useEffect(() => {
    if (!sessionId || !db.database || Object.keys(players).length === 0) return;

    const cleanupInterval = setInterval(async () => {
      const now = Date.now();
      const INACTIVE_THRESHOLD = 30000; // 30 seconds

      const inactivePlayers = Object.entries(players).filter(([playerId, playerData]) => {
        const lastActivity = playerData.lastTap || playerData.joinedAt || 0;
        return (now - lastActivity) > INACTIVE_THRESHOLD;
      });

      if (inactivePlayers.length > 0) {
        console.log(`🧹 Cleaning up ${inactivePlayers.length} inactive players:`, inactivePlayers.map(([id]) => id));

        // Delete each inactive player
        for (const [playerId] of inactivePlayers) {
          try {
            const playerRef = db.ref(db.database, `players/${sessionId}/${playerId}`);
            await db.remove(playerRef);
            console.log(`  ✅ Removed inactive player: ${playerId}`);
          } catch (err) {
            console.error(`  ❌ Failed to remove player ${playerId}:`, err);
          }
        }

        // Update active players count in session
        try {
          const remainingCount = Object.keys(players).length - inactivePlayers.length;
          const sessionRef = db.ref(db.database, `sessions/${sessionId}`);
          await db.update(sessionRef, { activePlayers: Math.max(0, remainingCount) });
          console.log(`  📊 Updated active players count to: ${remainingCount}`);
        } catch (err) {
          console.error('  ❌ Failed to update active players count:', err);
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(cleanupInterval);
  }, [sessionId, players]);

  // Calculate and sync global coherence to Firebase (LivestreamView is the authority)
  useEffect(() => {
    if (!sessionId || !db.database) return;

    const syncInterval = setInterval(async () => {
      const playerArray = Object.values(players);
      const activePlayers = playerArray.length;

      if (activePlayers === 0) {
        // Already handled by reset effect
        return;
      }

      // Calculate coherence from player data
      // Sum up all player coherence levels and average them
      const totalPlayerCoherence = playerArray.reduce((sum, p) => sum + (p.playerCoherence || 0), 0);
      const avgCoherence = activePlayers > 0 ? totalPlayerCoherence / activePlayers : 0;
      const coherencePercent = Math.max(0, Math.min(100, avgCoherence)); // Clamp to 0-100

      console.log(`📊 LivestreamView calculating coherence: ${playerArray.length} players, avg: ${coherencePercent.toFixed(1)}%`);

      // Update session coherence in Firebase
      try {
        const sessionRef = db.ref(db.database, `sessions/${sessionId}`);
        await db.update(sessionRef, {
          coherence: Math.round(coherencePercent * 10) / 10, // Round to 1 decimal place
          activePlayers: activePlayers,
        });
      } catch (err) {
        console.error('Failed to update session coherence:', err);
      }
    }, 500); // Update every 500ms for smooth visual updates

    return () => clearInterval(syncInterval);
  }, [sessionId, players]);

  // Determine coherence level for visual effects (defined before use)
  const getCoherenceLevel = useCallback((percent) => {
    if (percent >= 90) return 'PERFECT';
    if (percent >= 70) return 'HIGH';
    if (percent >= 40) return 'MEDIUM';
    if (percent >= 20) return 'LOW';
    return 'CHAOTIC';
  }, []);

  // Calculate coherence metrics
  const coherenceMetrics = useMemo(() => {
    // Always calculate from current player data (LivestreamView is the authority)
    const playerArray = Object.values(players);
    const activePlayers = playerArray.length;
    let coherencePercent = 0;
    let syncedPlayers = 0;

    if (activePlayers > 0) {
      // Calculate coherence from player data
      const totalPlayerCoherence = playerArray.reduce((sum, p) => sum + (p.playerCoherence || 0), 0);
      coherencePercent = totalPlayerCoherence / activePlayers;
      syncedPlayers = playerArray.filter(p => p.isInSync).length;
    }

    return {
      coherencePercent: Math.round(coherencePercent * 10) / 10,
      syncedPlayers,
      activePlayers,
      coherenceLevel: getCoherenceLevel(coherencePercent),
    };
  }, [players, getCoherenceLevel]);

  // Trigger celebration when coherence reaches 100%
  useEffect(() => {
    if (coherenceMetrics.coherencePercent >= 100 && !celebrationTriggered) {
      // Use ref for startTime as it persists even after sessionData is reset
      const startTime = lastValidStartTimeRef.current || sessionData?.startTime;
      const calculatedDuration = (startTime && typeof startTime === 'number')
        ? Math.floor((Date.now() - startTime) / 1000)
        : stats.sessionDuration;

      // Get player count directly from players object to ensure accuracy
      const playerCount = Object.keys(players).length;

      console.log('🎉 CRITICAL MASS ACHIEVED - Triggering celebration!');
      console.log('📊 Capturing breakthrough stats:', {
        playerCount: playerCount,
        coherenceMetricsActivePlayers: coherenceMetrics.activePlayers,
        sessionDuration: calculatedDuration,
        startTimeFromRef: lastValidStartTimeRef.current,
        startTimeFromSessionData: sessionData?.startTime,
        statsSessionDuration: stats.sessionDuration,
        totalTaps: stats.totalTaps,
        successfulTaps: stats.successfulTaps,
        avgAccuracy: stats.avgAccuracy,
      });

      // Capture current stats BEFORE they get reset
      // Use playerCount directly from players object for accuracy
      setBreakthroughStats({
        activePlayers: playerCount,
        sessionDuration: calculatedDuration,
        totalTaps: stats.totalTaps,
        successfulTaps: stats.successfulTaps,
        missedTaps: stats.missedTaps,
        infectionsCleared: stats.infectionsCleared,
        avgAccuracy: stats.avgAccuracy,
      });

      setShowCelebration(true);
      setCelebrationTriggered(true);
    }
  }, [coherenceMetrics.coherencePercent, players, stats, sessionData?.startTime, celebrationTriggered]);

  // Auto-hide celebration after 30 seconds (separate effect to avoid timer being cleared by dependency changes)
  useEffect(() => {
    if (!showCelebration) return;

    console.log('⏱️ Starting 30-second celebration timer');
    const timer = setTimeout(() => {
      console.log('⏱️ Celebration timer complete - hiding breakthrough screen');
      setShowCelebration(false);
      setCelebrationTriggered(false); // Allow new breakthrough to trigger
    }, 30000);

    return () => clearTimeout(timer);
  }, [showCelebration]);

  // Get color based on coherence
  const getCoherenceColor = () => {
    const { coherenceLevel } = coherenceMetrics;
    switch (coherenceLevel) {
      case 'PERFECT':
      case 'HIGH':
        return COLORS.AMBER_400;
      case 'MEDIUM':
        return COLORS.CYAN_400;
      case 'LOW':
        return COLORS.RED_500;
      case 'CHAOTIC':
      default:
        return COLORS.RED_500;
    }
  };

  // Get background effects based on coherence
  const getBackgroundEffect = () => {
    const { coherenceLevel } = coherenceMetrics;
    switch (coherenceLevel) {
      case 'PERFECT':
        return 'shadow-[inset_0_0_100px_rgba(251,191,36,0.3)]';
      case 'HIGH':
        return 'shadow-[inset_0_0_80px_rgba(251,191,36,0.2)]';
      case 'MEDIUM':
        return 'shadow-[inset_0_0_60px_rgba(34,211,238,0.2)]';
      default:
        return 'shadow-[inset_0_0_60px_rgba(239,68,68,0.15)]';
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

// Generate cell positions (fill from top-left in rows)
  const cellPositions = useMemo(() => {
    const playerArray = Object.keys(players);
    const positions = [];

    // Fixed cell size and spacing
    const cellSize = 12; // pixels
    const gap = 16; // gap between cells
    const containerWidth = 1920; // approximate container width for 16:9 aspect ratio
    const containerHeight = 1080;

    // Calculate how many cells fit per row
    const cellsPerRow = Math.floor(containerWidth / (cellSize + gap));

    playerArray.forEach((playerId, index) => {
      // Fill left to right, then top to bottom
      const col = index % cellsPerRow;
      const row = Math.floor(index / cellsPerRow);

      // Calculate pixel positions from top-left
      const xPixels = gap + col * (cellSize + gap) + (cellSize / 2);
      const yPixels = gap + row * (cellSize + gap) + (cellSize / 2);

      // Convert to percentage
      const x = (xPixels / containerWidth) * 100;
      const y = (yPixels / containerHeight) * 100;

      positions.push({
        playerId,
        x: Math.min(98, x),
        y: Math.min(98, y),
      });
    });

    return positions;
  }, [Object.keys(players).length]);

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold text-cyan-400 mb-4 animate-pulse-glow">
            Operation: Critical Mass
          </h1>
          <p className="text-2xl text-cyan-100/80 mb-8">
            Livestream View
          </p>
          <div className="bg-red-950/30 border-2 border-red-500 rounded-xl p-6 mb-6">
            <p className="text-xl text-red-400 font-bold mb-4">
              ⚠️ No Session ID Provided
            </p>
            <p className="text-gray-300 mb-4">
              To use the livestream view, add a session ID to the URL:
            </p>
            <code className="block bg-black/50 p-4 rounded text-cyan-300 text-sm md:text-base break-all">
              ?view=livestream&session=YOUR_SESSION_ID
            </code>
          </div>
          <div className="text-left bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Example:</p>
            <code className="block text-cyan-300/80 text-xs md:text-sm break-all">
              http://localhost:5173/?view=livestream&session=GAME-2024-12-27
            </code>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-4 animate-pulse">
            Loading Session...
          </h1>
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-cyan-100/60 mt-8">Session ID: {sessionId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-4">
            Operation: Critical Mass
          </h1>
          <p className="text-xl text-cyan-100/80 mb-8">
            Livestream View
          </p>
          <div className="bg-amber-950/30 border-2 border-amber-500 rounded-xl p-6 mb-6">
            <p className="text-xl text-amber-400 font-bold mb-4">
              ⚡ {error}
            </p>
            <p className="text-gray-300 mb-4">
              Session ID: <span className="text-cyan-300 font-mono">{sessionId}</span>
            </p>
            {error.includes('not found') && (
              <p className="text-gray-400 text-sm">
                This view will automatically update once a player joins this session.
              </p>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-cyan-900/40 border-2 border-cyan-500 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-all"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-black relative overflow-hidden transition-all duration-500 ${getBackgroundEffect()}`}>
      {/* Celebration Overlay - CRITICAL MASS ACHIEVED */}
      {showCelebration && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-amber-100/95 to-white/95 animate-in fade-in duration-1000 pointer-events-none">
          {/* Sacred Geometry - Toroid visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-64 md:w-96 md:h-96">
              <div className="absolute inset-0 rounded-full border-4 border-amber-600 animate-pulse-glow opacity-70" />
              <div
                className="absolute inset-8 rounded-full border-4 border-amber-500 animate-pulse-glow opacity-50"
                style={{ animationDelay: '0.5s' }}
              />
              <div
                className="absolute inset-16 rounded-full border-4 border-amber-400 animate-pulse-glow opacity-30"
                style={{ animationDelay: '1s' }}
              />
              {/* Spinning rings */}
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500 animate-spin-slow opacity-40" style={{ animationDuration: '10s' }} />
              <div className="absolute inset-12 rounded-full border-2 border-amber-600 animate-spin-slow opacity-40" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
            </div>
          </div>

          {/* Text Overlay */}
          <div className="relative z-10 text-center">
            <h1 className="text-6xl md:text-9xl font-bold text-amber-600 mb-4 tracking-tighter drop-shadow-lg animate-bounce font-serif">
              BREAKTHROUGH
            </h1>
            <p className="text-3xl md:text-5xl text-amber-800/80 font-semibold mb-4">
              CRITICAL MASS ACHIEVED
            </p>
            <p className="text-2xl md:text-4xl text-gray-700 font-bold">
              100% COHERENCE
            </p>
            <p className="text-xl md:text-3xl text-gray-600 mt-4">
              THE BODY IS ONE
            </p>

            {/* Stats Display */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 md:gap-10 max-w-7xl mx-auto px-4">
              <div className="bg-white/90 rounded-2xl px-10 py-8 md:px-16 md:py-10 shadow-2xl">
                <div className="text-6xl md:text-8xl font-bold text-amber-600">{breakthroughStats.activePlayers}</div>
                <div className="text-xl md:text-2xl text-gray-600 mt-2 font-medium">Synchronized Cells</div>
              </div>
              <div className="bg-white/90 rounded-2xl px-10 py-8 md:px-16 md:py-10 shadow-2xl">
                <div className="text-6xl md:text-8xl font-bold text-amber-600">{formatTime(breakthroughStats.sessionDuration)}</div>
                <div className="text-xl md:text-2xl text-gray-600 mt-2 font-medium">Session Time</div>
              </div>
              <div className="bg-white/90 rounded-2xl px-10 py-8 md:px-16 md:py-10 shadow-2xl">
                <div className="text-6xl md:text-8xl font-bold text-cyan-600">{breakthroughStats.totalTaps.toLocaleString()}</div>
                <div className="text-xl md:text-2xl text-gray-600 mt-2 font-medium">Total Taps</div>
              </div>
              <div className="bg-white/90 rounded-2xl px-10 py-8 md:px-16 md:py-10 shadow-2xl">
                <div className="text-6xl md:text-8xl font-bold text-green-600">{breakthroughStats.successfulTaps.toLocaleString()}</div>
                <div className="text-xl md:text-2xl text-gray-600 mt-2 font-medium">Successful Taps</div>
              </div>
              <div className="bg-white/90 rounded-2xl px-10 py-8 md:px-16 md:py-10 shadow-2xl">
                <div className="text-6xl md:text-8xl font-bold text-cyan-600">{breakthroughStats.avgAccuracy.toFixed(1)}%</div>
                <div className="text-xl md:text-2xl text-gray-600 mt-2 font-medium">Accuracy</div>
              </div>
              <div className="bg-white/90 rounded-2xl px-10 py-8 md:px-16 md:py-10 shadow-2xl">
                <div className="text-6xl md:text-8xl font-bold text-red-500">{breakthroughStats.infectionsCleared}</div>
                <div className="text-xl md:text-2xl text-gray-600 mt-2 font-medium">Infections Cleared</div>
              </div>
            </div>
          </div>

          {/* Particle Effects */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-amber-400 rounded-full animate-float opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div
              key={i}
              className="border border-cyan-500/20"
              style={{
                animation: `pulse ${2 + (i % 3)}s infinite ${(i % 5) * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="relative z-30 p-8 border-b-2 border-cyan-900/50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-2">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-600 to-cyan-400 text-transparent bg-clip-text animate-pulse-glow">
              Operation: Critical Mass
            </span>
          </h1>
          <p className="text-center text-cyan-100/60 text-xl">
            Collective Coherence in Real-Time
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Coherence Meter */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border-2 p-6"
                 style={{ borderColor: getCoherenceColor() }}>
              <h2 className="text-3xl font-bold mb-4 text-center" style={{ color: getCoherenceColor() }}>
                COLLECTIVE COHERENCE
              </h2>

              {/* Large Percentage Display */}
              <div className="text-center mb-6">
                <div className="text-8xl md:text-9xl font-bold tabular-nums"
                     style={{
                       color: getCoherenceColor(),
                       textShadow: `0 0 30px ${getCoherenceColor()}80`,
                     }}>
                  {coherenceMetrics.coherencePercent.toFixed(1)}%
                </div>
                <div className="text-2xl text-gray-400 mt-2">
                  {coherenceMetrics.coherenceLevel}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-8 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-300 ease-out rounded-full"
                  style={{
                    width: `${coherenceMetrics.coherencePercent}%`,
                    backgroundColor: getCoherenceColor(),
                    boxShadow: `0 0 20px ${getCoherenceColor()}80`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>

              {/* Synced Players Count */}
              <div className="flex justify-between mt-4 text-lg">
                <span className="text-gray-400">
                  Synchronized:
                </span>
                <span className="font-bold" style={{ color: getCoherenceColor() }}>
                  {coherenceMetrics.syncedPlayers} / {coherenceMetrics.activePlayers}
                </span>
              </div>
            </div>
            {/* Join CTA Box */}
            <div className="mt-6 bg-gradient-to-br from-cyan-900/40 to-amber-900/40 rounded-xl p-6 border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
              <h3 className="text-2xl md:text-3xl font-bold text-center mb-4 text-amber-400">
                🎮 JOIN THE COLLECTIVE BODY
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-6 items-center">
                {/* Left Column - Text Info */}
                <div className="space-y-4">
                  <div className="bg-black/50 rounded-lg p-4">
                    <p className="text-gray-400 text-xs md:text-sm mb-2">Session ID:</p>
                    <p className="text-cyan-400 text-2xl md:text-3xl font-bold tracking-wider font-mono">
                      {sessionId}
                    </p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4">
                    <p className="text-gray-400 text-xs md:text-sm mb-2">Go to this URL on your phone:</p>
                    <p className="text-amber-400 text-base md:text-xl font-bold break-all">
                      {window.location.origin}
                    </p>
                  </div>
                  <p className="text-cyan-100 text-sm md:text-base font-medium">
                    1. Scan QR or visit URL → 2. Tap "Multiplayer" → 3. Enter Session ID
                  </p>
                </div>

                {/* Right Column - QR Code */}
                <div className="flex justify-center md:justify-end">
                  <div className="bg-white p-3 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="QR Code to join session"
                        className="w-40 h-40 md:w-48 md:h-48"
                      />
                    ) : (
                      <div className="w-40 h-40 md:w-48 md:h-48 flex items-center justify-center bg-gray-800 rounded">
                        <span className="text-gray-400 text-sm">Generating...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>          </div>

          {/* Stats Panel */}
          <div className="space-y-4">
            <StatCard
              label="Active Cells"
              value={coherenceMetrics.activePlayers}
              color={COLORS.CYAN_400}
              icon="👥"
            />
            <StatCard
              label="Total Syncs"
              value={stats.totalTaps.toLocaleString()}
              color={COLORS.CYAN_400}
              icon="👆"
            />
            <StatCard
              label="Accuracy"
              value={`${stats.avgAccuracy.toFixed(1)}%`}
              color={stats.avgAccuracy >= 80 ? COLORS.AMBER_400 : COLORS.CYAN_400}
              icon="🎯"
            />
            <StatCard
              label="Infections Cleared"
              value={stats.infectionsCleared.toLocaleString()}
              color={COLORS.AMBER_400}
              icon="✨"
            />
            <StatCard
              label="Session Time"
              value={formatTime(stats.sessionDuration)}
              color={COLORS.CYAN_400}
              icon="⏱️"
            />
          </div>
        </div>

        {/* Scrolling Info Ticker */}
        <div className="mb-6 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 border-y-4 border-amber-400 py-4 overflow-hidden shadow-[0_0_30px_rgba(251,191,36,0.4)]">
          <div className="animate-ticker whitespace-nowrap">
            <span className="inline-block text-2xl md:text-3xl lg:text-4xl font-bold text-white px-8">
              🧠 THIS GAME IS MEDICINE FOR YOUR BRAIN! 🧠
            </span>
            <span className="inline-block text-2xl md:text-3xl lg:text-4xl font-bold text-cyan-300 px-8">
              📚 Based on cutting-edge neuroscience — backed by 100+ peer-reviewed studies 📚
            </span>
            <span className="inline-block text-2xl md:text-3xl lg:text-4xl font-bold text-amber-300 px-8">
              🔬 Validated by real-world brain scans and clinical results 🔬
            </span>
            <span className="inline-block text-2xl md:text-3xl lg:text-4xl font-bold text-white px-8">
              ✨ Proven to help with ADD/ADHD, Anxiety & Depression ✨
            </span>
            <span className="inline-block text-2xl md:text-3xl lg:text-4xl font-bold text-cyan-300 px-8">
              🎯 Strengthens your Salience Network (your brain's control panel) 🎯
            </span>
            <span className="inline-block text-2xl md:text-3xl lg:text-4xl font-bold text-amber-300 px-8">
              🔇 Tames the Default Mode Network (negative thoughts, rumination, suffering) 🔇
            </span>
            <span className="inline-block text-2xl md:text-3xl lg:text-4xl font-bold text-white px-8">
              ⚡ Activates Task-Positive Network to unlock FLOW STATE ⚡
            </span>
            <span className="inline-block text-2xl md:text-3xl lg:text-4xl font-bold text-cyan-300 px-8">
              💡 Trains you to dismiss intrusive thoughts as mere distractions 💡
            </span>
            <span className="inline-block text-2xl md:text-3xl lg:text-4xl font-bold text-amber-300 px-8">
              🌟 Rewire your nervous system through bilateral stimulation (same as EMDR therapy) 🌟
            </span>
            <span className="inline-block text-2xl md:text-3xl lg:text-4xl font-bold text-white px-8">
              🎮 Play together. Heal together. THE BODY IS ONE. 🎮
            </span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mb-6">
          <p className="text-3xl md:text-5xl font-bold">
            <span className="text-amber-400">📱 Scan the QR Code to Play!</span>
          </p>
        </div>

        {/* Cell Visualization */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border-2 border-cyan-900/50 p-6">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4 text-center">
            THE BODY - {coherenceMetrics.activePlayers} CELLS CONNECTED
          </h2>

          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-gray-800">
            {/* Background Energy Field - scales with coherence */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
              style={{
                background: coherenceMetrics.coherencePercent >= 60
                  ? `radial-gradient(circle at center, ${COLORS.AMBER_400}${Math.round(coherenceMetrics.coherencePercent * 0.15).toString(16).padStart(2, '0')} 0%, transparent 70%)`
                  : coherenceMetrics.coherencePercent >= 30
                  ? `radial-gradient(circle at center, ${COLORS.CYAN_400}${Math.round(coherenceMetrics.coherencePercent * 0.12).toString(16).padStart(2, '0')} 0%, transparent 60%)`
                  : `radial-gradient(circle at center, ${COLORS.RED_500}${Math.round(coherenceMetrics.coherencePercent * 0.08).toString(16).padStart(2, '0')} 0%, transparent 50%)`,
              }}
            />

            {/* Cells */}
            {cellPositions.map(({ playerId, x, y }, index) => {
              const player = players[playerId];
              const isInSync = player?.isInSync || false;
              const cellColor = isInSync ? COLORS.AMBER_400 : COLORS.RED_900;
              const glowColor = isInSync
                ? 'rgba(251, 191, 36, 0.8)'
                : 'rgba(127, 29, 29, 0.6)';

              // Calculate animation based on coherence level
              const baseGlow = isInSync ? 20 : 10;
              const coherenceBoost = Math.floor(coherenceMetrics.coherencePercent / 20); // 0-5 boost
              const glowSize = baseGlow + coherenceBoost * 3;

              // Staggered animation delay based on position
              const animDelay = (index % 10) * 0.1;

              return (
                <div
                  key={playerId}
                  className="absolute rounded-full transition-all duration-300"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: '12px',
                    height: '12px',
                    backgroundColor: cellColor,
                    boxShadow: `0 0 ${glowSize}px ${glowColor}`,
                    transform: 'translate(-50%, -50%)',
                    animation: isInSync
                      ? `pulse ${2 - coherenceMetrics.coherencePercent * 0.01}s infinite ${animDelay}s`
                      : `flicker ${1.5 + Math.random()}s infinite ${animDelay}s`,
                  }}
                />
              );
            })}

            {/* Chaotic State Effect (0-29% coherence OR no players) - Multiple chaotic patterns */}
            {(coherenceMetrics.coherencePercent < 30 || coherenceMetrics.activePlayers === 0) && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Scanlines */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      0deg,
                      transparent,
                      transparent 2px,
                      ${COLORS.RED_500}20 2px,
                      ${COLORS.RED_500}20 4px
                    )`,
                    animation: 'scanlines 0.1s linear infinite',
                  }}
                />

                {/* Chaotic spinning fragments */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Broken ring 1 */}
                  <div
                    className="absolute rounded-full border-2 border-red-500/40"
                    style={{
                      width: '25%',
                      height: '25%',
                      borderStyle: 'dashed',
                      animation: 'spin-chaotic 3s linear infinite',
                    }}
                  />
                  {/* Broken ring 2 */}
                  <div
                    className="absolute rounded-full border-2 border-red-400/30"
                    style={{
                      width: '40%',
                      height: '40%',
                      borderStyle: 'dotted',
                      animation: 'spin-chaotic 5s linear infinite reverse',
                    }}
                  />
                  {/* Broken ring 3 */}
                  <div
                    className="absolute rounded-full border border-red-600/20"
                    style={{
                      width: '55%',
                      height: '55%',
                      borderStyle: 'dashed',
                      animation: 'spin-chaotic 7s linear infinite',
                    }}
                  />
                </div>

                {/* Random glitch rectangles */}
                <div
                  className="absolute bg-red-500/10"
                  style={{
                    width: '30%',
                    height: '5%',
                    left: '10%',
                    top: '20%',
                    animation: 'glitch-h 0.3s steps(2) infinite',
                  }}
                />
                <div
                  className="absolute bg-red-500/10"
                  style={{
                    width: '25%',
                    height: '3%',
                    right: '15%',
                    top: '60%',
                    animation: 'glitch-h 0.5s steps(3) infinite 0.1s',
                  }}
                />
                <div
                  className="absolute bg-red-500/10"
                  style={{
                    width: '4%',
                    height: '40%',
                    left: '70%',
                    top: '30%',
                    animation: 'glitch-v 0.4s steps(2) infinite 0.2s',
                  }}
                />

                {/* Noise overlay */}
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    animation: 'noise 0.2s steps(5) infinite',
                  }}
                />

                {/* Pulsing red glow from center */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.15) 0%, transparent 50%)',
                    animation: 'chaos-pulse 1.5s ease-in-out infinite',
                  }}
                />
              </div>
            )}

            {/* Low Coherence Effect (30-59%) - Cyan energy building */}
            {coherenceMetrics.coherencePercent >= 30 && coherenceMetrics.coherencePercent < 60 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="rounded-full border border-cyan-500/30"
                  style={{
                    width: '30%',
                    height: '30%',
                    boxShadow: `0 0 20px ${COLORS.CYAN_GLOW}`,
                    animation: 'pulse 3s infinite',
                  }}
                />
              </div>
            )}

            {/* Medium Coherence Effect (60-79%) - Growing sacred geometry */}
            {coherenceMetrics.coherencePercent >= 60 && coherenceMetrics.coherencePercent < 80 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="rounded-full border-2 border-cyan-400/50 animate-spin-slow"
                  style={{
                    width: '35%',
                    height: '35%',
                    boxShadow: `0 0 25px ${COLORS.CYAN_GLOW}`,
                    animationDuration: '25s',
                  }}
                />
                <div
                  className="absolute rounded-full border border-amber-400/30"
                  style={{
                    width: '50%',
                    height: '50%',
                    boxShadow: `0 0 15px ${COLORS.AMBER_GLOW}`,
                    animation: 'pulse 2.5s infinite',
                  }}
                />
              </div>
            )}

            {/* High Coherence Effect (80-94%) - Full sacred geometry */}
            {coherenceMetrics.coherencePercent >= 80 && coherenceMetrics.coherencePercent < 95 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="rounded-full border-2 animate-spin-slow"
                  style={{
                    width: '40%',
                    height: '40%',
                    borderColor: COLORS.AMBER_400,
                    boxShadow: `0 0 40px ${COLORS.AMBER_GLOW}`,
                    animationDuration: '20s',
                  }}
                />
                <div
                  className="absolute rounded-full border-2 animate-spin-slow"
                  style={{
                    width: '60%',
                    height: '60%',
                    borderColor: COLORS.CYAN_400,
                    boxShadow: `0 0 40px ${COLORS.CYAN_GLOW}`,
                    animationDuration: '30s',
                    animationDirection: 'reverse',
                  }}
                />
              </div>
            )}

            {/* Perfect Coherence Effect (95%+) - Transcendent state */}
            {coherenceMetrics.coherencePercent >= 95 && (
              <>
                <div className="absolute inset-0 bg-gradient-radial from-amber-500/20 via-amber-500/5 to-transparent animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="rounded-full border-4 animate-spin-slow"
                    style={{
                      width: '45%',
                      height: '45%',
                      borderColor: COLORS.AMBER_400,
                      boxShadow: `0 0 60px ${COLORS.AMBER_GLOW}, inset 0 0 30px ${COLORS.AMBER_GLOW}`,
                      animationDuration: '15s',
                    }}
                  />
                  <div
                    className="absolute rounded-full border-3 animate-spin-slow"
                    style={{
                      width: '65%',
                      height: '65%',
                      borderColor: COLORS.CYAN_400,
                      boxShadow: `0 0 50px ${COLORS.CYAN_GLOW}`,
                      animationDuration: '25s',
                      animationDirection: 'reverse',
                    }}
                  />
                  <div
                    className="absolute rounded-full border-2 animate-spin-slow"
                    style={{
                      width: '80%',
                      height: '80%',
                      borderColor: COLORS.AMBER_400,
                      boxShadow: `0 0 40px ${COLORS.AMBER_GLOW}`,
                      animationDuration: '35s',
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-8 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400" style={{ boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)' }} />
              <span className="text-amber-400">Synchronized</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-900" style={{ boxShadow: '0 0 10px rgba(127, 29, 29, 0.6)' }} />
              <span className="text-red-500">Out of Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-30 p-4 text-center text-gray-500 text-sm">
        <p>Session ID: {sessionId}</p>
        <p className="mt-1 text-cyan-400/60">THE BODY IS ONE</p>
      </footer>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ label, value, color, icon }) => (
  <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg border-2 border-gray-800 p-4 hover:border-cyan-900/50 transition-all">
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="text-3xl font-bold tabular-nums" style={{ color }}>
      {value}
    </div>
  </div>
);

export default LivestreamView;
