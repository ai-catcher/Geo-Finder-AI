
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { AppMode, ImageState, AnalysisResult, ChatMessage } from './types';
import { startLocationSession, sendCalibrationMessage, editImageWithAI } from './services/gemini';
import { ImageUpload } from './components/ImageUpload';
import { LocationAnalysis } from './components/LocationAnalysis';
import { ImageMagicEditor } from './components/ImageMagicEditor';
import { LoadingOverlay } from './components/LoadingOverlay';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.IDENTIFY);
  const [imageState, setImageState] = useState<ImageState>({
    original: null,
    edited: null,
    analysis: null,
    chatHistory: []
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  
  const chatRef = useRef<Chat | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 滚动至最新消息
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [imageState.chatHistory]);

  // Handle initial image selection and analysis
  const handleImageSelect = useCallback(async (base64: string) => {
    setImageState({ original: base64, edited: null, analysis: null, chatHistory: [] });
    setError(null);
    setIsProcessing(true);

    try {
      const { chat, imagePart } = startLocationSession(base64);
      chatRef.current = chat;
      
      // 发送初始图片分析请求
      const result = await sendCalibrationMessage(chat, [imagePart, { text: "请开始分析，提供精准校准逻辑并列出 30 个候选地点。" }]);
      
      setImageState(prev => ({ 
        ...prev, 
        analysis: result,
        chatHistory: [{ 
          role: 'model', 
          content: '分析已完成。我已为您列出 30 个初始候选地点。您可以提供更多细节（如：“附近有座红顶房子”或“路牌是某种语言”）来进一步校准。', 
          result 
        }]
      }));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "初始化分析失败，可能是网络或 API 限制。");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Send a calibration message in the chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !chatRef.current || isProcessing) return;

    const userText = inputValue.trim();
    setInputValue('');
    setIsProcessing(true);
    setError(null);
    
    // 立即显示用户消息
    setImageState(prev => ({
      ...prev,
      chatHistory: [...prev.chatHistory, { role: 'user', content: userText }]
    }));

    try {
      const result = await sendCalibrationMessage(chatRef.current, userText);
      setImageState(prev => ({
        ...prev,
        analysis: result,
        chatHistory: [...prev.chatHistory, { 
          role: 'model', 
          content: `收到了，正在基于“${userText}”情报重塑坐标系统...`, 
          result 
        }]
      }));
    } catch (err: any) {
      setError("校准由于数据量过大或网络波动失败，请重试。");
    } finally {
      setIsProcessing(false);
    }
  };

  // Fix: Added missing handleEdit function for image editing
  const handleEdit = useCallback(async (prompt: string) => {
    if (!imageState.original || isProcessing) return;
    setIsProcessing(true);
    setError(null);

    try {
      const editedBase64 = await editImageWithAI(imageState.original, prompt);
      setImageState(prev => ({ ...prev, edited: editedBase64 }));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "创意魔改失败，请尝试其他描述。");
    } finally {
      setIsProcessing(false);
    }
  }, [imageState.original, isProcessing]);

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
              <h1 className="text-xl font-black tracking-tight text-white leading-none">GEOVISION <span className="text-indigo-400">ULTRA</span></h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">30-Points Quantum Calibration</p>
            </div>
          </div>

          <nav className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shadow-inner">
            <button 
              onClick={() => setMode(AppMode.IDENTIFY)}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all duration-300 ${mode === AppMode.IDENTIFY ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              识别与校准
            </button>
            <button 
              onClick={() => setMode(AppMode.EDIT)}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all duration-300 ${mode === AppMode.EDIT ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              创意魔改
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        {!imageState.original ? (
          <div className="animate-in fade-in zoom-in-95 duration-1000 max-w-3xl mx-auto py-20">
            <div className="text-center mb-16 relative">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-indigo-500/20 blur-[100px] rounded-full"></div>
              <h2 className="text-6xl font-black text-white mb-8 leading-[1.1] tracking-tighter">
                一张图，<br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">三十个可能的真相。</span>
              </h2>
              <p className="text-slate-400 text-xl leading-relaxed font-light">
                上传任意地理照片，系统即刻生成 30 个阶梯式候选地址。<br/>
                通过交互对话，我们为您抽丝剥茧，锁定唯一真实。
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
                      更换照片
                    </button>
                  </div>
                  {isProcessing && mode === AppMode.IDENTIFY && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="flex flex-col items-center">
                         <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent animate-spin rounded-full"></div>
                         <span className="text-xs text-indigo-400 mt-4 font-black tracking-widest animate-pulse">解析中...</span>
                      </div>
                    </div>
                  )}
                </div>

                {mode === AppMode.IDENTIFY && (
                  <div className="p-6 border-t border-white/5 bg-black/40">
                    <div className="h-[350px] overflow-y-auto mb-6 space-y-5 px-3 custom-scrollbar">
                      {imageState.chatHistory.length === 0 && !isProcessing && (
                         <div className="h-full flex items-center justify-center text-slate-600 text-sm italic">
                            等待初步分析结果...
                         </div>
                      )}
                      {imageState.chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                          <div className={`max-w-[90%] p-4 rounded-3xl text-sm leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-lg' 
                              : 'bg-white/5 text-slate-300 border border-white/10 rounded-tl-none'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="relative group">
                      <input 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="提供更多环境线索（如植物、天气、周围文字）..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:text-slate-600"
                        disabled={isProcessing}
                      />
                      <button 
                        type="submit"
                        disabled={isProcessing || !inputValue.trim()}
                        className="absolute right-3 top-2.5 p-2.5 text-indigo-400 hover:text-indigo-300 disabled:text-slate-700 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </form>
                  </div>
                )}
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

              {mode === AppMode.IDENTIFY ? (
                imageState.analysis ? (
                  <div className="vibrant-black-card p-8 rounded-3xl border border-white/10 shadow-2xl animate-in fade-in duration-500">
                    <LocationAnalysis analysis={imageState.analysis} />
                  </div>
                ) : (
                  <div className="vibrant-black-card p-24 flex flex-col items-center justify-center rounded-3xl border border-white/10">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent animate-spin rounded-full"></div>
                    </div>
                    <p className="text-slate-500 text-sm mt-8 font-medium tracking-widest uppercase">深度算力接入中</p>
                  </div>
                )
              ) : (
                <div className="vibrant-black-card p-8 rounded-3xl border border-white/10 shadow-2xl">
                  <ImageMagicEditor 
                    originalImage={imageState.original}
                    onEdit={handleEdit}
                    isProcessing={isProcessing}
                    editedImage={imageState.edited}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
