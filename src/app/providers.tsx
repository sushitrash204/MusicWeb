'use client';

import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from '../context/AuthContext';
import { AlertProvider } from '../context/AlertContext';
import '../services/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
    const { i18n } = useTranslation();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLang = localStorage.getItem('language');
            if (savedLang && savedLang !== i18n.language) {
                i18n.changeLanguage(savedLang);
            }
        }
    }, [i18n]);

    return (
        <Suspense fallback={null}>
            <AuthProvider>
                <AlertProvider>
                    {children}
                </AlertProvider>
            </AuthProvider>
        </Suspense>
    );
}
