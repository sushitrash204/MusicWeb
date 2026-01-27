'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
    const { t, i18n } = useTranslation('common');
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const languages = [
        { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' },
        { code: 'ko', name: '한국어', flag: '🇰🇷' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
    ];

    if (!mounted) return null;

    return (
        <div className="container mx-auto p-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 text-foreground">{t('settings')}</h1>

            <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
                    <LanguageIcon className="w-6 h-6 text-primary" />
                    {t('language')}
                </h2>

                <div className="grid gap-3">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${i18n.language === lang.code
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-card-border hover:bg-dropdown-hover text-foreground'
                                }`}
                        >
                            <span className="flex items-center gap-3">
                                <span className="text-2xl">{lang.flag}</span>
                                <span className="font-medium">{lang.name}</span>
                            </span>
                            {i18n.language === lang.code && (
                                <span className="w-3 h-3 rounded-full bg-primary"></span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
