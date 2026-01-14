import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUserProfile extends Document {
    user: Types.ObjectId;
    avatar?: string;
    phone?: string;
    location?: {
        city?: string;
        country?: string;
    };
    dateOfBirth?: Date;
    bio?: string;
    socialLinks?: {
        twitter?: string;
        linkedin?: string;
        github?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const userProfileSchema = new Schema<IUserProfile>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        avatar: {
            type: String,
        },
        phone: {
            type: String,
            match: [/^\+?[\d\s\-()]+$/, 'Please provide a valid phone number'],
        },
        location: {
            city: String,
            country: String,
        },
        dateOfBirth: {
            type: Date,
            validate: {
                validator: function (v: Date) {
                    const age = Math.floor((Date.now() - v.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                    return age >= 13;
                },
                message: 'You must be at least 13 years old',
            },
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot exceed 500 characters'],
        },
        socialLinks: {
            twitter: {
                type: String,
                match: [/^https?:\/\/(www\.)?twitter\.com\/.*$/, 'Please provide a valid Twitter URL'],
            },
            linkedin: {
                type: String,
                match: [/^https?:\/\/(www\.)?linkedin\.com\/.*$/, 'Please provide a valid LinkedIn URL'],
            },
            github: {
                type: String,
                match: [/^https?:\/\/(www\.)?github\.com\/.*$/, 'Please provide a valid GitHub URL'],
            },
        },
    },
    {
        timestamps: true,
    }
);

const UserProfile = mongoose.model<IUserProfile>('UserProfile', userProfileSchema);

export default UserProfile;
