/**
 * useFirebaseSync Hook
 *
 * Manages real-time synchronization with Firebase for multiplayer coherence.
 * Implements graceful degradation for network issues.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { db, checkFirebaseConnection } from '../config/firebase';
import { PERFORMANCE, GAME_CONFIG } from '../constants/gameConfig';

const { FIREBASE_THROTTLE_MS } = PERFORMANCE;

export const useFirebaseSync = ({ sessionId, playerId } = {}) => {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [coherence, setCoherence] = useState(0);
  const [activePlayers, setActivePlayers] = useState(0);
  const [error, setError] = useState(null);

  const throttleTimerRef = useRef(null);
  const pendingUpdateRef = useRef(null);
  const sessionInitializedRef = useRef(false);

  /**
   * Initialize or join game session
   */
  const initializeSession = useCallback(async () => {
    if (!sessionId || !db.database) return;

    try {
      const sessionRef = db.ref(db.database, `sessions/${sessionId}`);
      const snapshot = await new Promise((resolve, reject) => {
        db.onValue(sessionRef, resolve, reject, { onlyOnce: true });
      });

      const sessionData = snapshot.val();

      if (!sessionData) {
        // Session doesn't exist - create it
        console.log(`Creating new game session: ${sessionId}`);
        const newSessionData = {
          coherence: 0,
          activePlayers: 1,
          status: 'PLAYING',
          currentPhase: 'HEARTBEAT',
          beatSide: 'LEFT',
          startTime: Date.now(),
          createdBy: playerId,
        };
        await db.set(sessionRef, newSessionData);

        // Register player in session
        const playerRef = db.ref(db.database, `players/${sessionId}/${playerId}`);
        await db.set(playerRef, {
          isInSync: false,
          lastTap: Date.now(),
          score: 0,
          infectionsCleaned: 0,
          tapAccuracy: 0,
          joinedAt: Date.now(),
        });

        console.log(`Player ${playerId} created and joined session ${sessionId}`);
      } else {
        // Session exists - register as new player
        console.log(`Joining existing game session: ${sessionId}`);
        const playerRef = db.ref(db.database, `players/${sessionId}/${playerId}`);
        await db.set(playerRef, {
          isInSync: false,
          lastTap: Date.now(),
          score: 0,
          infectionsCleaned: 0,
          tapAccuracy: 0,
          joinedAt: Date.now(),
        });

        // Increment active players count
        const updatedCount = (sessionData.activePlayers || 0) + 1;
        await db.update(sessionRef, { activePlayers: updatedCount });

        console.log(`Player ${playerId} joined session ${sessionId} (${updatedCount} active players)`);
      }

      sessionInitializedRef.current = true;
    } catch (err) {
      console.error('Session initialization error:', err);
      throw err;
    }
  }, [sessionId, playerId]);

  /**
   * Initialize Firebase connection
   */
  useEffect(() => {
    if (!sessionId || !playerId) {
      setConnectionStatus('local');
      return;
    }

    const connectionCheck = checkFirebaseConnection();

    if (!connectionCheck.connected) {
      setConnectionStatus('degraded');
      setError(connectionCheck.error);
      console.warn('Firebase not configured, running in local mode');
      return;
    }

    let unsubscribeSession = null;

    const setupSession = async () => {
      try {
        // Initialize or join session first
        await initializeSession();

        // Then listen to session updates
        const sessionRef = db.ref(db.database, `sessions/${sessionId}`);
        unsubscribeSession = db.onValue(sessionRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setCoherence(data.coherence || 0);
            setActivePlayers(data.activePlayers || 0);
            setConnectionStatus('connected');
          }
        }, (err) => {
          console.error('Firebase session error:', err);
          setConnectionStatus('degraded');
          setError(err.message);
        });
      } catch (err) {
        console.error('Firebase setup error:', err);
        setConnectionStatus('degraded');
        setError(err.message);
      }
    };

    setupSession();

    return () => {
      if (unsubscribeSession) {
        unsubscribeSession();
      }

      // Cleanup: Remove player from session and decrement active players count
      if (sessionInitializedRef.current && db.database) {
        const cleanupPlayer = async () => {
          try {
            const playerRef = db.ref(db.database, `players/${sessionId}/${playerId}`);
            await db.remove(playerRef);

            const sessionRef = db.ref(db.database, `sessions/${sessionId}`);
            const snapshot = await new Promise((resolve, reject) => {
              db.onValue(sessionRef, resolve, reject, { onlyOnce: true });
            });
            const sessionData = snapshot.val();

            if (sessionData) {
              const updatedCount = Math.max(0, (sessionData.activePlayers || 1) - 1);
              await db.update(sessionRef, { activePlayers: updatedCount });
              console.log(`Player ${playerId} left session ${sessionId} (${updatedCount} remaining)`);
            }
          } catch (err) {
            console.error('Player cleanup error:', err);
          }
        };
        cleanupPlayer();
      }
    };
  }, [sessionId, playerId, initializeSession]);

  /**
   * Throttled update to Firebase
   * Prevents overwhelming the database with thousands of updates/second
   */
  const updatePlayerState = useCallback((playerData) => {
    if (connectionStatus !== 'connected' || !playerId || !sessionId) {
      return;
    }

    // Store pending update
    pendingUpdateRef.current = playerData;

    // If throttle timer not running, send immediately
    if (!throttleTimerRef.current) {
      sendUpdate(playerData);

      // Start throttle timer
      throttleTimerRef.current = setTimeout(() => {
        // Send any pending update after throttle period
        if (pendingUpdateRef.current) {
          sendUpdate(pendingUpdateRef.current);
          pendingUpdateRef.current = null;
        }
        throttleTimerRef.current = null;
      }, FIREBASE_THROTTLE_MS);
    }
  }, [sessionId, playerId, connectionStatus]);

  /**
   * Send update to Firebase
   */
  const sendUpdate = async (playerData) => {
    try {
      const playerRef = db.ref(db.database, `players/${sessionId}/${playerId}`);
      await db.update(playerRef, {
        ...playerData,
        lastUpdate: Date.now(),
      });
    } catch (err) {
      console.error('Firebase update error:', err);
    }
  };

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, []);

  return {
    connectionStatus,
    coherence,
    activePlayers,
    error,
    updatePlayerState,
    isConnected: connectionStatus === 'connected',
    isDegraded: connectionStatus === 'degraded',
  };
};

export default useFirebaseSync;
