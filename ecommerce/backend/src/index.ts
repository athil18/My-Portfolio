import app from './app';
import connectDB from './config/db';
import env from './config/env';
import http from 'http';
import { initializeSocket } from './sockets';
import { emailWorker } from './workers/email.worker';
import { imageWorker } from './workers/image.worker';
import { seedTestUser } from './scripts/seedTestUser';

let io: any;

const startServer = async () => {
    const dbConnected = await connectDB();
    if (!dbConnected) {
        console.warn('[STARTUP] Running in DEGRADED MODE - database unavailable');
    } else if (env.NODE_ENV === 'development') {
        await seedTestUser();
    }

    const httpServer = http.createServer(app);

    io = initializeSocket(httpServer);

    emailWorker();
    imageWorker();
    console.log('Socket.io initialized');

    httpServer.listen(env.PORT, () => {
        console.log(`Server is running on port ${env.PORT}`);
        if (!dbConnected) {
            console.warn('[STARTUP] ⚠️  Database connection failed - some features may be unavailable');
        }
    });

    const gracefulShutdown = () => {
        console.log('Received kill signal, shutting down gracefully');

        io.close(() => {
            console.log('Socket.io connections closed');
        });

        httpServer.close(() => {
            console.log('Closed out remaining connections');
            process.exit(0);
        });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
};

startServer();
