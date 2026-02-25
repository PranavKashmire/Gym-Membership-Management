import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';
import { authApi } from '../lib/api';

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string, role: 'admin' | 'member') => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On mount: restore session from localStorage token
    useEffect(() => {
        const storedUser = localStorage.getItem('fitcore_user');
        const token = localStorage.getItem('fitcore_token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (
        email: string,
        password: string,
        _role: 'admin' | 'member'
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data } = await authApi.login(email, password);
            const { token, refresh_token, user: userData } = data;

            // Persist tokens
            localStorage.setItem('fitcore_token', token);
            localStorage.setItem('fitcore_refresh_token', refresh_token);

            const authUser: AuthUser = {
                id: userData.id,
                email: userData.email,
                role: userData.role as UserRole,
                name: userData.name || email.split('@')[0],
                branch_id: userData.branch_id,
                member_id: userData.member_id,
            };
            setUser(authUser);
            localStorage.setItem('fitcore_user', JSON.stringify(authUser));
            return { success: true };
        } catch (err: any) {
            const message = err?.response?.data?.error || 'Login failed. Check your credentials.';
            return { success: false, error: message };
        }
    }, []);

    const logout = useCallback(async () => {
        try { await authApi.logout(); } catch { /* ignore */ }
        setUser(null);
        localStorage.removeItem('fitcore_token');
        localStorage.removeItem('fitcore_refresh_token');
        localStorage.removeItem('fitcore_user');
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export const isAdminRole = (role: UserRole): boolean =>
    ['owner', 'admin', 'front_desk'].includes(role);
