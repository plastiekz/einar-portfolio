import { activateVanguard } from '@/services/geminiService';
import { findFirms } from '@/services/legalAgent';
import { findDeals } from '@/services/marketplaceAgent';
import { VanguardReport, LawFirm, MarketplaceDeal } from '@/types';
import React, { useState } from 'react';
import RiskThermometer from './RiskThermometer';

function AgentCommandCenter() {
    const [viewMode, setViewMode] = useState<'VANGUARD' | 'FIELD_OPS'>('VANGUARD');

    // Vanguard State
    const [target, setTarget] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [report, setReport] = useState<VanguardReport | null>(null);

    // Field Ops State
    const [fieldQuery, setFieldQuery] = useState('');
    const [isFieldActive, setIsFieldActive] = useState(false);
    const [legalResults, setLegalResults] = useState<LawFirm[]>([]);
    const [marketResults, setMarketResults] = useState<MarketplaceDeal[]>([]);
    const [fieldLogs, setFieldLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const addFieldLog = (msg: string) => {
        setFieldLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const handleDeployVanguard = async () => {
        if (!target.trim()) return;

        setIsActive(true);
        setLogs([]);
        setReport(null);

        addLog(`INITIALIZING VANGUARD PROTOCOL...`);
        addLog(`TARGET LOCKED: ${target}`);

        try {
            addLog(`> DEPLOYING RECON DRONES (GOOGLE SEARCH)...`);
            await new Promise(r => setTimeout(r, 800));
            addLog(`> SCANNING ROBOTS.TXT & TOS...`);

            await new Promise(r => setTimeout(r, 1200));
            addLog(`> ANALYZING LEGAL BOUNDARIES...`);

            const data = await activateVanguard(target);

            addLog(`> MCP ARCHITECTURE GENERATED.`);
            addLog(`MISSION COMPLETE. DATA RETRIEVED.`);
            setReport(data);
        } catch (error) {
            addLog(`[ERROR] MISSION FAILED: ${error}`);
        } finally {
            setIsActive(false);
        }
    };

    const handleDeployFieldOps = async () => {
        if (!fieldQuery.trim()) return;

        setIsFieldActive(true);
        setLegalResults([]);
        setMarketResults([]);
        setFieldLogs([]);

        addFieldLog(`INITIALIZING FIELD OPERATIONS...`);
        addFieldLog(`QUERY: "${fieldQuery}"`);

        try {
            // Run both agents in parallel
            const p1 = (async () => {
                addFieldLog(`> DEPLOYING LEGAL AGENT (Antwerp Grid)...`);
                const firms = await findFirms(fieldQuery);
                addFieldLog(`> LEGAL AGENT REPORTING: ${firms.length} CANDIDATES FOUND.`);
                setLegalResults(firms);
            })();

            const p2 = (async () => {
                addFieldLog(`> DEPLOYING MARKETPLACE AGENT (Arbitrage Scanners)...`);
                const deals = await findDeals(fieldQuery, "Antwerp");
                addFieldLog(`> MARKETPLACE AGENT REPORTING: ${deals.length} DEALS FOUND.`);
                setMarketResults(deals);
            })();

            await Promise.all([p1, p2]);
            addFieldLog(`ALL FIELD AGENTS REPORTING SUCCESS.`);

        } catch (error) {
            addFieldLog(`[ERROR] FIELD OPS FAILED: ${error}`);
        } finally {
            setIsFieldActive(false);
        }
    };

    const exportToCSV = () => {
        // Simple CSV export for demo
        const header = "Name,Address,Zip,Website\n";
        const rows = legalResults.map(f => `"${f.name}","${f.address}","${f.zip}","${f.website || ''}"`).join("\n");
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `legal_firms_${new Date().getTime()}.csv`;
        a.click();
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 text-slate-200 font-sans overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                    <h1 className="text-xl font-bold tracking-widest text-slate-100">
                        AGENT COMMAND <span className="text-emerald-500"> //</span> {viewMode}
                    </h1>
                </div>

                {/* View Toggles */}
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
                    <button
                        onClick={() => setViewMode('VANGUARD')}
                        className={`px-4 py-1 text-xs font-mono rounded-md transition-all ${viewMode === 'VANGUARD' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        VANGUARD
                    </button>
                    <button
                        onClick={() => setViewMode('FIELD_OPS')}
                        className={`px-4 py-1 text-xs font-mono rounded-md transition-all ${viewMode === 'FIELD_OPS' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        FIELD OPS
                    </button>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                    <span>STATUS: {(isActive || isFieldActive) ? 'ACTIVE DUTY' : 'STANDBY'}</span>
                    <span>ID: 882-ALPHA</span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8 grid grid-cols-12 gap-6">

                {/* VANGUARD VIEW */}
                {viewMode === 'VANGUARD' && (
                    <>
                        {/* Left Column: Controls & Console (4 cols) */}
                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

                            {/* Input Module */}
                            <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-xl">
                                <label className="text-xs font-mono text-slate-400 mb-2 block uppercase tracking-wider">Target Designation</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={target}
                                        onChange={(e) => setTarget(e.target.value)}
                                        placeholder="e.g. 'Anthropic API Docs' or 'example.com'"
                                        className="flex-1 bg-slate-800 border border-slate-600 text-slate-100 px-4 py-2 rounded-lg font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-600"
                                        onKeyDown={(e) => e.key === 'Enter' && handleDeployVanguard()} />
                                    <button
                                        onClick={handleDeployVanguard}
                                        disabled={isActive || !target}
                                        className={`px-6 py-2 rounded-lg font-bold text-sm tracking-wide transition-all
                                    ${isActive
                                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)] hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]'}`}
                                    >
                                        {isActive ? 'SCANNING' : 'DEPLOY'}
                                    </button>
                                </div>
                            </div>

                            {/* Console Log */}
                            <div className="flex-1 bg-black border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-hidden flex flex-col min-h-[300px]">
                                <div className="border-b border-slate-800 pb-2 mb-2 text-slate-500 uppercase tracking-widest flex justify-between">
                                    <span>Terminal Output</span>
                                    <span className="animate-pulse">_</span>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-2 text-slate-400 custom-scrollbar">
                                    {logs.map((log, i) => (
                                        <div key={i} className="break-words">
                                            <span className="text-emerald-900 mr-2">$</span>
                                            {log}
                                        </div>
                                    ))}
                                    {isActive && (
                                        <div className="animate-pulse text-emerald-500">_</div>
                                    )}
                                </div>
                            </div>

                            {/* Risk Thermometer (Only show if we have data) */}
                            {report && (
                                <RiskThermometer value={report.riskLevel} label={report.riskLabel} />
                            )}
                        </div>

                        {/* Right Column: Intel & Strategy (8 cols) */}
                        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                            {!report ? (
                                <div className="h-full border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-700 font-mono text-sm">
                                    AWAITING TARGET DESIGNATION...
                                </div>
                            ) : (
                                <>
                                    {/* Strategy Card */}
                                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                                                <span className="text-emerald-500">⬢</span>
                                                STRATEGIC POLICY
                                            </h2>
                                            <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                                                TARGET: {report.url || report.target}
                                            </span>
                                        </div>

                                        <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                                            <p className="whitespace-pre-line">{report.strategy}</p>
                                        </div>

                                        {/* Boundaries */}
                                        <div className="mt-6">
                                            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">Legal Constraints Detected</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {report.legalBoundaries.map((b, i) => (
                                                    <span key={i} className="px-3 py-1 bg-red-900/20 border border-red-900/50 text-red-400 text-xs rounded-full">
                                                        {b}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* MCP Config Editor */}
                                    <div className="flex-1 bg-[#1e1e1e] border border-slate-700 rounded-xl overflow-hidden flex flex-col min-h-[400px]">
                                        <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between border-b border-black">
                                            <span className="text-xs font-mono text-slate-400">mcp_server_config.json</span>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(report.mcpConfig)}
                                                className="text-xs text-slate-400 hover:text-white transition-colors"
                                            >
                                                COPY CONFIG
                                            </button>
                                        </div>
                                        <div className="p-4 overflow-auto custom-scrollbar flex-1">
                                            <pre className="font-mono text-xs text-blue-300 whitespace-pre-wrap">
                                                {report.mcpConfig}
                                            </pre>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}

                {/* FIELD OPS VIEW */}
                {viewMode === 'FIELD_OPS' && (
                    <>
                        {/* Control Panel */}
                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                            <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-xl">
                                <label className="text-xs font-mono text-slate-400 mb-2 block uppercase tracking-wider">Operation Query</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={fieldQuery}
                                        onChange={(e) => setFieldQuery(e.target.value)}
                                        placeholder="e.g. 'Medical Malpractice' or 'MacBook'"
                                        className="flex-1 bg-slate-800 border border-slate-600 text-slate-100 px-4 py-2 rounded-lg font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-600"
                                        onKeyDown={(e) => e.key === 'Enter' && handleDeployFieldOps()} />
                                    <button
                                        onClick={handleDeployFieldOps}
                                        disabled={isFieldActive || !fieldQuery}
                                        className={`px-6 py-2 rounded-lg font-bold text-sm tracking-wide transition-all
                                    ${isFieldActive
                                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'}`}
                                    >
                                        {isFieldActive ? 'OPERATING' : 'EXECUTE'}
                                    </button>
                                </div>
                            </div>

                            {/* Field Logs */}
                             <div className="flex-1 bg-black border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-hidden flex flex-col min-h-[300px]">
                                <div className="border-b border-slate-800 pb-2 mb-2 text-slate-500 uppercase tracking-widest flex justify-between">
                                    <span>Field Operations Log</span>
                                    <span className="animate-pulse">_</span>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-2 text-slate-400 custom-scrollbar">
                                    {fieldLogs.map((log, i) => (
                                        <div key={i} className="break-words">
                                            <span className="text-blue-900 mr-2">$</span>
                                            {log}
                                        </div>
                                    ))}
                                    {isFieldActive && (
                                        <div className="animate-pulse text-blue-500">_</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Results Panel */}
                        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
                             {/* Tabs for Results */}
                             <div className="flex-1 flex flex-col gap-6 overflow-y-auto">

                                {/* Legal Agent Results */}
                                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                                            <span className="text-blue-500">⚖️</span>
                                            LEGAL INTELLIGENCE
                                        </h2>
                                        {legalResults.length > 0 && (
                                            <button
                                                onClick={exportToCSV}
                                                className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-slate-300"
                                            >
                                                EXPORT CSV
                                            </button>
                                        )}
                                    </div>

                                    {legalResults.length === 0 ? (
                                        <div className="text-slate-500 text-sm font-mono italic">No legal entities detected.</div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left text-slate-400">
                                                <thead className="text-xs text-slate-500 uppercase bg-slate-800">
                                                    <tr>
                                                        <th className="px-4 py-3">Firm Name</th>
                                                        <th className="px-4 py-3">Zip</th>
                                                        <th className="px-4 py-3">Website</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {legalResults.map((firm, i) => (
                                                        <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                                                            <td className="px-4 py-3 font-medium text-slate-200">{firm.name}</td>
                                                            <td className="px-4 py-3">{firm.zip}</td>
                                                            <td className="px-4 py-3 text-blue-400 truncate max-w-[200px]">
                                                                <a href={firm.website} target="_blank" rel="noreferrer" className="hover:underline">
                                                                    {firm.website}
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* Marketplace Results */}
                                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                                            <span className="text-yellow-500">💰</span>
                                            MARKET ARBITRAGE
                                        </h2>
                                    </div>

                                    {marketResults.length === 0 ? (
                                        <div className="text-slate-500 text-sm font-mono italic">No market opportunities detected.</div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {marketResults.map((deal, i) => (
                                                <div key={i} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-slate-200">{deal.title}</h4>
                                                        <div className="text-green-400 font-mono text-lg">{deal.price}</div>
                                                        <div className="text-xs text-slate-500 mt-1">{deal.platform}</div>
                                                    </div>
                                                    <div className="bg-slate-900 px-2 py-1 rounded text-xs font-mono text-yellow-500 border border-yellow-500/30">
                                                        SCORE: {deal.aiScore}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                             </div>
                        </div>
                    </>
                )}

            </main>
        </div>
    );
}

export default AgentCommandCenter;
