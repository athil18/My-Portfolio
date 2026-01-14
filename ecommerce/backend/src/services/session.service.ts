import { UAParser } from 'ua-parser-js';
import crypto from 'crypto';
import Session from '../models/session.model';

export const createSession = async (
    userId: string,
    refreshToken: string,
    userAgent: string,
    ipAddress: string
) => {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const session = await Session.create({
        user: userId,
        token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
        device: result.device.type || 'desktop',
        browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
        os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
        ipAddress: ipAddress.replace('::ffff:', ''),
        lastActivity: new Date(),
    });

    return session;
};

export const getUserSessions = async (userId: string, currentToken?: string) => {
    const sessions = await Session.find({ user: userId }).sort({ lastActivity: -1 });

    const currentHash = currentToken
        ? crypto.createHash('sha256').update(currentToken).digest('hex')
        : null;

    return sessions.map((s) => ({
        id: s._id,
        device: s.device,
        browser: s.browser,
        os: s.os,
        ipAddress: s.ipAddress,
        lastActivity: s.lastActivity,
        isCurrent: currentHash ? s.token === currentHash : false,
        createdAt: s.createdAt,
    }));
};

export const deleteSession = async (userId: string, sessionId: string) => {
    const result = await Session.deleteOne({ _id: sessionId, user: userId });
    if (result.deletedCount === 0) throw new Error('Session not found');
    return { message: 'Session terminated' };
};

export const deleteAllSessions = async (userId: string, exceptToken?: string) => {
    const query: any = { user: userId };
    if (exceptToken) {
        const currentHash = crypto.createHash('sha256').update(exceptToken).digest('hex');
        query.token = { $ne: currentHash };
    }
    await Session.deleteMany(query);
    return { message: 'All other sessions terminated' };
};

export const updateSessionActivity = async (refreshToken: string) => {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await Session.updateOne({ token: tokenHash }, { lastActivity: new Date() });
};
