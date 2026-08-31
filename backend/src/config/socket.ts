import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './env.js';

let io: Server | null = null;

const allowedOrigins = [
  env.clientUrl,
  'http://127.0.0.1:5173',
  'http://localhost:5173',
];

export const initSocketIO = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, env.jwtSecret) as { id: string };
      if (!decoded?.id) {
        return next(new Error('Authentication error: Invalid token'));
      }

      socket.data.userId = decoded.id;
      next();
    } catch {
      next(new Error('Authentication error: Token verification failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    if (userId) {
      socket.join(`user_${userId}`);
    }
  });

  return io;
};

export const getIO = (): Server | null => io;

export const emitToUser = (userId: string, event: string, payload: unknown): void => {
  if (io) {
    io.to(`user_${userId}`).emit(event, payload);
  }
};