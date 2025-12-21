import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, LANGUAGES } from '../i18n/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('zh-CN');

    useEffect(() => {
        // 1. Try to get from localStorage
        const savedLimit = localStorage.getItem('geo_vision_language');
        if (savedLimit && (savedLimit in LANGUAGES)) {
            setLanguageState(savedLimit as Language);
            return;
        }

        // 2. Try to detect from browser
        const browserLang = navigator.language.split('-')[0]; // e.g. 'en-US' -> 'en'

        // Check strict full code first (e.g. zh-CN)
        if (navigator.language in LANGUAGES) {
            setLanguageState(navigator.language as Language);
            return;
        }

        // Check short code (e.g. en, es)
        if (browserLang in LANGUAGES) {
            setLanguageState(browserLang as Language);
            return;
        }

        // 3. Fallback to zh-CN (Default)
        setLanguageState('zh-CN');
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('geo_vision_language', lang);
    };

    const t = (key: string, params?: Record<string, string>): string => {
        let text = translations[language][key] || translations['zh-CN'][key] || key;

        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, v);
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
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
