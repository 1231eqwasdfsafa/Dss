import { io } from "socket.io-client";

let socket = null;

// Same-origin "/" works when the backend serves the built frontend itself.
// Set VITE_API_URL when the frontend is deployed separately (e.g. Vercel)
// and needs to point at a backend running elsewhere (e.g. Render).
const SOCKET_URL = import.meta.env.VITE_API_URL || "/";

export function connectSocket(token) {
  if (socket) return socket;
  socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket", "polling"] });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
