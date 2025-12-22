import React, { useState, useRef, useEffect } from 'react';
import { Paper, SourceGuide, PodcastSegment } from '../types';
import { MOCK_PAPERS } from '../constants';
import { synthesizeCollection, synthesizeCouncil } from "@/services/ai";
import { generateSuggestedQuestions, generateSourceGuide, generatePodcastScript } from '../services/geminiService';
import { OptimizationDashboard } from './OptimizationDashboard';
import { ToolFabric } from './ToolFabric';
import { AddSourceModal } from './AddSourceModal';
import { SourceGuideView } from './SourceGuideView';
import { AudioOverview } from './AudioOverview';

// Helper for rendering Markdown-like text (simple version)
const renderMarkdownText = (text: string) => {
    return text.split('\n').map((line, i) => {
        if (line.trim().startsWith('##')) {
            return <h4 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.replace(/^#+\s/, '')}</h4>;
        }
        if (line.trim().startsWith('- ')) {
            return (
                <div key={i} className="ml-4 flex items-start gap-2 mb-1">
                    <span className="text-indigo-400 mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                    <span className="leading-relaxed text-slate-300">{line.substring(2)}</span>
                </div>
            );
        }
        if (line.includes('[Source')) return <p key={i} className="text-indigo-300 mb-2 font-mono text-xs">{line}</p>;
        return <p key={i} className="mb-2 last:mb-0 leading-relaxed text-slate-300">{line}</p>;
    });
};

export const KnowledgeBase: React.FC = () => {
  const [viewMode, setViewMode] = useState<'ARCHIVE' | 'OPTIMIZATION' | 'SKILLS'>('ARCHIVE');
  const [activeTab, setActiveTab] = useState<'CHAT' | 'GUIDE' | 'AUDIO'>('CHAT');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [customPapers, setCustomPapers] = useState<Paper[]>([]);
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'model', text: string, council?: Array<{ institution: string, type: string, text: string }> }>>([
    { role: 'model', text: "Welcome to Synapse Memory. Select papers from the Neural Archive to begin your synthesis. I can find connections across your research database." }
  ]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [mode, setMode] = useState<'STANDARD' | 'COUNCIL'>('STANDARD');

  // New State for NotebookLM features
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);

  // Source Guide & Audio Overview State
  const [sourceGuide, setSourceGuide] = useState<string | null>(null);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [podcastScript, setPodcastScript] = useState<Array<{ speaker: string, text: string }> | null>(null);
  const [loadingPodcast, setLoadingPodcast] = useState(false);

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

    // Clear guides when selection changes (optional, but good for consistency)
    if (sourceGuide) setSourceGuide(null);
    if (podcastScript) setPodcastScript(null);
  };

  const handleAddSource = (newPaper: Paper) => {
    setCustomPapers(prev => [newPaper, ...prev]);
    togglePaper(newPaper.id); // Auto-select the new paper
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (selectedIds.size > 0 && chatHistory.length === 1) {
          setLoadingSuggestions(true);
          try {
              const selectedPapers = allPapers.filter(p => selectedIds.has(p.id));
              // Create a context string for suggestion generation
              const context = selectedPapers.map(p => `Title: ${p.title}\nAbstract: ${p.abstract}`).join('\n\n');
              const questions = await generateSuggestedQuestions(context);
              setSuggestedQuestions(questions);
          } catch (e) {
              console.error("Failed to fetch suggestions:", e);
              setSuggestedQuestions([]);
          } finally {
              setLoadingSuggestions(false);
          }
      } else {
          setSuggestedQuestions([]);
      }
    };

    fetchSuggestions();
  }, [selectedIds, chatHistory]);

  const scrollToBottom = () => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'CHAT') {
        scrollToBottom();
    }
  }, [chatHistory, activeTab]);

  const handleSynthesize = async (customQuery?: string) => {
    const prompt = customQuery || query;
    if (!prompt.trim() && !customQuery) return;

    // Get selected paper objects
    const selectedPapers = allPapers.filter(p => selectedIds.has(p.id));

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

  const handleFetchSourceGuide = async () => {
    const selectedPapers = allPapers.filter(p => selectedIds.has(p.id));
    if (selectedPapers.length === 0) return;

    setLoadingGuide(true);
    try {
        const guide = await generateSourceGuide(selectedPapers);
        setSourceGuide(guide);
    } catch (e) {
        console.error("Error fetching source guide:", e);
        setSourceGuide("Failed to generate source guide.");
    } finally {
        setLoadingGuide(false);
    }
  };

  const handleFetchPodcast = async () => {
      const selectedPapers = allPapers.filter(p => selectedIds.has(p.id));
      if (selectedPapers.length === 0) return;

      setLoadingPodcast(true);
      try {
          const script = await generatePodcastScript(selectedPapers);
          setPodcastScript(script);
      } catch (e) {
          console.error("Error fetching podcast:", e);
          setPodcastScript([]);
      } finally {
          setLoadingPodcast(false);
      }
  };

  // Trigger content generation when switching tabs if empty
  useEffect(() => {
      if (activeTab === 'GUIDE' && !sourceGuide && !loadingGuide && selectedIds.size > 0) {
          handleFetchSourceGuide();
      }
      if (activeTab === 'AUDIO' && !podcastScript && !loadingPodcast && selectedIds.size > 0) {
          handleFetchPodcast();
      }
  }, [activeTab, selectedIds]);


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
            <div className="flex justify-start"><button onClick={() => setViewMode('ARCHIVE')} className="text-slate-400 hover:text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>Back to Archive</button></div>
            <ToolFabric />
        </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-6 relative">
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
                    <div key={paper.id} onClick={() => togglePaper(paper.id)} className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${isSelected ? 'bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'}`}>
                        <div className="flex items-start gap-3">
                            <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`}>
                                {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <div>
                                <h4 className={`text-sm font-bold leading-tight ${isSelected ? 'text-indigo-200' : 'text-slate-300'}`}>{paper.title}</h4>
                                <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase truncate">{paper.authors[0]} • {paper.publishedDate}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
        <div className="p-4 border-t border-white/5 bg-white/5">
            <button onClick={() => setIsAddSourceModalOpen(true)} className="w-full py-3 border border-white/10 border-dashed rounded-xl text-slate-400 text-xs font-bold uppercase tracking-wider hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add External Source
            </button>
        </div>
      </div>

      <AddSourceModal isOpen={isAddSourceModalOpen} onClose={() => setIsAddSourceModalOpen(false)} onAdd={handleAddSource} />

      <div className="flex-1 flex flex-col relative overflow-hidden bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl">
        {/* Tab Navigation & Toggles */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 z-20">
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('CHAT')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        activeTab === 'CHAT' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    💬 Chat
                </button>
                <button
                    onClick={() => setActiveTab('GUIDE')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        activeTab === 'GUIDE' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    📚 Source Guide
                </button>
                <button
                    onClick={() => setActiveTab('AUDIO')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        activeTab === 'AUDIO' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    🎧 Audio Overview
                </button>
            </div>

            {/* Action Toggles */}
             <div className="flex gap-2">
                <button
                onClick={() => setViewMode('SKILLS')}
                className="bg-orange-950/80 hover:bg-orange-900 border border-orange-500/30 text-orange-400 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(234,88,12,0.3)] hover:shadow-[0_0_25px_rgba(234,88,12,0.5)] transition-all flex items-center gap-2 backdrop-blur-md"
                >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                Motor Cortex
                </button>
                <button
                onClick={() => setViewMode('OPTIMIZATION')}
                className="bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(8,145,178,0.3)] hover:shadow-[0_0_25px_rgba(8,145,178,0.5)] transition-all flex items-center gap-2 backdrop-blur-md"
                >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Opt. Daemon
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative z-10 scrollbar-thin">

            {/* CHAT TAB */}
            {activeTab === 'CHAT' && (
                <div className="flex flex-col h-full">
                    <div className="flex-1 p-6 space-y-8">
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
                </div>
            )}

            {/* SOURCE GUIDE TAB */}
            {activeTab === 'GUIDE' && (
                <div className="p-8 max-w-4xl mx-auto">
                    {loadingGuide ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                            <p className="text-slate-400 font-mono text-sm animate-pulse">Generating Source Guide...</p>
                        </div>
                    ) : selectedIds.size === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <svg className="w-12 h-12 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            <h3 className="text-xl font-bold text-slate-300">No Sources Selected</h3>
                            <p className="text-slate-500 mt-2">Select papers from the Neural Archive to generate a guide.</p>
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
                             <div className="prose prose-invert prose-lg max-w-none">
                                {sourceGuide ? (
                                    <div className="whitespace-pre-wrap leading-relaxed text-slate-300">
                                         {sourceGuide.split('\n').map((line, i) => {
                                             if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold text-white mb-6 border-b border-white/10 pb-4">{line.replace('# ', '')}</h1>
                                             if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-indigo-300 mt-8 mb-4">{line.replace('## ', '')}</h2>
                                             if (line.startsWith('- **')) {
                                                 const parts = line.split('**:');
                                                 return (
                                                     <div key={i} className="ml-4 mb-2">
                                                         <span className="text-indigo-200 font-bold">{parts[0].replace('- **', '')}:</span>
                                                         <span className="text-slate-300">{parts[1]}</span>
                                                     </div>
                                                 )
                                             }
                                             if (line.startsWith('- ')) return <li key={i} className="ml-6 text-slate-300 mb-1">{line.replace('- ', '')}</li>
                                             return <p key={i} className="mb-4 text-slate-300 leading-relaxed">{line}</p>
                                         })}
                                    </div>
                                ) : (
                                    <p className="text-slate-400 italic">Guide generation failed or is empty.</p>
                                )}
                             </div>
                        </div>
                    )}
                </div>
            )}

            {/* AUDIO OVERVIEW TAB */}
            {activeTab === 'AUDIO' && (
                <div className="p-8 max-w-3xl mx-auto">
                    {loadingPodcast ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="flex gap-2">
                                <span className="w-2 h-8 bg-indigo-500 rounded-full animate-[bounce_1s_infinite]"></span>
                                <span className="w-2 h-8 bg-indigo-500 rounded-full animate-[bounce_1s_infinite_0.1s]"></span>
                                <span className="w-2 h-8 bg-indigo-500 rounded-full animate-[bounce_1s_infinite_0.2s]"></span>
                            </div>
                            <p className="text-slate-400 font-mono text-sm animate-pulse">Scripting Podcast...</p>
                        </div>
                    ) : selectedIds.size === 0 ? (
                         <div className="flex flex-col items-center justify-center py-20 text-center">
                            <svg className="w-12 h-12 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                            <h3 className="text-xl font-bold text-slate-300">No Sources Selected</h3>
                            <p className="text-slate-500 mt-2">Select papers to generate an audio overview.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <span className="p-2 bg-indigo-500 rounded-full">🎧</span>
                                    Deep Dive Audio
                                </h2>
                                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider text-slate-300 transition-all">
                                    ▶ Play (Simulation)
                                </button>
                            </div>

                            <div className="space-y-6">
                                {podcastScript?.map((turn, i) => (
                                    <div key={i} className={`flex gap-4 ${turn.speaker === 'Host' ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                                            turn.speaker === 'Host' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                                        }`}>
                                            {turn.speaker[0]}
                                        </div>
                                        <div className={`flex-1 p-4 rounded-2xl border ${
                                            turn.speaker === 'Host'
                                            ? 'bg-white/5 border-white/10 rounded-tl-none'
                                            : 'bg-emerald-900/10 border-emerald-500/20 rounded-tr-none'
                                        }`}>
                                            <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-50">{turn.speaker}</p>
                                            <p className="text-slate-200 leading-relaxed">{turn.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Input Area (Only visible in CHAT) */}
        {activeTab === 'CHAT' && (
            <div className="p-6 bg-black/40 border-t border-white/10 z-10">
            {selectedIds.size > 0 && chatHistory.length === 1 && (
                <div className="flex gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                {loadingSuggestions && (
                    <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-400 animate-pulse">
                        ✨ Generating suggestions...
                    </div>
                )}
                {!loadingSuggestions && suggestedQuestions.map((q, idx) => (
                    <button
                        key={`sugg-${idx}`}
                        onClick={() => handleSynthesize(q)}
                        className="whitespace-nowrap px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 hover:text-white hover:border-indigo-500/50 transition-all"
                    >
                        ✨ {q}
                    </button>
                ))}
                <button onClick={() => handleSynthesize("Summarize the key themes across these papers.")} className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white hover:border-indigo-500/50 transition-all">
                    📝 Summarize Themes
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
        )}
      </div>
    </div>
  );
};
