import React, { useState } from 'react';
import { runOptimizationCycle, OptimizationResult } from '@/services/optimizationService';
import { analyzeStrategy } from '@/services/metaService';
import { StrategicPlan } from '@/types';

type DashboardTab = 'CONSOLIDATION' | 'STRATEGY';

export function OptimizationDashboard() {
    const [activeTab, setActiveTab] = useState<DashboardTab>('CONSOLIDATION');
    const [isLoading, setIsLoading] = useState(false);

    // Tier 2 State
    const [result, setResult] = useState<OptimizationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    void error; // Using void operator to suppress unused var check cleaner than directive or assignment

    // Tier 4 State
    const [strategicGoal, setStrategicGoal] = useState("Increase Fiverr Gig Visibility");
    const [problemContext, setProblemContext] = useState("My gigs have 0 impressions. I need a visibility turnaround.");
    const [strategyResult, setStrategyResult] = useState<StrategicPlan | null>(null);

    // Tier 2 Handler
    const handleOptimize = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const res = await runOptimizationCycle(20);
            setResult(res);
        } catch {
            setError("Optimization failed due to an internal error.");
        } finally {
            setIsLoading(false);
        }
    };

    // Tier 4 Handler
    const handleStrategicAnalysis = async () => {
        setIsLoading(true);
        try {
            const plan = await analyzeStrategy(strategicGoal, problemContext);
            setStrategyResult(plan);
        } catch (e) {
            console.error(e);
            setError("Strategy analysis failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col h-full">
            {/* Background Ambience */}
            <div className={`absolute top-0 right-0 w-96 h-96 blur-[100px] rounded-full pointer-events-none transition-colors duration-1000 ${activeTab === 'CONSOLIDATION' ? 'bg-cyan-900/10' : 'bg-rose-900/10'}`}></div>

            <div className="relative z-10 flex flex-col h-full">
                {/* Header & Tabs */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                            {activeTab === 'CONSOLIDATION' ? 'Recursive Optimization' : 'Strategic Command'}
                            <span className={`text-[10px] px-2 py-1 rounded-full text-black font-bold tracking-widest ${activeTab === 'CONSOLIDATION' ? 'bg-cyan-500' : 'bg-rose-500'}`}>
                                {activeTab === 'CONSOLIDATION' ? 'TIER 2' : 'TIER 4'}
                            </span>
                        </h2>
                        <p className="text-slate-400 text-sm max-w-lg">
                            {activeTab === 'CONSOLIDATION'
                                ? 'The "Daemon" scans memory to synthesize new axioms.'
                                : 'The "Prefrontal Cortex" performs meta-reasoning to diagnose failures.'}
                        </p>
                    </div>

                    <div className="flex bg-black/50 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                        <button
                            onClick={() => setActiveTab('CONSOLIDATION')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'CONSOLIDATION' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
                        >
                            CONSOLIDATION
                        </button>
                        <button
                            onClick={() => setActiveTab('STRATEGY')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'STRATEGY' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            STRATEGY
                        </button>
                    </div>
                </div>

                {/* TIER 2 VIEW: CONSOLIDATION */}
                {activeTab === 'CONSOLIDATION' && (
                    <div className="flex-1 overflow-y-auto">
                        {!result && !isLoading && (
                            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/5">
                                <button
                                    onClick={handleOptimize}
                                    className="bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-4 rounded-xl font-bold tracking-wider shadow-cyan-500/20 shadow-lg transition-all flex items-center gap-3"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    INITIATE OPTIMIZATION
                                </button>
                                <p className="text-slate-500 text-xs mt-4">Scans last 20 memories for pattern matches</p>
                            </div>
                        )}

                        {isLoading && (
                            <div className="h-64 flex flex-col items-center justify-center">
                                <div className="animate-spin text-cyan-500 mb-4">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                </div>
                                <p className="text-cyan-400 font-mono text-sm animate-pulse">RUNNING DIAGNOSTICS...</p>
                            </div>
                        )}

                        {result && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Daemon Insights</h3>
                                            <span className="text-xs text-slate-500 font-mono">SCANNED {result.analyzedCount} VECTORS</span>
                                        </div>
                                    </div>
                                    <ul className="space-y-4">
                                        {result.insights.map((insight, idx) => (
                                            <li key={idx} className="flex gap-3 text-sm text-slate-300">
                                                <span className="text-purple-500 font-bold">0{idx + 1}.</span>
                                                {insight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-gradient-to-br from-cyan-900/20 to-slate-900/50 border border-cyan-500/30 rounded-2xl p-6 relative group">
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-500 text-black text-[10px] font-bold tracking-widest uppercase rounded-bl-xl">Patch Available</div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Proposed Axioms</h3>
                                            <span className="text-xs text-slate-500 font-mono">APPEND TO UNIVERSAL_AGENT_MEMORY.MD</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4 mb-6">
                                        {result.axioms.map((axiom, idx) => (
                                            <div key={idx} className="p-4 bg-black/40 rounded-lg border border-cyan-500/20 font-mono text-xs text-cyan-300">
                                                {axiom}
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => copyToClipboard(result.axioms.join('\n\n'))} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white uppercase tracking-widest transition-all text-center">Copy Patch</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TIER 4 VIEW: STRATEGIC COMMAND */}
                {activeTab === 'STRATEGY' && (
                    <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Input Panel */}
                        <div className="col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 h-fit">
                            <h3 className="text-rose-400 font-bold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                Mission Parameters
                            </h3>

                            <label className="block text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">Strategic Goal</label>
                            <input
                                aria-label="Strategic Goal"
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm mb-4 focus:border-rose-500 outline-none"
                                value={strategicGoal}
                                onChange={(e) => setStrategicGoal(e.target.value)} />

                            <label className="block text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">Problem Context</label>
                            <textarea
                                aria-label="Problem Context"
                                className="w-full h-32 bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm mb-6 focus:border-rose-500 outline-none resize-none"
                                value={problemContext}
                                onChange={(e) => setProblemContext(e.target.value)} />

                            <button
                                onClick={handleStrategicAnalysis}
                                disabled={isLoading}
                                className="w-full bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-lg font-bold text-sm shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'ANALYZING...' : 'RUN STRATEGIC DIAGNOSIS'}
                            </button>
                        </div>

                        {/* Output Panel */}
                        <div className="col-span-1 lg:col-span-2">
                            {isLoading && (
                                <div className="h-full flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-2xl">
                                    <div className="animate-spin text-rose-500 mb-4"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
                                    <p className="text-rose-400 font-mono text-xs animate-pulse">PREFRONTAL CORTEX ACTIVE...</p>
                                </div>
                            )}

                            {!strategyResult && !isLoading && (
                                <div className="h-full flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-2xl opacity-50">
                                    <p className="text-slate-400 text-sm">Awaiting Mission Parameters...</p>
                                </div>
                            )}

                            {strategyResult && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                    {/* Diagnosis Card */}
                                    <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-6">
                                        <h3 className="text-rose-400 font-black uppercase tracking-widest text-xs mb-2">Root Cause Diagnosis</h3>
                                        <p className="text-xl text-white font-serif italic leading-relaxed">"{strategyResult.diagnosis}"</p>
                                    </div>

                                    {/* Pivot & Actions */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                            <h3 className="text-slate-400 font-black uppercase tracking-widest text-xs mb-4">Strategic Pivot</h3>
                                            <p className="text-white font-bold text-lg mb-2">{strategyResult.pivot_strategy}</p>
                                            {strategyResult.market_gap && (
                                                <div className="mt-4 p-3 bg-emerald-900/30 border border-emerald-500/30 rounded-lg">
                                                    <span className="text-emerald-400 text-[10px] font-bold uppercase block mb-1">Identified Market Gap</span>
                                                    <p className="text-emerald-100 text-sm">{strategyResult.market_gap}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                            <h3 className="text-slate-400 font-black uppercase tracking-widest text-xs mb-4">Execution Steps</h3>
                                            <ul className="space-y-3">
                                                {strategyResult.action_items.map((item, i) => (
                                                    <li key={i} className="flex gap-3 text-sm text-slate-300">
                                                        <span className="text-rose-500 font-bold">{i + 1}.</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
