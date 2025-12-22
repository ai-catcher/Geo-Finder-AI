
import React, { useState, useEffect } from 'react';
import { GeminiModel, AppSettings } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsModalProps {
    isOpen: boolean;
    onSave: (settings: AppSettings) => void;
    onClose: () => void;
    initialSettings: AppSettings;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onSave, onClose, initialSettings }) => {
    const [apiKey, setApiKey] = useState(initialSettings.apiKey);
    const [model, setModel] = useState<GeminiModel>(initialSettings.model);
    const [isValid, setIsValid] = useState(false);
    const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        setApiKey(initialSettings.apiKey);
        setModel(initialSettings.model);
    }, [initialSettings, isOpen]);

    useEffect(() => {
        setIsValid(apiKey.trim().length > 10);
    }, [apiKey]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isValid) {
            onSave({ apiKey: apiKey.trim(), model });
        }
    };

    const handleApiKeyClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowApiKeyWarning(true);
    };

    const confirmApiKeyRedirect = () => {
        window.open("https://aistudio.google.com/app/apikey", "_blank");
        setShowApiKeyWarning(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            {/* API Key Warning Modal Overlay */}
            {showApiKeyWarning && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-[#1a1a20] border border-red-500/30 p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4">
                        <div className="flex items-center gap-3 text-red-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h3 className="font-bold text-lg">{t('api_warning_title')}</h3>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            {t('api_warning_msg')}
                        </p>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowApiKeyWarning(false)}
                                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-sm font-medium transition-colors"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={confirmApiKeyRedirect}
                                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all"
                            >
                                {t('go_get')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-md relative overflow-hidden rounded-3xl bg-[#0a0a0f] border border-white/10 shadow-2xl">
                {/* Decorative elements */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/20 blur-[60px] rounded-full"></div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 blur-[60px] rounded-full"></div>

                <div className="relative p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-white tracking-tight">{t('settings_tooltip')}</h2>
                        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* API Key Section */}
                        <div className="space-y-2">
                            <label htmlFor="apiKey" className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                                Gemini API Key
                            </label>
                            <input
                                id="apiKey"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-sm"
                            />
                        </div>

                        {/* Model Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                                {t('ai_model')}
                            </label>
                            <div className="relative">
                                <select
                                    value={model}
                                    onChange={(e) => setModel(e.target.value as GeminiModel)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                >
                                    <option value={GeminiModel.GEMINI_3_0_FLASH} className="bg-[#0a0a0f]">Gemini 3.0 Flash (推荐)</option>
                                    <option value={GeminiModel.GEMINI_3_0_PRO} className="bg-[#0a0a0f]">Gemini 3.0 Pro</option>
                                    <option value={GeminiModel.GEMINI_2_0_FLASH_EXP} className="bg-[#0a0a0f]">Gemini 2.0 Flash Exp</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!isValid}
                            className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 ${isValid
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02]'
                                : 'bg-white/5 text-slate-500 cursor-not-allowed'
                                }`}
                        >
                            {t('identify_btn')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={handleApiKeyClick}
                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors border-b border-indigo-400/30 hover:border-indigo-300 bg-transparent cursor-pointer"
                        >
                            {t('get_api_key_btn')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
