import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGES, Language } from '../i18n/translations';

export const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative z-50" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all text-xs font-mono"
                title="Change Language"
            >
                <span className="text-base leading-none">{LANGUAGES[language].flag}</span>
                <span className="uppercase tracking-wider font-bold">{language === 'zh-CN' ? 'CN' : language}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 max-h-[60vh] overflow-y-auto custom-scrollbar bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-1 space-y-0.5">
                        {(Object.entries(LANGUAGES) as [Language, { nativeName: string; flag: string }][]).map(([code, info]) => (
                            <button
                                key={code}
                                onClick={() => {
                                    setLanguage(code);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm group ${language === code
                                        ? 'bg-indigo-600/20 text-indigo-300'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className="text-lg leading-none">{info.flag}</span>
                                <span className="font-medium">{info.nativeName}</span>
                                {language === code && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
