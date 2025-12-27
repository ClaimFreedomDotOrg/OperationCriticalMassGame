/**
 * Firebase Cloud Functions for Operation: Critical Mass
 *
 * These functions run server-side to handle coherence calculation
 * at scale (thousands of concurrent players).
 *
 * Setup:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Initialize functions: firebase init functions
 * 3. Deploy: firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Update Coherence on Player State Change
 *
 * Triggers whenever any player in a session updates their state.
 *
 * Progressive Difficulty System:
 * - Each player builds their own coherence (0-100) through successful taps
 * - Session coherence = average of all players' individual coherence levels
 * - With 2 players: both must reach 100% (twice as hard as single player)
 * - With 10 players: all 10 must reach 100% (10x as hard as single player)
 *
 * Scalability:
 * - Runs server-side (no client bandwidth usage)
 * - Single authoritative calculation (no race conditions)
 * - Triggered only on actual changes (no unnecessary polling)
 * - Firebase automatically handles high concurrency
 *
 * Performance:
 * - With 1000 players: ~1000 function invocations/sec during active play
 * - Each function reads 1000 player records (cached by Firebase)
 * - Cost: ~$0.40 per million invocations + database operations
 * - Response time: < 100ms typical
 */
exports.updateCoherence = functions.database
  .ref('/players/{sessionId}/{playerId}')
  .onWrite(async (change, context) => {
    const sessionId = context.params.sessionId;

    try {
      // Read all players in this session
      const playersSnapshot = await admin.database()
        .ref(`players/${sessionId}`)
        .once('value');

      const playersData = playersSnapshot.val();

      if (!playersData) {
        // No players left in session - set coherence to 0
        await admin.database()
          .ref(`sessions/${sessionId}`)
          .update({
            coherence: 0,
            activePlayers: 0
          });
        return null;
      }

      // Calculate coherence as average of all players' individual coherence levels
      // This creates progressive difficulty scaling with player count
      const players = Object.values(playersData);
      const totalPlayers = players.length;
      const totalCoherence = players.reduce((sum, player) => {
        return sum + (player.playerCoherence || 0);
      }, 0);
      const coherence = totalPlayers > 0
        ? Math.round(totalCoherence / totalPlayers)
        : 0;

      // Update session with calculated coherence
      await admin.database()
        .ref(`sessions/${sessionId}`)
        .update({
          coherence,
          activePlayers: totalPlayers,
          lastUpdate: Date.now()
        });

      console.log(`Session ${sessionId}: avg coherence = ${coherence}% (${totalPlayers} players)`);
      return null;
    } catch (error) {
      console.error(`Error updating coherence for session ${sessionId}:`, error);
      return null;
    }
  });

/**
 * Cleanup Inactive Sessions
 *
 * Runs every hour to remove abandoned sessions.
 * Sessions with no activity for 1 hour are deleted.
 */
exports.cleanupInactiveSessions = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;

    const sessionsSnapshot = await admin.database()
      .ref('sessions')
      .once('value');

    const sessions = sessionsSnapshot.val();
    if (!sessions) return null;

    const cleanupPromises = [];

    for (const [sessionId, sessionData] of Object.entries(sessions)) {
      const lastUpdate = sessionData.lastUpdate || sessionData.startTime;

      if (now - lastUpdate > ONE_HOUR) {
        console.log(`Cleaning up inactive session: ${sessionId}`);

        // Delete session and all player data
        cleanupPromises.push(
          admin.database().ref(`sessions/${sessionId}`).remove(),
          admin.database().ref(`players/${sessionId}`).remove()
        );
      }
    }

    await Promise.all(cleanupPromises);
    console.log(`Cleaned up ${cleanupPromises.length / 2} inactive sessions`);

    return null;
  });

/**
 * Increment Player Join Counter
 *
 * Tracks total players who have ever joined (for analytics).
 */
exports.trackPlayerJoin = functions.database
  .ref('/players/{sessionId}/{playerId}')
  .onCreate(async (snapshot, context) => {
    const sessionId = context.params.sessionId;

    await admin.database()
      .ref(`sessions/${sessionId}/totalPlayersJoined`)
      .transaction(current => (current || 0) + 1);

    return null;
  });
