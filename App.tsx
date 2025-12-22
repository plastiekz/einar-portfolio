import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { MetricCard } from './components/MetricCard';
import { TrendChart } from './components/TrendChart';
import { PaperFeed } from './components/PaperFeed';
import { ResearchRadar } from './components/ResearchRadar';
import { DeepDive } from './components/DeepDive';
import { KnowledgeBase } from './components/KnowledgeBase';
import AgentCommandCenter from './components/AgentCommandCenter';
import { AppView } from './types';
import { INITIAL_METRICS, MOCK_PAPERS, TREND_DATA } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  // Initialize from localStorage or empty Set
  const [savedPaperIds, setSavedPaperIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('synapse_saved_papers');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      console.error("Failed to load saved papers:", e);
      return new Set();
    }
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('synapse_saved_papers', JSON.stringify(Array.from(savedPaperIds)));
    } catch (e) {
      console.error("Failed to save papers to storage:", e);
    }
  }, [savedPaperIds]);

  const handleToggleSave = useCallback((id: string) => {
    setSavedPaperIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Special handling for full-screen views like Agent Command Center
  if (currentView === AppView.AGENT_COMMAND) {
      return (
          <div className="flex h-screen bg-slate-950">
              <Sidebar currentView={currentView} onChangeView={setCurrentView} />
              <div className="flex-1 overflow-hidden ml-72">
                  <AgentCommandCenter />
              </div>
          </div>
      );
  }

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Platform Overview</h2>
                  <p className="text-slate-400 text-sm mt-1">Real-time neural monitoring active</p>
               </div>
               <div className="text-xs font-mono px-3 py-1 rounded-full border border-white/10 bg-white/5 text-slate-400">
                  SYNC: {new Date().toLocaleDateString()}
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {INITIAL_METRICS.map((metric, idx) => (
                <MetricCard key={idx} metric={metric} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <h3 className="text-lg font-semibold text-white mb-6 relative z-10">Paper Ingestion Rate</h3>
                <TrendChart data={TREND_DATA} />
              </div>
              
              <div className="lg:col-span-1 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                <h3 className="text-lg font-semibold text-white mb-4">Trending Vectors</h3>
                <div className="space-y-3">
                  {['Multimodal Agents', 'Sparse Autoencoders', 'Video Generation', 'State Space Models'].map((topic, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl transition-all cursor-default group">
                      <span className="text-slate-300 group-hover:text-cyan-300 transition-colors">#{topic}</span>
                      <span className="text-xs font-mono text-cyan-400">+{Math.floor(Math.random() * 40)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent High-Signal Papers</h3>
                <button 
                    onClick={() => setCurrentView(AppView.RESEARCH_FEED)}
                    className="text-sm text-cyan-400 hover:text-cyan-300 hover:tracking-wide transition-all"
                >
                    View All →
                </button>
              </div>
              <PaperFeed 
                papers={MOCK_PAPERS.slice(0, 2)} 
                savedPaperIds={savedPaperIds}
                onToggleSave={handleToggleSave}
              />
            </div>
          </div>
        );
      case AppView.RESEARCH_FEED:
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold text-white">Global Research Feed</h2>
                <p className="text-slate-400 mt-2">Aggregated from ArXiv, Hugging Face, and Semantic Scholar</p>
            </div>
            <PaperFeed 
              papers={MOCK_PAPERS} 
              savedPaperIds={savedPaperIds}
              onToggleSave={handleToggleSave}
            />
          </div>
        );
      case AppView.RESEARCH_RADAR:
        return (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                Research Radar
                <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">ONLINE</span>
            </h2>
             <p className="text-slate-400">Secure link to DeepMind Intelligence (Dr. Nexus).</p>
            <ResearchRadar />
          </div>
        );
      case AppView.KNOWLEDGE_BASE:
        return (
            <div className="space-y-4 animate-in fade-in duration-500">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    Synapse Memory
                    <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]">NOTEBOOK</span>
                </h2>
                <p className="text-slate-400">Neural Archive & Synthesis Engine.</p>
                <KnowledgeBase />
            </div>
        );
      case AppView.DEEP_DIVE:
        return (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-white">Deep Analysis Engine</h2>
             <p className="text-slate-400">Generate extensive reports using Gemini 3.0 Pro Thinking Mode.</p>
            <DeepDive />
          </div>
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-cyan-500/30">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      
      <main className="ml-72 p-10 min-h-screen transition-all">
        {/* Top Header / Status Bar */}
        <header className="flex justify-end mb-10">
            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-xl">
                <div className="flex items-center gap-2 text-slate-300 text-xs font-medium tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
                    SYSTEM OPERATIONAL
                </div>
                <div className="w-px h-4 bg-white/10"></div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-lg"></div>
            </div>
        </header>
        
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
