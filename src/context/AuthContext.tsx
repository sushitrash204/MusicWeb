'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

interface User {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in (e.g. check local storage for token/user)
        // For simplicity, we just check if token exists and maybe decode user from it or fetch profile
        // Here we'll just check localStorage for 'user' if we saved it, or fetchME
        // But authService.login returns user data. We should persist it.
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials: any) => {
        const data = await authService.login(credentials);
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
    };

    const register = async (userData: any) => {
        const data = await authService.register(userData);
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
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
