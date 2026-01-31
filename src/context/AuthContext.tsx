'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import tokenManager from '../services/tokenManager';

interface User {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
    email: string[];
    phone: string;
    role: string;
    isArtist?: boolean;
    isPremium?: boolean;
    songsPlayedSinceLastAd?: number;
    lastAdTrigger?: Date | string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (userData: User) => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setTokenState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Synchronize local state with tokenManager
    const setToken = (newToken: string | null) => {
        setTokenState(newToken);
        tokenManager.setToken(newToken);
    };

    useEffect(() => {
        const initializeAuth = async () => {
            // Try silent refresh immediately on load
            try {
                const data = await authService.refreshToken();
                if (data.accessToken) {
                    setToken(data.accessToken);
                    // Refresh user data too
                    const freshUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/profile`, {
                        headers: {
                            'Authorization': `Bearer ${data.accessToken}`
                        }
                    });
                    if (freshUser.ok) {
                        const userData = await freshUser.json();
                        setUser(userData);
                        // Only store avatar for UI consistency, no sensitive data
                        if (userData.avatar) {
                            localStorage.setItem('userAvatar', userData.avatar);
                        }
                    }
                }
            } catch (error) {
                // If refresh fails, clear everything but DON'T force redirect here
                // Guest users should stay on their current page (like Homepage)
                setToken(null);
                setUser(null);
                localStorage.removeItem('userAvatar');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (credentials: any) => {
        const data = await authService.login(credentials);
        if (data.accessToken) {
            setToken(data.accessToken);
        }
        setUser(data);
        if (data.avatar) {
            localStorage.setItem('userAvatar', data.avatar);
        }
        localStorage.removeItem('user'); // Cleanup
    };

    const register = async (userData: any) => {
        const data = await authService.register(userData);
        if (data.accessToken) {
            setToken(data.accessToken);
        }
        setUser(data);
        if (data.avatar) {
            localStorage.setItem('userAvatar', data.avatar);
        }
        localStorage.removeItem('user'); // Cleanup
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error(error);
        }
        setUser(null);
        setToken(null);
        localStorage.removeItem('userAvatar');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    };

    const updateUser = (userData: User) => {
        setUser(userData);
        if (userData.avatar) {
            localStorage.setItem('userAvatar', userData.avatar);
        }
    };

    const refreshUser = async () => {
        try {
            const currentToken = tokenManager.getToken();
            if (!currentToken) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                updateUser(userData);
            }
        } catch (error) {
            console.error('Failed to refresh user', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, refreshUser }}>
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
