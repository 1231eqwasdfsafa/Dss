// In-memory "currently listening" presence, mirroring the online-users map in
// socket.js. Not persisted — it's ephemeral live state, cleared on disconnect,
// same lifecycle as typing indicators or online status.
const activityByUser = new Map(); // userId -> { track, artist, albumArt, trackUrl, startedAt }

export function setActivity(userId, activity) {
  activityByUser.set(userId, activity);
}

export function clearActivity(userId) {
  activityByUser.delete(userId);
}

export function getActivity(userId) {
  return activityByUser.get(userId) || null;
}

export function getAllActivity() {
  return Object.fromEntries(activityByUser);
}
