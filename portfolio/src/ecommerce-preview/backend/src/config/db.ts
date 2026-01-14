import mongoose from 'mongoose';
import env from './env';

let isConnected = false;

const connectDB = async (retries = 5): Promise<boolean> => {
    while (retries) {
        try {
            const conn = await mongoose.connect(env.DATABASE_URL);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            isConnected = true;
            return true;
        } catch (error) {
            console.error(`Error: ${(error as Error).message}`);
            retries -= 1;
            console.log(`Retries left: ${retries}`);
            if (!retries) {
                console.error('[DB] MongoDB unavailable. Starting in degraded mode.');
                return false;
            }
            // Exponential backoff: 1s, 2s, 4s, 8s, 16s (max 30s)
            const delay = Math.min(1000 * 2 ** (5 - retries), 30000);
            await new Promise((res) => setTimeout(res, delay));
        }
    }
    return false;
};

export const isDbConnected = () => isConnected;

export default connectDB;

