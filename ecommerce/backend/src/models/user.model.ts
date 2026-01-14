import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    role: 'user' | 'admin';
    isActive: boolean;
    emailVerified: boolean;
    verificationToken?: string;
    verificationTokenExpiry?: Date;
    resetPasswordToken?: string;
    resetPasswordExpiry?: Date;
    twoFactorSecret?: string;
    twoFactorEnabled: boolean;
    backupCodes?: string[];
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false,
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: { type: String, select: false },
        verificationTokenExpiry: { type: Date, select: false },
        resetPasswordToken: { type: String, select: false },
        resetPasswordExpiry: { type: Date, select: false },
        twoFactorSecret: { type: String, select: false },
        twoFactorEnabled: { type: Boolean, default: false },
        backupCodes: { type: [String], select: false },
        lastLogin: { type: Date },
    },
    { timestamps: true }
);

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
