import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL) {
    throw new Error('Missing SUPABASE_URL environment variable');
}

if (!SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Missing SUPABASE_PUBLISHABLE_KEY environment variable');
}

if (!SUPABASE_SECRET_KEY) {
    throw new Error('Missing SUPABASE_SECRET_KEY environment variable');
}

/**
 * Public Supabase client (uses publishable/anon key).
 * Respects Row Level Security (RLS) policies.
 * Use for operations that should be scoped to the authenticated user.
 */
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

/**
 * Admin Supabase client (uses service_role/secret key).
 * BYPASSES Row Level Security (RLS).
 * Use ONLY for:
 *   - Server-side admin operations (user management, data migration)
 *   - Background jobs and workers
 *   - Webhook handlers (Stripe, etc.)
 *
 * NEVER expose this client to the frontend.
 */
export const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

console.log(`[SUPABASE] Clients initialized for project: ${SUPABASE_URL}`);
