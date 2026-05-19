import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const defaultUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.hostname}:3001` 
      : 'http://localhost:3001';
      
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || defaultUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
