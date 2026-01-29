'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type AlertType = 'info' | 'success' | 'warning' | 'error' | 'login_required';

interface AlertState {
    isOpen: boolean;
    title: string;
    message: string;
    type: AlertType;
    onConfirm?: () => void;
    onCancel?: () => void;
    showLoginBtn?: boolean;
}

interface AlertContextType {
    alertState: AlertState;
    showAlert: (params: {
        title: string;
        message: string;
        type?: AlertType;
        onConfirm?: () => void;
        onCancel?: () => void;
        showLoginBtn?: boolean;
    }) => void;
    hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alertState, setAlertState] = useState<AlertState>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
    });

    const showAlert = useCallback(
        ({
            title,
            message,
            type = 'info',
            onConfirm,
            onCancel,
            showLoginBtn = false,
        }: {
            title: string;
            message: string;
            type?: AlertType;
            onConfirm?: () => void;
            onCancel?: () => void;
            showLoginBtn?: boolean;
        }) => {
            setAlertState({
                isOpen: true,
                title,
                message,
                type,
                onConfirm,
                onCancel,
                showLoginBtn: type === 'login_required' || showLoginBtn,
            });
        },
        []
    );

    const hideAlert = useCallback(() => {
        setAlertState((prev) => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <AlertContext.Provider value={{ alertState, showAlert, hideAlert }}>
            {children}
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};
