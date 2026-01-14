import { z } from 'zod';

export const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password is too long'),
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name is too long'),
}).strict();

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
}).strict();

export const verifyEmailSchema = z.object({
    token: z.string().min(1, 'Token is required'),
}).strict();

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
}).strict();

export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password is too long'),
}).strict();
