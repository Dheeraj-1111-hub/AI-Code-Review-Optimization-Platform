import { io } from 'socket.io-client';

// The Node.js backend URL
const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Socket.io must connect to the root domain, not the /api route
const SOCKET_URL = apiURL.replace(/\/api(\/v1)?\/?$/, '');

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});
