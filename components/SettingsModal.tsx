
import React, { useState, useEffect } from 'react';
import { GeminiModel, AppSettings } from '../types';

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md relative overflow-hidden rounded-3xl bg-[#0a0a0f] border border-white/10 shadow-2xl">
                {/* Decorative elements */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/20 blur-[60px] rounded-full"></div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 blur-[60px] rounded-full"></div>

                <div className="relative p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-white tracking-tight">设置</h2>
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

                        {/* Model Selection Section */}
                        <div className="space-y-2">
                            <label htmlFor="model" className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                                AI 模型
                            </label>
                            <div className="relative">
                                <select
                                    id="model"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value as GeminiModel)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
                                >
                                    <option value={GeminiModel.GEMINI_2_0_FLASH_EXP} className="bg-[#0a0a0f]">Gemini 2.0 Flash Exp (推荐)</option>
                                    <option value={GeminiModel.GEMINI_1_5_PRO} className="bg-[#0a0a0f]">Gemini 1.5 Pro</option>
                                    <option value={GeminiModel.GEMINI_1_5_FLASH} className="bg-[#0a0a0f]">Gemini 1.5 Flash</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 px-1">
                                2.0 Flash Exp 视觉能力最强；1.5 Pro 推理更深；1.5 Flash 速度最快。
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={!isValid}
                            className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 ${isValid
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02]'
                                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
                                }`}
                        >
                            保存设置
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors border-b border-indigo-400/30 hover:border-indigo-300"
                        >
                            获取 Gemini API Key
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
