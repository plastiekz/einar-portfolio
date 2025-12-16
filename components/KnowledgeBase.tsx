import React, { useState, useRef, useEffect } from 'react';
import { Paper } from '../types';
import { MOCK_PAPERS } from '../constants';
import { synthesizeCollection, synthesizeCouncil } from "@/services/ai";
import { OptimizationDashboard } from './OptimizationDashboard';
import { ToolFabric } from './ToolFabric';

export const KnowledgeBase: React.FC = () => {
  const [viewMode, setViewMode] = useState<'ARCHIVE' | 'OPTIMIZATION' | 'SKILLS'>('ARCHIVE');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [customPapers, setCustomPapers] = useState<Paper[]>([]);
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'model', text: string, council?: Array<{ institution: string, type: string, text: string }> }>>([
    { role: 'model', text: "Welcome to Synapse Memory. Select papers from the Neural Archive to begin your synthesis. I can find connections across your research database." }
  ]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [mode, setMode] = useState<'STANDARD' | 'COUNCIL'>('STANDARD');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const allPapers = [...MOCK_PAPERS, ...customPapers];

  const togglePaper = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (selectedIds.size > 0 && chatHistory.length === 1) {
          setLoadingSuggestions(true);
          const selectedPapers = allPapers.filter(p => selectedIds.has(p.id));
          const questions = await generateSuggestedQuestions(selectedPapers);
          setSuggestedQuestions(questions);
          setLoadingSuggestions(false);
      } else {
          setSuggestedQuestions([]);
      }
    };

    // Debounce to avoid too many calls
    const timer = setTimeout(() => {
        fetchSuggestions();
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedIds, chatHistory.length]); // Dependencies: selection changes or chat starts (history > 1 clears suggestions)

  const handleAddSource = (title: string, content: string) => {
    const newPaper: Paper = {
      id: `custom-${Date.now()}`,
      title,
      abstract: content,
      authors: ['External Source'],
      publishedDate: new Date().toISOString().split('T')[0],
      source: 'ArXiv', // Fallback for UI
      category: 'Custom',
      impactScore: 0
    };
    setCustomPapers(prev => [newPaper, ...prev]);
    togglePaper(newPaper.id); // Auto-select the new paper
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSynthesize = async (customQuery?: string) => {
    const prompt = customQuery || query;
    if (!prompt.trim() && !customQuery) return;

    // Get selected paper objects
    const selectedPapers = MOCK_PAPERS.filter(p => selectedIds.has(p.id));

    if (selectedPapers.length === 0) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Please select at least one source from the archive first." }]);
      return;
    }

    const userMsg = { role: 'user' as const, text: prompt };
    setChatHistory(prev => [...prev, userMsg]);
    setQuery('');
    setIsSynthesizing(true);

    try {
      if (mode === 'STANDARD') {
        const response = await synthesizeCollection(selectedPapers, prompt);
        setChatHistory(prev => [...prev, { role: 'model', text: response }]);
      } else {
        const councilResponse = await synthesizeCouncil(selectedPapers, prompt);
        setChatHistory(prev => [...prev, {
          role: 'model',
          text: "Council Report Generated.",
          council: councilResponse
        }]);
      }
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Error accessing Synapse Memory.";
        setChatHistory(prev => [...prev, { role: 'model', text: `**SYSTEM ERROR**: ${msg}` }]);
    } finally {
      setIsSynthesizing(false);
    }
  };

  if (viewMode === 'OPTIMIZATION') {
    return (
      <div className="h-[calc(100vh-10rem)] flex flex-col gap-6">
        <div className="flex justify-start">
          <button
            onClick={() => setViewMode('ARCHIVE')}
            className="text-slate-400 hover:text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Archive
          </button>
        </div>
        <OptimizationDashboard />
      </div>
    );
  }

  if (viewMode === 'SKILLS') {
    return (
      <div className="h-[calc(100vh-10rem)] flex flex-col gap-6">
        <div className="flex justify-start">
          <button
            onClick={() => setViewMode('ARCHIVE')}
            className="text-slate-400 hover:text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Archive
          </button>
        </div>
        <ToolFabric />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-6 relative">
      {/* Toggles Overlay */}
      <div className="absolute top-4 right-4 z-50 flex gap-3">
        <button
          onClick={() => setViewMode('SKILLS')}
          className="bg-orange-950/80 hover:bg-orange-900 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(234,88,12,0.3)] hover:shadow-[0_0_25px_rgba(234,88,12,0.5)] transition-all flex items-center gap-2 backdrop-blur-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          Motor Cortex
        </button>
        <button
          onClick={() => setViewMode('OPTIMIZATION')}
          className="bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(8,145,178,0.3)] hover:shadow-[0_0_25px_rgba(8,145,178,0.5)] transition-all flex items-center gap-2 backdrop-blur-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Optimization Daemon
        </button>
      </div>

      {/* Left Panel: Neural Archive (Source Selection) */}
      <div className="w-1/3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-white/5 bg-white/5">
          <h3 className="text-white font-bold flex items-center gap-2 tracking-wide">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Neural Archive
          </h3>
          <p className="text-xs text-slate-400 mt-1">{allPapers.length} Sources Ingested</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {allPapers.map(paper => {
            const isSelected = selectedIds.has(paper.id);
            return (
              <div
                key={paper.id}
                onClick={() => togglePaper(paper.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${isSelected
                  ? 'bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                  : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'
                    }`}>
                    {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold leading-tight ${isSelected ? 'text-indigo-200' : 'text-slate-300'}`}>
                      {paper.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase truncate">{paper.authors[0]} • {paper.publishedDate}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/5 bg-white/5">
          <button className="w-full py-3 border border-white/10 border-dashed rounded-xl text-slate-400 text-xs font-bold uppercase tracking-wider hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add External Source
          </button>
        </div>
      </div>

      {/* Right Panel: Synthesis Interface */}
      <div className="w-2/3 flex flex-col bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden relative">
        {/* Background Effect */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-indigo-500/5 to-transparent">
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 z-10 scrollbar-thin">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-6 ${msg.role === 'user'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                : 'bg-white/5 border border-white/10 text-slate-200 shadow-xl'
                }`}>
                <div className="prose prose-invert prose-sm">
                  {msg.council ? (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2 mb-4">
                        Institutional Analysis Board
                      </h4>
                      {msg.council.map((agent, i) => (
                        <div key={i} className="p-4 rounded-xl bg-black/20 border border-white/10">
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-xs font-bold uppercase tracking-wider ${agent.type === 'ANALYSIS' ? 'text-blue-400' :
                              agent.type === 'CRITIQUE' ? 'text-rose-400' : 'text-emerald-400'
                              }`}>
                              {agent.institution}
                            </span>
                            <span className="text-[9px] text-slate-500 border border-white/10 px-1.5 py-0.5 rounded">
                              {agent.type}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed">{agent.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    msg.text.split('\n').map((line, i) => {
                      if (line.trim().startsWith('- ')) return (
                        <div key={i} className="ml-4 flex items-start gap-2 mb-1">
                          <span className="text-indigo-400 mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                          <span className="leading-relaxed">{line.substring(2)}</span>
                        </div>
                      );
                      if (line.includes('[Source')) return <p key={i} className="text-indigo-300 mb-2 font-mono text-xs">{line}</p>
                      return <p key={i} className="mb-2 last:mb-0 leading-relaxed">{line}</p>
                    })
                  )}
                </div>
              </div>
            </div>
          ))}
          {isSynthesizing && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                </div>
                <span className="text-xs text-indigo-300 font-mono uppercase tracking-widest">Weaving Insights...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-black/40 border-t border-white/10 z-10">
          {selectedIds.size > 0 && chatHistory.length === 1 && (
            <div className="flex gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              <button onClick={() => handleSynthesize("Summarize the key themes across these papers.")} className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white hover:border-indigo-500/50 transition-all">
                ✨ Summarize Themes
              </button>
              <button onClick={() => handleSynthesize("What are the conflicting viewpoints between these sources?")} className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white hover:border-rose-500/50 transition-all">
                ⚔️ Find Contradictions
              </button>
              <button onClick={() => handleSynthesize("Based on these papers, propose a new research direction.")} className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white hover:border-emerald-500/50 transition-all">
                🚀 Propose Future Work
              </button>
            </div>
          )}

          <div className="relative group">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSynthesize();
                }
              }}
              placeholder={selectedIds.size === 0 ? "Select papers from the Neural Archive to start..." : `Ask Synapse Memory about the ${selectedIds.size} selected source(s)...`}
              className="w-full bg-black/50 border border-white/10 rounded-2xl pl-6 pr-14 py-4 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 resize-none h-16 placeholder-slate-600 transition-all"
              disabled={selectedIds.size === 0 || isSynthesizing}
            />
            <button
              onClick={() => handleSynthesize()}
              disabled={selectedIds.size === 0 || isSynthesizing || !query.trim()}
              className="absolute right-3 top-3 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-slate-600 text-white rounded-xl transition-all shadow-lg shadow-indigo-900/20"
              aria-label="Submit Query"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
          <div className="flex justify-between items-center mt-3 px-2">
            <span className="text-[10px] text-slate-500 font-mono">
              {selectedIds.size} SOURCES ACTIVE
            </span>
            <span className="text-[10px] text-indigo-400/80 font-mono flex items-center gap-2">
              <button
                onClick={() => setMode(m => m === 'STANDARD' ? 'COUNCIL' : 'STANDARD')}
                className={`flex items-center gap-2 px-2 py-1 rounded border transition-all ${mode === 'COUNCIL'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                  : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${mode === 'COUNCIL' ? 'bg-purple-400 animate-pulse' : 'bg-slate-500'}`}></span>
                {mode === 'STANDARD' ? 'ACTIVATE COUNCIL' : 'COUNCIL ACTIVE'}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};