'use client';

import { Suspense } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { AlertProvider } from '../context/AlertContext';

export function Providers({ children }: { children: React.ReactNode }) {
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
