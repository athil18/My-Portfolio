import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error('Missing DATABASE_URL environment variable for PostgreSQL connection');
}

/**
 * PostgreSQL Connection Pool for explicit transactions.
 * Use this when you need absolute atomicity (e.g., Order Fulfillment, Stock Decrement)
 * that cannot be easily achieved via single-request Supabase Client calls.
 */
export const pool = new Pool({
    connectionString: DATABASE_URL,
    max: 20, // Max 20 connections in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle client', err);
});
