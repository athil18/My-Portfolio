import { supabaseAdmin } from '../config/supabase';

/**
 * USER SERVICE — Supabase PostgreSQL Migration
 * Replaces Mongoose User/UserProfile models with Supabase Client (profiles table).
 */

export const getProfile = async (userId: string) => {
    // In PostgreSQL, User and UserProfile are merged into the `profiles` table.
    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !profile) {
        throw new Error('User not found');
    }

    return {
        user: {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
            emailVerified: profile.email_verified,
            lastLogin: profile.last_login,
            createdAt: profile.created_at,
        },
        profile: {
            ...profile,
            _id: profile.id // mapping for API compat
        },
    };
};

export const updateProfile = async (userId: string, updateData: any) => {
    const { data: currentProfile, error: getError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (getError || !currentProfile) {
        throw new Error('User not found');
    }

    const updates: any = { updated_at: new Date().toISOString() };
    
    if (updateData.name) {
        updates.name = updateData.name;
    }

    if (updateData.profile) {
        if (updateData.profile.phone) updates.phone = updateData.profile.phone;
        if (updateData.profile.location_city) updates.location_city = updateData.profile.location_city;
        if (updateData.profile.location_country) updates.location_country = updateData.profile.location_country;
        if (updateData.profile.date_of_birth) updates.date_of_birth = updateData.profile.date_of_birth;
        if (updateData.profile.bio) updates.bio = updateData.profile.bio;
        if (updateData.profile.social_twitter) updates.social_twitter = updateData.profile.social_twitter;
        if (updateData.profile.social_linkedin) updates.social_linkedin = updateData.profile.social_linkedin;
        if (updateData.profile.social_github) updates.social_github = updateData.profile.social_github;
    }

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (updateError || !updatedProfile) {
        throw new Error('Failed to update profile');
    }

    return {
        user: {
            id: updatedProfile.id,
            email: updatedProfile.email,
            name: updatedProfile.name,
            role: updatedProfile.role,
        },
        profile: updatedProfile,
    };
};

export const updateAvatar = async (userId: string, avatarPath: string) => {
    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .update({ 
            avatar: avatarPath,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

    if (error || !profile) {
        throw new Error('Failed to update avatar');
    }

    return profile;
};
