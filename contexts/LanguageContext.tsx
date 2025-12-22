
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
            // Robust browser detection
            const browserLang = navigator.language.toLowerCase(); // e.g., 'en-US', 'zh-CN', 'es-ES'
            const shortLang = browserLang.split('-')[0]; // e.g., 'en', 'zh', 'es'

            // Direct match check
            let foundLang: Language | undefined;

            // 1. Exact match
            const exactMatches = Object.keys(LANGUAGES).filter(lang => lang.toLowerCase() === browserLang);
            if (exactMatches.length > 0) {
                foundLang = exactMatches[0] as Language;
            }
            // 2. Short match
            else {
                const shortMatches = Object.keys(LANGUAGES).filter(lang => lang.split('-')[0] === shortLang);
                if (shortMatches.length > 0) {
                    // Bias towards main dialet (e.g. pt -> pt, not implicit) but here keys are specific. 
                    // If shortLang is 'ar', we match 'ar' (standard) not 'arz' unless 'arz' is explicitly requested
                    if (Object.keys(LANGUAGES).includes(shortLang)) {
                        foundLang = shortLang as Language;
                    } else {
                        foundLang = shortMatches[0] as Language;
                    }
                }
            }

            // 3. Specific mappings
            if (browserLang === 'zh-hk' || browserLang === 'zh-mo') {
                foundLang = 'zh-TW';
            }

            if (foundLang) {
                setLanguageState(foundLang);
            } else {
                setLanguageState('zh-CN'); // Default Fallback
            }
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
