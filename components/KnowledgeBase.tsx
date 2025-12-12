import React, { useState, useRef, useEffect } from 'react';
import { Paper } from '../types';
import { MOCK_PAPERS } from '../constants';
import { synthesizeCollection, generateSuggestedQuestions } from '../services/geminiService';
import { AddSourceModal } from './AddSourceModal';

export const KnowledgeBase: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [customPapers, setCustomPapers] = useState<Paper[]>([]);
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'model', text: string}>>([
    { role: 'model', text: "Welcome to Synapse Memory. Select papers from the Neural Archive to begin your synthesis. I can find connections across your research database." }
  ]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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
        const response = await synthesizeCollection(selectedPapers, prompt);
        setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    } catch (e) {
        setChatHistory(prev => [...prev, { role: 'model', text: "Error accessing Synapse Memory." }]);
    } finally {
        setIsSynthesizing(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-6">
      <AddSourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddSource}
      />

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
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? 'bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                    : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'
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
           <button
             onClick={() => setIsModalOpen(true)}
             className="w-full py-3 border border-white/10 border-dashed rounded-xl text-slate-400 text-xs font-bold uppercase tracking-wider hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
           >
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
                  <div className={`max-w-[85%] rounded-2xl p-6 ${
                     msg.role === 'user' 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                        : 'bg-white/5 border border-white/10 text-slate-200 shadow-xl'
                  }`}>
                     <div className="prose prose-invert prose-sm">
                        {msg.text.split('\n').map((line, i) => {
                             if (line.trim().startsWith('- ')) return <li key={i} className="ml-4 list-disc marker:text-indigo-400">{line.substring(2)}</li>
                             if (line.includes('[Source')) return <p key={i} className="text-indigo-300 mb-2 font-mono text-xs">{line}</p>
                             return <p key={i} className="mb-2 last:mb-0 leading-relaxed">{line}</p>
                        })}
                     </div>
                  </div>
               </div>
            ))}
            {isSynthesizing && (
               <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                     <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
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
                    {loadingSuggestions ? (
                        <div className="px-4 py-2 text-xs text-slate-500 animate-pulse flex items-center gap-2">
                             <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             Generating insights...
                        </div>
                    ) : suggestedQuestions.length > 0 ? (
                        suggestedQuestions.map((question, i) => (
                             <button
                                key={i}
                                onClick={() => handleSynthesize(question)}
                                className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white hover:border-indigo-500/50 transition-all"
                             >
                                ✨ {question}
                             </button>
                        ))
                    ) : (
                        // Fallback static buttons
                        <>
                            <button onClick={() => handleSynthesize("Summarize the key themes across these papers.")} className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white hover:border-indigo-500/50 transition-all">
                                ✨ Summarize Themes
                            </button>
                            <button onClick={() => handleSynthesize("What are the conflicting viewpoints between these sources?")} className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white hover:border-rose-500/50 transition-all">
                                ⚔️ Find Contradictions
                            </button>
                            <button onClick={() => handleSynthesize("Based on these papers, propose a new research direction.")} className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white hover:border-emerald-500/50 transition-all">
                                🚀 Propose Future Work
                            </button>
                        </>
                    )}
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
               >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               </button>
            </div>
            <div className="flex justify-between items-center mt-3 px-2">
                <span className="text-[10px] text-slate-500 font-mono">
                    {selectedIds.size} SOURCES ACTIVE
                </span>
                <span className="text-[10px] text-indigo-400/80 font-mono flex items-center gap-2">
                    <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                    POWERED BY GEMINI 1.5 PRO
                </span>
            </div>
         </div>
      </div>
    </div>
  );
};