import React, { useState } from 'react';
import { performDeepAnalysis, generateAdversarialDebate, generateSuggestedQuestions } from "@/services/geminiService";
import { DebateTurn } from '../types';

export const DeepDive: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [debate, setDebate] = useState<DebateTurn[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'STANDARD' | 'ADVERSARIAL'>('STANDARD');

  const handleAnalyze = async (query?: string) => {
    const input = typeof query === 'string' ? query : topic;
    if (!input.trim()) return;
    setIsThinking(true);
    setAnalysis('');
    setDebate([]);
    setQuestions([]);
    setError(null);

    try {
      if (mode === 'STANDARD') {
          const result = await performDeepAnalysis(input);
          setAnalysis(result);
          // Generate follow-up questions for standard analysis
          const suggested = await generateSuggestedQuestions(result);
          setQuestions(suggested);
      } else {
          const result = await generateAdversarialDebate(input);
          setDebate(result);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unexpected error occurred.";
      setAnalysis(`## SYSTEM ERROR\n\n**Detailed Diagnostic:** ${msg}\n\n*Please verify API key configuration and network connectivity.*`);
    } finally {
      setIsThinking(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    setTopic(question);
    handleAnalyze(question);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-10rem)]">
      {/* Control Panel */}
      <div className="lg:col-span-1 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col gap-8 h-full">
        <div>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <svg aria-label="Engine Icon" className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            Deep Thinking Engine
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mt-2">
            Leverage Gemini 3.0 Pro's extended thinking or initiate an adversarial consensus protocol between two AI agents.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Analysis Mode</label>
          <div className="flex bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setMode('STANDARD')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'STANDARD' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              STANDARD REPORT
            </button>
            <button
              onClick={() => setMode('ADVERSARIAL')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'ADVERSARIAL' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              ADVERSARIAL DEBATE
            </button>
          </div>

          <label htmlFor="topic-input" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">Research Vector</label>
          <textarea
            id="topic-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none min-h-[160px] resize-none transition-all placeholder-white/20"
            placeholder={mode === 'STANDARD' ? "e.g., Sparse Autoencoders in Mechanistic Interpretability..." : "e.g., Is Scale really all we need?"}
          />
          <button
            onClick={() => handleAnalyze()}
            disabled={isThinking || !topic.trim()}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all tracking-wide ${isThinking
                ? 'bg-purple-900/20 border border-purple-500/30 cursor-not-allowed'
                : mode === 'STANDARD'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/30'
                  : 'bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 shadow-lg shadow-rose-900/30'
              }`}
          >
            {isThinking ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </span>
            ) : mode === 'STANDARD' ? 'INITIALIZE DEEP ANALYSIS' : 'INITIATE AGENT DEBATE'}
          </button>
        </div>

        <div className="mt-auto p-5 bg-black/40 rounded-xl border border-white/5">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">System Status</h4>
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${isThinking ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`}></div>
            <span className="text-sm font-mono text-slate-300">
              {isThinking ? 'REASONING_CHAIN_ACTIVE' : 'READY_FOR_INFERENCE'}
            </span>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 overflow-y-auto relative scrollbar-thin">
        {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
                <h3 className="text-red-400 font-bold mb-1 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Analysis Failed
                </h3>
                <p className="text-red-200/70 text-sm">{error}</p>
            </div>
        )}

        {!analysis && debate.length === 0 && !isThinking && !error && (
          <div className="h-full flex flex-col items-center justify-center text-slate-600">
            <svg className="w-20 h-20 mb-6 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-sm font-medium tracking-wide">AWAITING INPUT VECTOR</p>
          </div>
        )}

        {isThinking && (
          <div className="h-full flex flex-col items-center justify-center space-y-8">
            <div className="relative w-32 h-32">
              <div className={`absolute inset-0 border-t-2 rounded-full animate-spin ${mode === 'STANDARD' ? 'border-purple-500' : 'border-rose-500'}`}></div>
              <div className={`absolute inset-4 border-t-2 rounded-full animate-spin ${mode === 'STANDARD' ? 'border-indigo-500' : 'border-orange-500'}`} style={{ animationDirection: 'reverse' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_15px_white] animate-ping"></div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                {mode === 'STANDARD' ? 'Synthesizing Knowledge' : 'Agents Debating'}
              </h3>
              <p className="text-slate-400 mt-3 font-mono text-sm">
                {mode === 'STANDARD' ? 'Traversing citation graphs...' : 'Protos and Kronos are locking horns...'}
              </p>
            </div>
          </div>
        )}

        {/* Standard Report View */}
        {analysis && mode === 'STANDARD' && (
          <div className="prose prose-invert prose-lg max-w-none animate-in fade-in duration-700">
            {analysis.split('\n').map((line, i) => {
              if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 mt-8 mb-6 pb-2 border-b border-white/10">{line.replace('## ', '')}</h2>;
              if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-semibold text-purple-200 mt-6 mb-4">{line.replace('### ', '')}</h3>;
              if (line.startsWith('* ') || line.startsWith('- ')) return <li key={i} className="ml-4 text-slate-300 list-disc marker:text-purple-500">{line.substring(2)}</li>;
              if (line.match(/^\d\./)) return <li key={i} className="ml-4 text-slate-300 list-decimal marker:text-purple-500">{line.substring(2)}</li>;
              if (line.trim() === '') return <br key={i} />;
              // Improved bold text rendering
              const parts = line.split(/(\*\*.*?\*\*)/g);
              return (
                  <p key={i} className="text-slate-300 leading-relaxed mb-4">
                      {parts.map((part, j) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                          }
                          return part;
                      })}
                  </p>
              );
            })}
          </div>
        )}

        {/* Follow-up Questions Section */}
        {questions.length > 0 && mode === 'STANDARD' && !isThinking && (
             <div className="mt-8 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Suggested Follow-up Vectors</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {questions.map((q, idx) => (
                         <button
                             key={idx}
                             onClick={() => handleQuestionClick(q)}
                             className="text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 transition-all group"
                         >
                             <span className="text-purple-400 font-bold mr-2">Wait,</span>
                             <span className="text-slate-300 group-hover:text-white transition-colors text-sm">{q}</span>
                         </button>
                     ))}
                 </div>
             </div>
        )}

        {/* Adversarial Debate View */}
        {debate.length > 0 && mode === 'ADVERSARIAL' && (
          <div className="space-y-6 animate-in fade-in duration-700">
            {debate.map((turn, i) => {
              const isProtos = turn.speaker.includes('Optimist');
              const isKronos = turn.speaker.includes('Skeptic');
              const isJudge = turn.speaker.includes('Judge');

              return (
                <div key={i} className={`flex ${isProtos ? 'justify-start' : isKronos ? 'justify-end' : 'justify-center'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-6 border ${isProtos
                      ? 'bg-blue-500/10 border-blue-500/30 rounded-tl-sm'
                      : isKronos
                        ? 'bg-rose-500/10 border-rose-500/30 rounded-tr-sm'
                        : 'bg-purple-500/20 border-purple-500/50 w-full text-center'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${isProtos ? 'bg-blue-400' : isKronos ? 'bg-rose-400' : 'bg-purple-400'
                        }`}></div>
                      <span className={`text-xs font-bold uppercase tracking-widest ${isProtos ? 'text-blue-400' : isKronos ? 'text-rose-400' : 'text-purple-400'
                        }`}>
                        {turn.speaker}
                      </span>
                    </div>
                    <p className="text-slate-200 leading-relaxed text-sm md:text-base">
                      {turn.text}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
};
