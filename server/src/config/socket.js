import { Server } from 'socket.io';

let ioInstance = null;

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] New client connected: ${socket.id}`);

    // Join organization room for live tasks & notifications
    socket.on('join:org', (orgId) => {
      if (orgId) {
        socket.join(`org:${orgId}`);
        console.log(`[Socket.IO] ${socket.id} joined org:${orgId}`);
      }
    });

    // Leave organization room
    socket.on('leave:org', (orgId) => {
      if (orgId) {
        socket.leave(`org:${orgId}`);
      }
    });

    // Join chat channel room
    socket.on('join:channel', ({ orgId, channel }) => {
      if (orgId && channel) {
        const room = `channel:${orgId}:${channel}`;
        socket.join(room);
        console.log(`[Socket.IO] ${socket.id} joined ${room}`);
      }
    });

    // Leave chat channel room
    socket.on('leave:channel', ({ orgId, channel }) => {
      if (orgId && channel) {
        socket.leave(`channel:${orgId}:${channel}`);
      }
    });

    // User typing indicator
    socket.on('typing:start', ({ orgId, channel, user }) => {
      socket.to(`channel:${orgId}:${channel}`).emit('typing:status', {
        user,
        isTyping: true,
      });
    });

    socket.on('typing:stop', ({ orgId, channel, user }) => {
      socket.to(`channel:${orgId}:${channel}`).emit('typing:status', {
        user,
        isTyping: false,
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  ioInstance = io;
  return io;
};

export const getIO = () => {
  return ioInstance;
};
