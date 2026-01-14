export const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least 1 uppercase letter' };
    }
    if (!/\d/.test(password)) {
        return { valid: false, message: 'Password must contain at least 1 number' };
    }
    if (!/[@$!%*?&]/.test(password)) {
        return { valid: false, message: 'Password must contain at least 1 special character (@$!%*?&)' };
    }
    return { valid: true, message: 'Password is strong!' };
};
