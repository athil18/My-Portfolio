import { supabaseAdmin } from '../config/supabase';

/**
 * ADMIN SERVICE — Supabase PostgreSQL Migration
 */

export const getAllUsers = async (page: number = 1, limit: number = 10) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: users, error, count } = await supabaseAdmin
        .from('profiles')
        .select('id, email, name, role, is_active, created_at, last_login', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw new Error('Failed to fetch users');

    return {
        users: users.map(u => ({ ...u, _id: u.id })),
        pagination: {
            page,
            limit,
            total: count || 0,
            pages: Math.ceil((count || 0) / limit),
        },
    };
};

export const changeUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    const { data: user } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    if (!user) throw new Error('User not found');

    if (user.role === 'admin' && newRole === 'user') {
        const { count: adminCount } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'admin')
            .eq('is_active', true);

        if ((adminCount || 0) <= 1) {
            throw new Error('Cannot demote the last admin');
        }
    }

    const { data: updatedUser, error } = await supabaseAdmin
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select('id, email, name, role')
        .single();

    if (error || !updatedUser) throw new Error('Failed to update role');

    return {
        id: updatedUser.id,
        _id: updatedUser.id, // For backward compatibility
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
    };
};

export const deleteUser = async (userId: string, requestingUserId: string) => {
    if (userId === requestingUserId) {
        throw new Error('Cannot delete your own account');
    }

    const { data: user } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    if (!user) throw new Error('User not found');

    if (user.role === 'admin') {
        const { count: adminCount } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'admin')
            .eq('is_active', true);

        if ((adminCount || 0) <= 1) {
            throw new Error('Cannot delete the last admin');
        }
    }

    const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', userId);

    if (error) throw new Error('Failed to deactivate user');

    // Also disable user in Supabase Auth to prevent logins
    await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { is_active: false }
    });

    return { message: 'User deactivated successfully' };
};
