import { pool } from './pg';

/**
 * DATABASE CONNECTION — Supabase PostgreSQL Migration
 *
 * Replaces the legacy MongoDB/Mongoose connection with a PostgreSQL
 * connection test via the `pg` Pool. The Supabase client is initialized
 * statically in `src/config/supabase.ts`, so this function only needs
 * to verify that the database is reachable.
 */

let isConnected = false;

const connectDB = async (retries = 3): Promise<boolean> => {
    while (retries) {
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT NOW()');
            client.release();

            console.log(`[DB] PostgreSQL Connected: ${result.rows[0].now}`);
            isConnected = true;
            return true;
        } catch (error) {
            console.error(`[DB] Connection attempt failed: ${(error as Error).message}`);
            retries -= 1;
            console.log(`[DB] Retries left: ${retries}`);
            if (!retries) {
                console.error('[DB] PostgreSQL unavailable. Starting in degraded mode.');
                return false;
            }
            const delay = Math.min(1000 * 2 ** (3 - retries), 10000);
            await new Promise((res) => setTimeout(res, delay));
        }
    }
    return false;
};

export const isDbConnected = () => isConnected;

export default connectDB;
