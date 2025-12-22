
import React from 'react';
import { AnalysisResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface LocationAnalysisProps {
  analysis: AnalysisResult;
}

export const LocationAnalysis: React.FC<LocationAnalysisProps> = ({ analysis }) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-8">
      {analysis.primaryLocation && (
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-7 rounded-[2rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
              {t('best_guess')}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs font-black">{Math.round(analysis.primaryLocation.confidence * 100)}%</span>
            </div>
          </div>
          <h3 className="text-3xl font-black mb-3 leading-tight tracking-tight relative z-10">{analysis.primaryLocation.name}</h3>
          <p className="text-sm text-indigo-100/90 leading-relaxed font-light relative z-10">{analysis.primaryLocation.description}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-3">
            <span className="w-10 h-[1px] bg-slate-800"></span>
            {t('candidates_list')} ({analysis.topGuesses.length})
          </h4>
        </div>

        <div className="grid grid-cols-1 gap-2.5 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
          {analysis.topGuesses.map((guess, index) => (
            <div key={index} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300 group cursor-default">
              <div className="bg-slate-900 text-slate-500 w-7 h-7 rounded-xl flex items-center justify-center font-black text-[10px] flex-shrink-0 border border-white/5 group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-all">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="font-bold text-slate-200 text-sm truncate">{guess.name}</h5>
                  <span className="text-[9px] font-black text-slate-600 bg-white/5 px-1.5 py-0.5 rounded uppercase">{Math.round(guess.confidence * 100)}%</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-light">{guess.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-indigo-500/5 p-5 rounded-2xl border border-indigo-500/10">
        <div className="flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t('expert_consensus')}</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed italic font-light">
          {analysis.explanation}
        </p>
      </div>
    </div>
  );
};
