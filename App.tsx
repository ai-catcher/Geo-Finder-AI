
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { ImageState, AnalysisResult, ChatMessage, GeminiModel, AppSettings } from './types';
import { startLocationSession, sendCalibrationMessage } from './services/gemini';
import { ImageUpload } from './components/ImageUpload';
import { LocationAnalysis } from './components/LocationAnalysis';
import { LoadingOverlay } from './components/LoadingOverlay';

import { SettingsModal } from './components/SettingsModal';
import { useLanguage } from './contexts/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';

const App: React.FC = () => {
  const { t, language } = useLanguage();
  const [imageState, setImageState] = useState<ImageState>({
    original: null,
    edited: null,
    analysis: null,
    chatHistory: []
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingChatImage, setPendingChatImage] = useState<string | null>(null);

  // API Key & Model State
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: '',
    model: GeminiModel.GEMINI_3_1_PRO
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const chatRef = useRef<Chat | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Settings from localStorage
  useEffect(() => {
    const storedApiKey = localStorage.getItem('geo_vision_api_key');
    const storedModel = localStorage.getItem('geo_vision_model') as GeminiModel;

    setSettings({
      apiKey: storedApiKey || '',
      model: storedModel || GeminiModel.GEMINI_3_1_PRO
    });
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    localStorage.setItem('geo_vision_api_key', newSettings.apiKey);
    localStorage.setItem('geo_vision_model', newSettings.model);
    setSettings(newSettings);
    setShowSettingsModal(false);
  };

  // 滚动至最新消息
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [imageState.chatHistory]);

  // Handle initial image selection and analysis
  const handleImageSelect = useCallback(async (base64: string) => {
    if (!settings.apiKey) {
      setPendingImage(base64);
      setShowSettingsModal(true);
      return;
    }

    setImageState({ original: base64, edited: null, analysis: null, chatHistory: [] });
    setError(null);
    setIsProcessing(true);

    try {
      const { chat, imagePart } = startLocationSession(base64, settings.apiKey, settings.model, language);
      chatRef.current = chat;

      // 发送初始图片分析请求
      // 创建分析请求
      // 使用英文提示词以获得更好效果，但要求模型用对应语言回答
      //const langPrompt = settings.language === 'en' ? 'English' : 'Chinese'; // Basic mapping, but t() handles prompt text
      // Better: pass the instruction instructions via specific method or just standard prompt

      // Map language code to human-readable name for the prompt text
      const langMap: Record<string, string> = {
        'zh-CN': 'Simplified Chinese', 'zh-TW': 'Traditional Chinese', 'en': 'English',
        'ko': 'Korean', 'ja': 'Japanese', 'hi': 'Hindi', 'es': 'Spanish', 'ar': 'Arabic',
        'fr': 'French', 'bn': 'Bengali', 'pt': 'Portuguese', 'ru': 'Russian', 'id': 'Indonesian',
        'ur': 'Urdu', 'de': 'German', 'pcm': 'Nigerian Pidgin', 'arz': 'Egyptian Arabic',
        'mr': 'Marathi', 'vi': 'Vietnamese', 'te': 'Telugu', 'tr': 'Turkish',
        'pnb': 'Western Punjabi', 'sw': 'Swahili', 'tl': 'Tagalog', 'ta': 'Tamil',
        'fa': 'Persian', 'th': 'Thai', 'jv': 'Javanese'
      };
      const langName = langMap[language] || 'Simplified Chinese';

      const result = await sendCalibrationMessage(chat, [imagePart, { text: t('initial_prompt', { lang: langName }) }]);

      setImageState(prev => ({
        ...prev,
        analysis: result,
        chatHistory: [{
          role: 'model',
          content: t('initial_analysis_done'),
          result
        }]
      }));
    } catch (err: any) {
      console.error(err);
      setError(err.message || t('error_init'));
    } finally {
      setIsProcessing(false);
    }
  }, [settings]);

  // Automatically trigger analysis if we have a pending image and now a valid API key
  useEffect(() => {
    if (settings.apiKey && pendingImage) {
      handleImageSelect(pendingImage);
      setPendingImage(null);
    }
  }, [settings.apiKey, pendingImage, handleImageSelect]);

  // Send a calibration message in the chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && !pendingChatImage) || !chatRef.current || isProcessing) return;

    const userText = inputValue.trim();
    setInputValue('');
    setIsProcessing(true);
    setError(null);

    const imageToSend = pendingChatImage;
    setPendingChatImage(null);

    const finalUserText = userText || t('analyze_new_image');

    // 立即显示用户消息
    setImageState(prev => ({
      ...prev,
      chatHistory: [...prev.chatHistory, {
        role: 'user',
        content: finalUserText,
        image: imageToSend || undefined
      }]
    }));

    try {
      let messagePayload: any = finalUserText;

      if (imageToSend) {
        const imagePart = {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageToSend.split(',')[1],
          },
        };
        messagePayload = [imagePart, { text: messagePayload }];
      }

      const result = await sendCalibrationMessage(chatRef.current, messagePayload);
      setImageState(prev => ({
        ...prev,
        analysis: result,
        chatHistory: [...prev.chatHistory, {
          role: 'model',
          content: result.explanation || t('model_thinking', { text: finalUserText }),
          result
        }]
      }));
    } catch (err: any) {
      setError(t('error_calibration'));
    } finally {
      setIsProcessing(false);
    }
  };


  // Reset the app state
  const reset = () => {
    setImageState({ original: null, edited: null, analysis: null, chatHistory: [] });
    setError(null);
    chatRef.current = null;
  };

  return (
    <div className="pb-20 relative">
      <header className="border-b border-white/10 sticky top-0 z-40 px-6 py-4 backdrop-blur-2xl bg-black/40 shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={reset}>
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 via-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] group-hover:scale-110 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white leading-none">{t('app_title')}</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{t('subtitle')}</p>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <a
              href="https://x.com/thanksutrump"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300"
              title="Follow on X"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://github.com/ai-catcher/Geo-Finder-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300"
              title="View on GitHub"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <button
              onClick={() => setShowSettingsModal(true)}
              className={`p-3 rounded-2xl border transition-all duration-300 ${settings.apiKey ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'} `}
              title="API Key & Model Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <div className="ml-2 pl-2 border-l border-white/10">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        {!imageState.original ? (
          <div className="animate-in fade-in zoom-in-95 duration-1000 max-w-3xl mx-auto py-20">
            <div className="text-center mb-16 relative">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-indigo-500/20 blur-[100px] rounded-full"></div>
              <h2 className="text-6xl font-black text-white mb-8 leading-[1.1] tracking-tighter">
                {t('hero_title_1')}<br /><span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">{t('hero_title_2')}</span>
              </h2>
              <p className="text-slate-400 text-xl leading-relaxed font-light">
                {t('hero_desc')}
              </p>
            </div>
            <div className="vibrant-black-card p-2 rounded-[2.5rem]">
              <ImageUpload onImageSelect={handleImageSelect} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* 左侧：情报工作区 */}
            <div className="lg:col-span-7 space-y-8">
              <div className="vibrant-black-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                <div className="aspect-video relative group overflow-hidden">
                  <img src={imageState.original} alt="Target" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <button onClick={reset} className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-xl border border-white/20 transition-all active:scale-95">
                      {t('change_photo')}
                    </button>
                  </div>
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent animate-spin rounded-full"></div>
                        <span className="text-xs text-indigo-400 mt-4 font-black tracking-widest animate-pulse">{t('analyzing')}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-white/5 bg-black/40">
                  <div className="h-[350px] overflow-y-auto mb-6 space-y-5 px-3 custom-scrollbar">
                    {imageState.chatHistory.length === 0 && !isProcessing && (
                      <div className="h-full flex items-center justify-center text-slate-600 text-sm italic">
                        {t('waiting_analysis')}
                      </div>
                    )}
                    {imageState.chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[90%] p-4 rounded-3xl text-sm leading-relaxed flex flex-col ${msg.role === 'user'
                          ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-lg'
                          : 'bg-white/5 text-slate-300 border border-white/10 rounded-tl-none'
                          }`}>
                          {msg.image && (
                            <img src={msg.image} className="w-full max-w-[200px] h-auto object-cover rounded-xl mb-3 border border-white/10" alt="Attached" />
                          )}
                          <span>{msg.content}</span>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="relative group flex flex-col gap-2">
                    {pendingChatImage && (
                      <div className="relative inline-block w-20 h-20 mb-1 ml-2">
                        <img src={pendingChatImage} className="w-full h-full object-cover rounded-xl border border-white/20" alt="Pending" />
                        <button type="button" onClick={() => setPendingChatImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <div className="relative">
                      <input
                        type="file"
                        ref={chatFileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => setPendingChatImage(event.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => chatFileInputRef.current?.click()}
                        title={t('attach_image')}
                        className="absolute left-3 top-2.5 p-2.5 text-slate-400 hover:text-white transition-colors z-10"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={t('input_placeholder')}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-14 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:text-slate-600"
                        disabled={isProcessing}
                      />
                      <button
                        type="submit"
                        disabled={isProcessing || (!inputValue.trim() && !pendingChatImage)}
                        className="absolute right-3 top-2.5 p-2.5 text-indigo-400 hover:text-indigo-300 disabled:text-slate-700 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* 右侧：分析面板 */}
            <div className="lg:col-span-5 sticky top-28">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-xs mb-8 flex items-start gap-4 backdrop-blur-md animate-in fade-in slide-in-from-right-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {imageState.analysis ? (
                <div className="vibrant-black-card p-8 rounded-3xl border border-white/10 shadow-2xl animate-in fade-in duration-500">
                  <LocationAnalysis analysis={imageState.analysis} />
                </div>
              ) : (
                <div className="vibrant-black-card p-24 flex flex-col items-center justify-center rounded-3xl border border-white/10">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent animate-spin rounded-full"></div>
                  </div>
                  <p className="text-slate-500 text-sm mt-8 font-medium tracking-widest uppercase">{t('deep_compute')}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <SettingsModal
        isOpen={showSettingsModal}
        onSave={handleSaveSettings}
        onClose={() => setShowSettingsModal(false)}
        initialSettings={settings}
      />
    </div>
  );
};

export default App;
