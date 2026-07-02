import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase';

/**
 * TWO-FACTOR AUTHENTICATION SERVICE — Supabase PostgreSQL Migration
 *
 * Replaces MongoDB User model lookups with Supabase auth user_metadata
 * and profiles table. 2FA secrets and backup codes are stored in
 * Supabase Auth user_metadata (encrypted at rest by Supabase).
 *
 * All function signatures and return shapes are preserved.
 */

export const setup2FA = async (userId: string) => {
    // Fetch user profile for email
    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

    if (error || !profile) throw new Error('User not found');

    const secret = speakeasy.generateSecret({
        name: `Premium Purchases (${profile.email})`,
        length: 32,
    });

    // Store 2FA secret in Supabase Auth user_metadata
    await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { two_factor_secret: secret.base32 },
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntry: secret.base32,
    };
};

export const verifyAndEnable2FA = async (userId: string, token: string) => {
    // Fetch 2FA secret from Supabase Auth user_metadata
    const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (error || !user) throw new Error('User not found');

    const twoFactorSecret = user.user_metadata?.two_factor_secret;
    if (!twoFactorSecret) throw new Error('2FA not set up');

    const verified = speakeasy.totp.verify({
        secret: twoFactorSecret,
        encoding: 'base32',
        token,
        window: 1,
    });

    if (!verified) throw new Error('Invalid verification code');

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
        crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    const hashedBackupCodes = backupCodes.map((code) =>
        crypto.createHash('sha256').update(code).digest('hex')
    );

    // Update user_metadata with backup codes
    await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
            ...user.user_metadata,
            backup_codes: hashedBackupCodes,
        },
    });

    // Update profiles table
    await supabaseAdmin
        .from('profiles')
        .update({ two_factor_enabled: true })
        .eq('id', userId);

    return { backupCodes, message: '2FA enabled successfully' };
};

export const verify2FAToken = async (userId: string, token: string) => {
    const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (error || !user) throw new Error('User not found');

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('two_factor_enabled')
        .eq('id', userId)
        .single();

    if (!profile?.two_factor_enabled) throw new Error('2FA not enabled');

    const twoFactorSecret = user.user_metadata?.two_factor_secret;

    const verified = speakeasy.totp.verify({
        secret: twoFactorSecret,
        encoding: 'base32',
        token,
        window: 1,
    });

    if (verified) return true;

    // Check backup codes
    const hashedToken = crypto.createHash('sha256').update(token.toUpperCase()).digest('hex');
    const backupCodes: string[] = user.user_metadata?.backup_codes || [];
    const backupIndex = backupCodes.indexOf(hashedToken);

    if (backupIndex >= 0) {
        // Remove used backup code
        const updatedCodes = [...backupCodes];
        updatedCodes.splice(backupIndex, 1);

        await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: {
                ...user.user_metadata,
                backup_codes: updatedCodes,
            },
        });

        return true;
    }

    return false;
};

export const disable2FA = async (userId: string, token: string) => {
    const isValid = await verify2FAToken(userId, token);
    if (!isValid) throw new Error('Invalid verification code');

    // Clear 2FA data from user_metadata
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);

    await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
            ...user?.user_metadata,
            two_factor_secret: null,
            backup_codes: null,
        },
    });

    // Update profiles table
    await supabaseAdmin
        .from('profiles')
        .update({ two_factor_enabled: false })
        .eq('id', userId);

    return { message: '2FA disabled successfully' };
};
