import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import User from '../models/user.model';

export const setup2FA = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const secret = speakeasy.generateSecret({
        name: `Premium Purchases (${user.email})`,
        length: 32,
    });

    // Save secret temporarily (not enabled yet)
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntry: secret.base32,
    };
};

export const verifyAndEnable2FA = async (userId: string, token: string) => {
    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user || !user.twoFactorSecret) throw new Error('2FA not set up');

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 1,
    });

    if (!verified) throw new Error('Invalid verification code');

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
        crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    user.twoFactorEnabled = true;
    user.backupCodes = backupCodes.map((code) =>
        crypto.createHash('sha256').update(code).digest('hex')
    );
    await user.save();

    return { backupCodes, message: '2FA enabled successfully' };
};

export const verify2FAToken = async (userId: string, token: string) => {
    const user = await User.findById(userId).select('+twoFactorSecret +backupCodes');
    if (!user || !user.twoFactorEnabled) throw new Error('2FA not enabled');

    // Try TOTP first
    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret!,
        encoding: 'base32',
        token,
        window: 1,
    });

    if (verified) return true;

    // Try backup code
    const hashedToken = crypto.createHash('sha256').update(token.toUpperCase()).digest('hex');
    const backupIndex = user.backupCodes?.indexOf(hashedToken);

    if (backupIndex !== undefined && backupIndex >= 0) {
        user.backupCodes!.splice(backupIndex, 1);
        await user.save();
        return true;
    }

    return false;
};

export const disable2FA = async (userId: string, token: string) => {
    const isValid = await verify2FAToken(userId, token);
    if (!isValid) throw new Error('Invalid verification code');

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.backupCodes = undefined;
    await user.save();

    return { message: '2FA disabled successfully' };
};
