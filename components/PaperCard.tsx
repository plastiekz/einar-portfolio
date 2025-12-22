import React, { memo } from 'react';
import { Paper } from '../types';

interface PaperCardProps {
  paper: Paper;
  isExpanded: boolean;
  isSaved: boolean;
  analysisResult: { id: string, type: string, text: string } | null;
  loadingAction: string | null;
  errorState: { id: string, message: string } | null;
  onToggleExpand: (id: string) => void;
  onToggleSave: (id: string) => void;
  onGeminiAction: (e: React.MouseEvent, paper: Paper, mode: 'summary' | 'critique' | 'creative') => void;
}

const getCarbonVisuals = (level?: string) => {
  switch (level) {
    case 'LOW': return {
      barColor: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      widthClass: 'w-[15%]',
      shadow: 'shadow-[0_0_10px_rgba(16,185,129,0.4)]'
    };
    case 'MEDIUM': return {
      barColor: 'bg-yellow-400',
      textColor: 'text-yellow-400',
      widthClass: 'w-[45%]',
      shadow: 'shadow-[0_0_10px_rgba(250,204,21,0.4)]'
    };
    case 'HIGH': return {
      barColor: 'bg-orange-500',
      textColor: 'text-orange-400',
      widthClass: 'w-[75%]',
      shadow: 'shadow-[0_0_10px_rgba(249,115,22,0.4)]'
    };
    case 'EXTREME': return {
      barColor: 'bg-rose-600',
      textColor: 'text-rose-500',
      widthClass: 'w-full',
      shadow: 'shadow-[0_0_15px_rgba(225,29,72,0.6)]'
    };
    default: return {
      barColor: 'bg-slate-600',
      textColor: 'text-slate-400',
      widthClass: 'w-[5%]',
      shadow: ''
    };
  }
};

