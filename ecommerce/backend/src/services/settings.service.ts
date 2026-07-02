import { supabaseAdmin } from '../config/supabase';
import { validatePassword } from '../utils/passwordValidator';
import { addEmailJob } from '../queues/email.queue';

/**
 * SETTINGS SERVICE — Supabase PostgreSQL Migration
 */

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
    // 1. Verify current password
    // We do this by attempting to sign in the user.
    // Need user's email first:
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !user) throw new Error('User not found');
    
    // Auth check requires client API but we don't have the user's password in plain text.
    // Supabase admin API doesn't expose a 'checkPassword' method.
    // To verify, we must use signInWithPassword.
    const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword
    });

    if (signInError) throw new Error('Current password is incorrect');

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) throw new Error(passwordCheck.message);

    // 2. Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword
    });

    if (updateError) throw new Error('Failed to update password');

    return { message: 'Password changed successfully' };
};

export const updateNotifications = async (userId: string, settings: any) => {
    // Left as mock as in original Mongoose code
    return { message: 'Notification preferences updated', settings };
};

export const getSessions = async (userId: string) => {
    // Get from new sessions table
    const { data: sessions, error } = await supabaseAdmin
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_activity', { ascending: false });

    if (error) return { sessions: [] };

    return {
        sessions: sessions.map(s => ({
            id: s.id,
            device: s.device,
            location: s.ip_address, // naive map
            lastActive: s.last_activity,
            current: s.is_current
        }))
    };
};

export const exportUserData = async (userId: string) => {
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (!profile) throw new Error('User not found');

    return {
        user: profile,
        exportedAt: new Date(),
    };
};

export const deleteAccount = async (userId: string, password: string) => {
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !user) throw new Error('User not found');
    
    const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: user.email!,
        password: password
    });

    if (signInError) throw new Error('Password is incorrect');

    // Deactivate in profiles table
    await supabaseAdmin
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId);

    // Deactivate in Auth metadata to block logins
    await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { is_active: false }
    });

    return { message: 'Account deleted successfully' };
};

export const resendVerification = async (email: string) => {
    // Supabase has a built-in method to resend verification links
    const { error } = await supabaseAdmin.auth.resend({
        type: 'signup',
        email: email
    });

    if (error) {
        throw new Error(error.message);
    }

    return { message: 'Verification email sent' };
};
