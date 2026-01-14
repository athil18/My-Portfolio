import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            // Skip API call in DEV mode and use mock user directly
            if (import.meta.env.DEV) {
                console.log('DEV MODE: Using mock user without API call');
                setUser({
                    id: '507f1f77bcf86cd799439011', // Matches seeded test user
                    email: 'testuser@demo.com',
                    name: 'Mhd Aathil',
                    role: 'admin',
                });
                setLoading(false);
                return;
            }

            try {
                const response = await authService.getCurrentUser();
                setUser(response.data.user);
            } catch (error) {
                // Not authenticated or session expired
                console.error('Auth error:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await authService.login({ email, password });
            const { user } = response.data;
            setUser(user);
        } catch (error) {
            // Bypass login for development if requested
            if (import.meta.env.DEV) {
                console.log('DEV MODE: Bypassing login error, setting mock user');
                setUser({
                    id: 'dev-admin-id',
                    email: email || 'admin@example.com',
                    name: 'System Admin (DEV)',
                    role: 'admin',
                });
                return;
            }
            throw error;
        }
    };

    const logout = () => {
        authService.logout().catch(() => { });
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
