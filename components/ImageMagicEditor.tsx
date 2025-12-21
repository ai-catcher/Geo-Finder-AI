
import React, { useState } from 'react';

interface ImageMagicEditorProps {
  originalImage: string;
  onEdit: (prompt: string) => Promise<void>;
  isProcessing: boolean;
  editedImage: string | null;
}

export const ImageMagicEditor: React.FC<ImageMagicEditorProps> = ({ 
  originalImage, 
  onEdit, 
  isProcessing,
  editedImage 
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onEdit(prompt);
    }
  };

  const suggestions = [
    "添加 70 年代复古滤镜",
    "将天空变成灿烂星空",
    "在远处添加一群飞鸟",
    "让它看起来像一个雨天",
    "转换为高对比度黑白艺术照",
    "让画面充满冬天的雪景"
  ];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="描述你想要如何编辑这张图片（例如：把背景换成森林）..."
            className="w-full p-4 pr-12 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] resize-none text-slate-800 placeholder:text-slate-400"
            disabled={isProcessing}
          />
          <button 
            type="submit"
            disabled={isProcessing || !prompt.trim()}
            className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl shadow-lg disabled:bg-slate-300 disabled:shadow-none transition-all active:scale-95"
          >
            {isProcessing ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPrompt(s)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>
      </form>

      {editedImage && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-slate-800">编辑结果</h4>
            <a 
              href={editedImage} 
              download="edited-image.png"
              className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              保存图片
            </a>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl bg-slate-900 flex items-center justify-center min-h-[300px]">
            <img src={editedImage} alt="Edited Result" className="max-w-full max-h-[600px] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
