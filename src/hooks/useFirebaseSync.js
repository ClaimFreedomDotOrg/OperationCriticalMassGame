/**
 * useFirebaseSync Hook
 *
 * Manages real-time synchronization with Firebase for multiplayer coherence.
 * Implements graceful degradation for network issues.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { db, checkFirebaseConnection } from '../config/firebase';
import { PERFORMANCE } from '../constants/gameConfig';

const { FIREBASE_THROTTLE_MS } = PERFORMANCE;

export const useFirebaseSync = ({ sessionId, playerId }) => {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [coherence, setCoherence] = useState(0);
  const [activePlayers, setActivePlayers] = useState(0);
  const [error, setError] = useState(null);

  const throttleTimerRef = useRef(null);
  const pendingUpdateRef = useRef(null);

  /**
   * Initialize Firebase connection
   */
  useEffect(() => {
    if (!sessionId || !playerId) return;

    const connectionCheck = checkFirebaseConnection();

    if (!connectionCheck.connected) {
      setConnectionStatus('degraded');
      setError(connectionCheck.error);
      console.warn('Firebase not configured, running in local mode');
      return;
    }

    try {
      // Listen to session coherence
      const sessionRef = db.ref(db.database, `sessions/${sessionId}`);
      const unsubscribeSession = db.onValue(sessionRef, (snapshot) => {
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

      return () => {
        unsubscribeSession();
      };
    } catch (err) {
      console.error('Firebase setup error:', err);
      setConnectionStatus('degraded');
      setError(err.message);
    }
  }, [sessionId, playerId]);

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
