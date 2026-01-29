'use client';

import React, { useEffect, useState } from 'react';
import { useAlert } from '../context/AlertContext';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, NoSymbolIcon } from '@heroicons/react/24/solid';

const GlobalAlert = () => {
    const { alertState, hideAlert } = useAlert();
    const { t } = useTranslation('common');
    const router = useRouter();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (alertState.isOpen) {
            setVisible(true);
        } else {
            const timer = setTimeout(() => setVisible(false), 300); // Wait for animation
            return () => clearTimeout(timer);
        }
    }, [alertState.isOpen]);

    if (!visible && !alertState.isOpen) return null;

    const handleConfirm = () => {
        if (alertState.onConfirm) {
            alertState.onConfirm();
        }
        hideAlert();
    };

    const handleLogin = () => {
        hideAlert();
        router.push('/login');
    };

    const handleClose = () => {
        if (alertState.onCancel) {
            alertState.onCancel();
        }
        hideAlert();
    };

    // Determine Icon based on type
    const renderIcon = () => {
        switch (alertState.type) {
            case 'success':
                return (
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-green-600 dark:text-green-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                );
            case 'error':
                return (
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-red-600 dark:text-red-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            case 'warning':
                return (
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-yellow-600 dark:text-yellow-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                );
            case 'login_required':
                return (
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-blue-600 dark:text-blue-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                    </div>
                );
            case 'info':
            default:
                return (
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-blue-600 dark:text-blue-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                    </div>
                );
        }
    };

    // Helper to translate or return string
    // If the string contains spaces, it's likely not a key, so we return it directly if t() returns the key itself
    // However, best practice is to always pass keys or raw strings.
    // We will try to translate, if the result is the same as key (and key has no spaces), it might be missing translation.
    // But for safety, we assume 'title' and 'message' can be either keys or raw text.
    // If it's a known key (like alert_login_required), it will translate.
    const getText = (keyOrText: string) => {
        // Simple heuristic: if it has spaces, do not translate
        if (keyOrText.includes(' ')) return keyOrText;
        return t(keyOrText, keyOrText); // Fallback to keyOrText if translation missing
    };

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${alertState.isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            ></div>

            {/* Modal Card */}
            <div className={`relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-[#181818] p-6 text-left shadow-xl transition-all duration-300 ${alertState.isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
                }`}>
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mt-2">
                    {renderIcon()}

                    <h3 className="text-2xl font-bold leading-6 text-gray-900 dark:text-white mb-2">
                        {getText(alertState.title)}
                    </h3>

                    <div className="mt-2">
                        <p className="text-lg text-gray-500 dark:text-gray-300">
                            {getText(alertState.message)}
                        </p>
                    </div>

                    <div className="mt-8 flex justify-center gap-3">
                        {alertState.showLoginBtn ? (
                            <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-full bg-green-500 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:w-auto transition-transform hover:scale-105 active:scale-95"
                                onClick={handleLogin}
                            >
                                {t('alert_login_btn', 'Log In')}
                            </button>
                        ) : (
                            alertState.onConfirm && (
                                <button
                                    type="button"
                                    className="inline-flex w-full justify-center rounded-full bg-green-500 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:w-auto transition-transform hover:scale-105 active:scale-95"
                                    onClick={handleConfirm}
                                >
                                    {t('confirm', 'Confirm')}
                                </button>
                            )
                        )}

                        <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-transparent dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-800 sm:w-auto transition-transform hover:scale-105 active:scale-95"
                            onClick={handleClose}
                        >
                            {t('close', 'Close')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalAlert;