const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  isExpanded,
  isSaved,
  analysisResult,
  loadingAction,
  errorState,
  onToggleExpand,
  onToggleSave,
  onGeminiAction
}) => {
  const carbonVisuals = getCarbonVisuals(paper.estimatedCarbon?.label);

  return (
    <div
      onClick={() => onToggleExpand(paper.id)}
      className={`group bg-black/20 backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 cursor-pointer relative overflow-hidden ${isExpanded
        ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]'
        : 'border-white/10 hover:bg-white/5 hover:border-white/20'
        }`}
    >
      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none ${isExpanded ? '' : 'group-hover:translate-x-full'}`}></div>

      {/* Header Section */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
            {paper.source}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/10">
            {paper.category}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500">{paper.publishedDate}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(paper.id);
            }}
            className={`p-1.5 rounded-lg transition-all border ${isSaved
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
              : 'text-slate-500 border-transparent hover:bg-white/5 hover:text-slate-300'
              }`}
            title={isSaved ? "Remove from saved" : "Save for later"}
          >
            <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>

      <h4 className={`text-lg font-bold text-slate-100 mb-3 transition-colors ${isExpanded ? 'text-cyan-300' : 'group-hover:text-cyan-300'}`}>
        {paper.title}
      </h4>

      {/* Content Section */}
      <div className="relative">
        <p className={`text-sm text-slate-400 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
          {paper.abstract}
        </p>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-8 pt-6 border-t border-white/10 animate-in fade-in duration-500">
            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Authors</h5>
                <p className="text-sm text-slate-200">{paper.authors.join(', ')}</p>
              </div>
              <div>
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Source Link</h5>
                <a
                  href={paper.url || `https://scholar.google.com/scholar?q=${encodeURIComponent(paper.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-2 group/link"
                  onClick={(e) => e.stopPropagation()}
                >
                  Read Full Paper
                  <svg className="w-3 h-3 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            </div>

            {/* Carbon / Sustainability Info */}
            {paper.estimatedCarbon && (
              <div className="mb-6 p-5 rounded-xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group/carbon">
                {/* Ambient Background Glow for High Impact */}
                {(paper.estimatedCarbon.label === 'HIGH' || paper.estimatedCarbon.label === 'EXTREME') && (
                  <div className={`absolute -right-10 -top-10 w-32 h-32 blur-[60px] opacity-20 rounded-full pointer-events-none ${carbonVisuals.barColor}`}></div>
                )}

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Eco-Cognitive Cost
                    </h5>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-sm font-black tracking-wide ${carbonVisuals.textColor}`}>
                        {paper.estimatedCarbon.label} IMPACT
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({paper.estimatedCarbon.tCO2e} tCO2e)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-mono font-bold text-white block leading-none">
                      {paper.estimatedCarbon.computeHours.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">GPU Hours</span>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="relative h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out relative ${carbonVisuals.barColor} ${carbonVisuals.shadow} ${carbonVisuals.widthClass}`}
                  >
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                    {/* Pulse animation for extreme items */}
                    {paper.estimatedCarbon.label === 'EXTREME' && (
                      <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Gemini Action Bar */}
            <div className="mb-6">
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></span>
                Gemini Intelligence
              </h5>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={(e) => onGeminiAction(e, paper, 'summary')}
                  className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-lg transition-all border border-emerald-500/20 hover:border-emerald-500/40 flex items-center gap-2"
                  disabled={!!loadingAction}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  High-Density Summary
                </button>
                <button
                  onClick={(e) => onGeminiAction(e, paper, 'critique')}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold rounded-lg transition-all border border-rose-500/20 hover:border-rose-500/40 flex items-center gap-2"
                  disabled={!!loadingAction}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Reviewer #2 Critique
                </button>
                <button
                  onClick={(e) => onGeminiAction(e, paper, 'creative')}
                  className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg transition-all border border-amber-500/20 hover:border-amber-500/40 flex items-center gap-2"
                  disabled={!!loadingAction}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Brainstorm Extensions
                </button>
              </div>
            </div>

            {/* Analysis Output Area */}
            {(loadingAction || (analysisResult && analysisResult.id === paper.id) || (errorState && errorState.id === paper.id)) && (
              <div className="bg-black/40 rounded-xl p-6 border border-white/10 relative overflow-hidden">
                {loadingAction && (
                  <div className="flex items-center gap-3 text-cyan-300 text-sm">
                    <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-mono">INITIALIZING_GENERATIVE_ENGINE...</span>
                  </div>
                )}

                {/* Error UI */}
                {errorState && errorState.id === paper.id && !loadingAction && (
                  <div className="flex items-start gap-4 text-rose-300 animate-in fade-in duration-300">
                    <div className="p-2 bg-rose-500/10 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="text-sm">
                      <p className="font-bold mb-1">ANALYSIS PROTOCOL FAILED</p>
                      <p className="opacity-80 leading-relaxed">{errorState.message}</p>
                    </div>
                  </div>
                )}

                {analysisResult && analysisResult.id === paper.id && !loadingAction && !errorState && (
                  <div className="prose prose-invert prose-sm max-w-none animate-in fade-in duration-300">
                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{analysisResult.type.toUpperCase()} OUTPUT</span>
                      <span className="text-[10px] text-slate-500 font-mono">MODEL: GEMINI-2.5-FLASH</span>
                    </div>
                    <div className="whitespace-pre-wrap text-slate-300 font-light">
                      {analysisResult.text.split('\n').map((line, i) => {
                        if (line.includes('**')) {
                          const parts = line.split('**');
                          return <p key={i} className="mb-2"><strong className="text-white font-semibold">{parts[1]}</strong>{parts[2]}</p>
                        }
                        return <p key={i} className="mb-2">{line}</p>
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Impact Score Badge - Always visible */}
      {!isExpanded && (
        <div className="mt-4 flex justify-between items-center text-xs text-slate-500 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider">Authors</span>
            {paper.authors.length > 2 ? `${paper.authors[0]}, +${paper.authors.length - 1} others` : paper.authors.join(', ')}
          </div>
          {paper.impactScore && (
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider">Impact</span>
              <span className={`font-mono font-bold ${paper.impactScore > 90 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {paper.impactScore}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(PaperCard);
