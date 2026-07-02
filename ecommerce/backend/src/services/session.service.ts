import { UAParser } from 'ua-parser-js';
import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase';

/**
 * SESSION SERVICE — Supabase PostgreSQL Migration
 *
 * Replaces MongoDB Session model with PostgreSQL sessions table.
 * All function signatures and return shapes are preserved.
 */

export const createSession = async (
    userId: string,
    refreshToken: string,
    userAgent: string,
    ipAddress: string
) => {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const { data: session, error } = await supabaseAdmin
        .from('sessions')
        .insert({
            user_id: userId,
            token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
            device: result.device.type || 'desktop',
            browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
            os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
            ip_address: ipAddress.replace('::ffff:', ''),
            last_activity: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to create session:', error.message);
        throw new Error('Failed to create session');
    }

    return session;
};

export const getUserSessions = async (userId: string, currentToken?: string) => {
    const { data: sessions, error } = await supabaseAdmin
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_activity', { ascending: false });

    if (error) {
        console.error('Failed to fetch sessions:', error.message);
        return [];
    }

    const currentHash = currentToken
        ? crypto.createHash('sha256').update(currentToken).digest('hex')
        : null;

    return (sessions || []).map((s) => ({
        id: s.id,
        device: s.device,
        browser: s.browser,
        os: s.os,
        ipAddress: s.ip_address,
        lastActivity: s.last_activity,
        isCurrent: currentHash ? s.token === currentHash : false,
        createdAt: s.created_at,
    }));
};

export const deleteSession = async (userId: string, sessionId: string) => {
    const { data, error } = await supabaseAdmin
        .from('sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId)
        .select();

    if (error || !data || data.length === 0) {
        throw new Error('Session not found');
    }

    return { message: 'Session terminated' };
};

export const deleteAllSessions = async (userId: string, exceptToken?: string) => {
    let query = supabaseAdmin
        .from('sessions')
        .delete()
        .eq('user_id', userId);

    if (exceptToken) {
        const currentHash = crypto.createHash('sha256').update(exceptToken).digest('hex');
        query = query.neq('token', currentHash);
    }

    await query;
    return { message: 'All other sessions terminated' };
};

export const updateSessionActivity = async (refreshToken: string) => {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await supabaseAdmin
        .from('sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('token', tokenHash);
};
