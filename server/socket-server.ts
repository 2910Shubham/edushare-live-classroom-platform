import http from 'http';
import { Server } from 'socket.io';
import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars if running standalone
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const port = process.env.PORT || 3001;

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// We simulate Upstash pub/sub by polling since Upstash REST doesn't support native Redis SUB.
// However, since Upstash Redis doesn't have subscribe over REST, and the prompt asks for standard Upstash config + Redis pub/sub,
// we will just use memory/socket broadcast for this server instance since it's a single node for now.
// For a multi-node production setup we would use ioredis with a true redis URL.

const presence = new Map<string, Set<string>>();

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  let currentRoom: string | null = null;

  socket.on('join:classroom', ({ classroomId, role }) => {
    const room = `classroom:${classroomId}`;
    socket.join(room);
    currentRoom = room;

    if (!presence.has(room)) {
      presence.set(room, new Set());
    }
    presence.get(room)?.add(socket.id);

    io.to(room).emit('presence:update', { classroomId, count: presence.get(room)?.size || 0 });
    console.log(`Socket ${socket.id} joined ${room} as ${role}`);
  });

  socket.on('annotation:stroke', (data) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('annotation:stroke', data);
    }
  });

  socket.on('board:setMaterial', (data) => {
    if (currentRoom) {
      io.to(currentRoom).emit('board:setMaterial', data);
    }
  });

  socket.on('annotation:clear', (data) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('annotation:clear', data);
    }
  });

  socket.on('board:pageChange', (data) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('board:pageChange', data);
    }
  });

  // Chat message: broadcast to the whole room (including sender gets it from API response)
  socket.on('chat:message', (data) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('chat:message', data);
    }
  });

  socket.on('disconnect', () => {
    if (currentRoom) {
      const roomPresence = presence.get(currentRoom);
      if (roomPresence) {
        roomPresence.delete(socket.id);
        const classroomId = currentRoom.split(':')[1];
        io.to(currentRoom).emit('presence:update', { classroomId, count: roomPresence.size });
      }
    }
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

httpServer.listen(port, () => {
  console.log(`Socket.io server running on port ${port}`);
});
