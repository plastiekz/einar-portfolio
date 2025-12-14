import React, { useState } from 'react';
import { realEstateAgent } from '@/services/realEstateAgent';

interface Lead {
    id: string;
    address: string;
    price: number;
    description: string;
    source: string;
    aiScore?: number;
    aiReasoning?: string;
}

export const LeadGenDashboard: React.FC = () => {
    const [location, setLocation] = useState('Springfield, IL');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleSearch = async () => {
        setIsLoading(true);
        setLeads([]);
        try {
            const results = await realEstateAgent.findLeads(location);
            setLeads(results);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        const analyzedLeads = [];
        for (const lead of leads) {
            const res = await realEstateAgent.qualifyLead(lead);
            analyzedLeads.push(res);
            // Update state incrementally for visual effect
            setLeads(prev => {
                const updated = [...prev];
                const index = updated.findIndex(l => l.id === lead.id);
                if (index !== -1) updated[index] = res;
                return updated;
            });
        }
    };

    const handleExport = () => {
        const headers = ["Address", "Price", "Description", "Source", "AI Score", "AI Reasoning"];
        const csvContent = [
            headers.join(','),
            ...leads.map(l => [
                `"${l.address}"`,
                l.price,
                `"${l.description.replace(/"/g, '""')}"`,
                l.source,
                l.aiScore || 0,
                `"${(l.aiReasoning || "").replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'real_estate_leads.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        AI Lead Hunter
                        <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">LIVE</span>
                    </h2>
                    <p className="text-slate-400 text-sm">Automated Real Estate Qualification Engine</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center bg-black/50 border border-white/10 rounded-lg overflow-hidden">
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="bg-transparent text-white px-4 py-2 outline-none w-64 text-sm"
                            placeholder="Target City, State"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={isLoading}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Scanning...' : 'Find Leads'}
                        </button>
                    </div>
                    {leads.length > 0 && !leads[0].aiScore && (
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-900/50 transition-all flex items-center gap-2"
                        >
                            {isAnalyzing ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Qualifying...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    Run AI Analysis
                                </>
                            )}
                        </button>
                    )}

                    {leads.length > 0 && leads[0].aiScore && (
                        <button
                            onClick={handleExport}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-900/50 transition-all flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download CSV
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10">
                {leads.map(lead => (
                    <div key={lead.id} className={`group relative bg-black/20 backdrop-blur-md border rounded-2xl p-6 transition-all duration-500 ${lead.aiScore && lead.aiScore > 75
                        ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-emerald-950/20'
                        : 'border-white/10 hover:border-white/20'
                        }`}>
                        {lead.aiScore && (
                            <div className={`absolute top-4 right-4 text-2xl font-black ${lead.aiScore > 75 ? 'text-emerald-400' : lead.aiScore < 40 ? 'text-rose-400' : 'text-amber-400'
                                }`}>
                                {lead.aiScore}%
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-white font-bold text-lg">{lead.address}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-slate-400 text-sm font-mono">${lead.price.toLocaleString()}</span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-slate-300">{lead.source}</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                            "{lead.description}"
                        </p>

                        {lead.aiReasoning && (
                            <div className={`text-xs p-3 rounded-lg border ${lead.aiScore && lead.aiScore > 75
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                                : 'bg-white/5 border-white/10 text-slate-400'}`}>
                                <strong className="block mb-1 uppercase tracking-widest opacity-75">AI Reasoning</strong>
                                {lead.aiReasoning}
                            </div>
                        )}

                        {!lead.aiScore && (
                            <div className="text-xs text-slate-600 italic mt-4 text-center">
                                Awaiting Analysis...
                            </div>
                        )}
                    </div>
                ))}

                {leads.length === 0 && !isLoading && (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl">
                        <p className="text-slate-500 font-bold">No Leads Loaded</p>
                        <p className="text-slate-600 text-sm">Enter a location and click "Find Leads"</p>
                    </div>
                )}
            </div>
        </div>
    );
};
