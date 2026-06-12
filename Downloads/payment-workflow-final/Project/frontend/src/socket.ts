import { io } from 'socket.io-client';

// URL of your backend server
const URL = 'http://localhost:4000';

export const socket = io(URL, {
  autoConnect: false, // We will connect manually when the app loads
});