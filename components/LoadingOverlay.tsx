
import React, { useState, useEffect } from 'react';

export const LoadingOverlay: React.FC<{ message?: string }> = ({ message = "正在分析图片..." }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center px-4">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-xl font-semibold text-slate-800 tabular-nums">
        {message}{dots}
      </p>
      <p className="text-sm text-slate-500 mt-2 animate-pulse">
        Gemini 正在全力思考，这通常需要几秒钟时间...
      </p>
    </div>
  );
};
