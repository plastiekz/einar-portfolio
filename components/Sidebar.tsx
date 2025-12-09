import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: AppView.RESEARCH_FEED, label: 'Paper Feed', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: AppView.RESEARCH_RADAR, label: 'Research Radar', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: AppView.KNOWLEDGE_BASE, label: 'Synapse Memory', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }, 
    { id: AppView.DEEP_DIVE, label: 'Deep Analysis', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  ];

  return (
    <aside className="w-72 bg-black/20 backdrop-blur-xl border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="p-8 flex items-center gap-3">
        <div className="relative">
             <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20 z-10 relative">
               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
             </div>
             <div className="absolute -inset-2 bg-cyan-500/20 blur-lg rounded-full"></div>
        </div>
        <span className="text-xl font-bold tracking-tight text-white font-mono">SYNAPSE</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? item.id === AppView.DEEP_DIVE
                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                    : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {isActive && (
                 <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.id === AppView.DEEP_DIVE ? 'bg-purple-500' : 'bg-cyan-500'}`}></div>
              )}
              
              {item.id === AppView.KNOWLEDGE_BASE ? (
                 <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
              ) : item.id === AppView.DEEP_DIVE ? (
                 <svg className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              ) : (
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
              )}
              <span className="font-medium tracking-wide text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-4">
        {/* New Eco-Monitor */}
        <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/10">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Compute Efficiency</span>
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="w-full bg-emerald-900/30 rounded-full h-1.5 mb-2 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full w-[85%] shadow-[0_0_10px_#10b981]"></div>
            </div>
            <div className="flex justify-between text-[10px] text-emerald-500/80 font-mono">
                <span>OPTIMIZED</span>
                <span>85% GREEN</span>
            </div>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-transparent rounded-xl p-4 border border-white/5 backdrop-blur-sm">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Project Status</p>
          <div className="flex items-center gap-2 mb-1">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></div>
             <span className="text-sm text-slate-200 font-medium">Phase 1 Complete</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">v0.1.0 Alpha Build</p>
        </div>
      </div>
    </aside>
  );
};