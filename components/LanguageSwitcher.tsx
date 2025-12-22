
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGES, Language } from '../i18n/translations';

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (lang: Language) => {
        setLanguage(lang);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-xl hover:bg-white/10 transition-all duration-300"
                title={LANGUAGES[language].nativeName}
            >
                {LANGUAGES[language].flag}
            </button>

            {isOpen && (
                <div className="absolute top-12 right-0 w-[90vw] md:w-[700px] lg:w-[900px] max-w-[95vw] bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 max-h-[80vh] overflow-y-auto custom-scrollbar">
                        {(Object.entries(LANGUAGES) as [Language, { nativeName: string; flag: string }][]).map(([code, { nativeName, flag }]) => (
                            <button
                                key={code}
                                onClick={() => handleSelect(code)}
                                className={`w-full text-left px-3 py-2 flex items-center gap-2 rounded-lg hover:bg-white/10 transition-colors ${language === code ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-300'
                                    }`}
                            >
                                <span className="text-lg flex-shrink-0">{flag}</span>
                                <span className="text-xs font-medium truncate">{nativeName}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
