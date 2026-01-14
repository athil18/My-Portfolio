import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import env from '../config/env';

let io: Server;

/**
 * Initialize Socket.io server
 */
export const initializeSocket = (httpServer: HTTPServer): Server => {
    io = new Server(httpServer, {
        cors: {
            origin: env.FRONTEND_URL,
            credentials: true,
        },
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
            (socket as any).userId = decoded.id;
            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    // Connection handling
    io.on('connection', (socket) => {
        const userId = (socket as any).userId;
        console.log(`User connected: ${userId}`);

        // Join user's personal room
        socket.join(userId);

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userId}`);
        });
    });

    return io;
};

/**
 * Get Socket.io instance
 */
export const getIO = (): Server => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

/**
 * Emit event to specific user
 */
export const emitToUser = (userId: string, event: string, data: any) => {
    if (io) {
        io.to(userId).emit(event, data);
    }
};

/**
 * Emit event to all connected clients
 */
export const emitToAll = (event: string, data: any) => {
    if (io) {
        io.emit(event, data);
    }
};
