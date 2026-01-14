import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

/**
 * Initialize socket connection
 */
export const initializeSocket = (token: string): Socket => {
    if (socket) {
        return socket;
    }

    socket = io(SOCKET_URL, {
        auth: {
            token,
        },
        autoConnect: true,
    });

    socket.on('connect', () => {
        console.log('Socket.io connected');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket.io disconnected:', reason);
    });

    return socket;
};

/**
 * Get socket instance
 */
export const getSocket = (): Socket | null => {
    return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('Socket.io disconnected manually');
    }
};

/**
 * Emit event to server
 */
export const emitEvent = (event: string, data: any): void => {
    if (socket) {
        socket.emit(event, data);
    } else {
        console.warn('Socket not initialized');
    }
};

/**
 * Listen to event from server
 */
export const onEvent = (event: string, callback: (data: any) => void): void => {
    if (socket) {
        socket.on(event, callback);
    } else {
        console.warn('Socket not initialized');
    }
};

/**
 * Remove event listener
 */
export const offEvent = (event: string, callback?: (data: any) => void): void => {
    if (socket) {
        socket.off(event, callback);
    }
};
