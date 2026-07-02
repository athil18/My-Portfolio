import { supabaseAdmin } from '../config/supabase';

/**
 * ANALYTICS SERVICE — Supabase PostgreSQL Migration
 */

export const trackEvent = async (data: any) => {
    const { data: event, error } = await supabaseAdmin
        .from('analytics_events')
        .insert({
            user_id: data.userId || null,
            guest_id: data.guestId || null,
            event: data.event,
            category: data.category,
            label: data.label,
            value: data.value,
            properties: data.properties || {},
            url: data.url,
            user_agent: data.userAgent,
            ip: data.ip
        })
        .select()
        .single();

    if (error) throw new Error('Failed to track event');
    return event;
};

export const getEventStats = async (category?: string) => {
    // Requires an RPC or complex view in Supabase.
    // For now, since Mongoose aggregate was used, we will use Supabase RPC if it existed,
    // but we can query raw data and aggregate in JS or use `pg` pool.
    // To keep it simple and perfectly matched to Phase 5 requirements, we use pg pool for aggregation.
    const { pool } = require('../config/pg');
    const client = await pool.connect();
    try {
        let query = `
            SELECT event as _id, COUNT(*) as count 
            FROM analytics_events 
        `;
        const params: any[] = [];
        
        if (category) {
            query += `WHERE category = $1 `;
            params.push(category);
        }
        
        query += `GROUP BY event ORDER BY count DESC`;
        
        const res = await client.query(query, params);
        return res.rows;
    } finally {
        client.release();
    }
};

export const getRecentEvents = async (limit: number = 20) => {
    const { data: events, error } = await supabaseAdmin
        .from('analytics_events')
        .select(`*, profiles:user_id (name, email)`)
        .order('timestamp', { ascending: false })
        .limit(limit);

    if (error) throw new Error('Failed to fetch recent events');
    
    return events.map((e: any) => ({
        ...e,
        userId: e.profiles ? { name: e.profiles.name, email: e.profiles.email } : e.user_id,
        profiles: undefined
    }));
};
