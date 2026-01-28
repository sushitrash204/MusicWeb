'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

interface User {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
    email: string[];
    phone: string;
    role: string;
    isArtist?: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('accessToken');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        if (storedToken) {
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const login = async (credentials: any) => {
        const data = await authService.login(credentials);
        // Assuming data contains user info. Token might be in data.token or handled by authService saving to localStorage?
        // Let's assume authService saves 'accessToken' to localStorage or returns it.
        // If authService returns just user, we might need to check how it saves token.
        // Based on logout removing 'accessToken', it must be there.
        // Let's re-read token from localStorage or assume data has it if we change authService?
        // Safest: read from localStorage or data.

        // For now, let's assume successful login sets localStorage 'accessToken' inside authService or we do it here if data has it.
        // Let's assume authService does it. We update state.
        const t = localStorage.getItem('accessToken'); // Try to get it if service set it
        setToken(t || (data.token as string)); // data.token fallback

        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
    };

    const register = async (userData: any) => {
        const data = await authService.register(userData);
        // Same assumption for register
        const t = localStorage.getItem('accessToken');
        setToken(t || (data.token as string));

        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error(error);
        }
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
