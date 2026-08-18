import { io } from 'socket.io-client';

// URL of your backend server
const URL = 'http://localhost:4000';

// Create a socket that prefers websocket but falls back to polling if needed.
export const socket = io(URL, {
  autoConnect: false, // We will connect manually when the app loads
  // Prefer polling first in dev so the handshake succeeds reliably,
  // then Socket.IO will upgrade to WebSocket when possible.
  transports: ['polling', 'websocket'],
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  withCredentials: true,
  path: '/socket.io',
});

// Helpful debug logging for connection issues
socket.on('connect_error', (err) => {
  console.warn('Socket connect_error', err);
});
socket.on('connect_timeout', (timeout) => {
  console.warn('Socket connect_timeout', timeout);
});
socket.on('reconnect_attempt', (attempt) => {
  console.info('Socket reconnect attempt', attempt);
});
socket.on('disconnect', (reason) => {
  console.info('Socket disconnected:', reason);
});