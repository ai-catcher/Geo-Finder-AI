
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, LANGUAGES } from '../i18n/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('zh-CN');

    useEffect(() => {
        const savedLang = localStorage.getItem('geo_vision_language') as Language;
        if (savedLang && LANGUAGES[savedLang]) {
            setLanguageState(savedLang);
        } else {
            // Simple browser detection detection
            const browserLang = navigator.language;
            if (browserLang.includes('zh-TW') || browserLang.includes('zh-HK')) {
                setLanguageState('zh-TW');
            } else if (browserLang.includes('en')) {
                setLanguageState('en');
            } else if (browserLang.includes('ko')) {
                setLanguageState('ko');
            } else if (browserLang.includes('ja')) {
                setLanguageState('ja');
            }
            // Default stays zh-CN
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('geo_vision_language', lang);
    };

    const t = (key: string, params?: Record<string, string>): string => {
        let text = translations[language]?.[key] || translations['zh-CN']?.[key] || key;

        if (params) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                text = text.replace(`{${paramKey}}`, paramValue);
            });
        }

        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
