import React, { useState, useRef, useEffect } from 'react';
import { generateDeepMindBriefing } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

interface RadarMessage {
  id: string;
  type: 'user' | 'system' | 'briefing';
  text: string;
  sources?: Array<{ title: string; uri: string }>;
  timestamp: Date;
}

export const ResearchRadar: React.FC = () => {
  const [messages, setMessages] = useState<RadarMessage[]>([
    {
      id: 'init',
      type: 'system',
      text: ">> CONNECTION ESTABLISHED: SECURE CHANNEL\n>> IDENTITY VERIFIED: PRINCIPAL ENGINEER [YOU]\n>> AGENT: DR. NEXUS (DEEPMIND)\n>> STATUS: AWAITING TARGET VECTOR...",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScan = async () => {
    if (!input.trim()) return;

    const userMsg: RadarMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: `TARGET VECTOR: ${input.toUpperCase()}`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsScanning(true);

    // Mock scanning steps for effect
    setTimeout(() => {
        setMessages(prev => [...prev, { id: 'scan-1', type: 'system', text: ">> INITIATING GLOBAL SCAN...", timestamp: new Date() }]);
    }, 500);

    try {
      const response: GenerateContentResponse = await generateDeepMindBriefing(userMsg.text);
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = groundingChunks?.map((chunk: any) => ({
          title: chunk.web?.title || 'Classified Source',
          uri: chunk.web?.uri || '#'
      })).filter((s: any) => s.uri !== '#') || [];

      const briefingMsg: RadarMessage = {
        id: (Date.now() + 1).toString(),
        type: 'briefing',
        text: response.text || ">> ERROR: SIGNAL LOST.",
        sources: sources,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, briefingMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: 'error',
        type: 'system',
        text: ">> CRITICAL FAILURE: NETWORK INTERRUPTED.",
        timestamp: new Date()
      }]);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-black/40 rounded-xl border border-emerald-500/30 overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.1)] relative">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 z-0 opacity-10" 
           style={{ backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* Header */}
      <div className="p-4 bg-black/60 border-b border-emerald-500/30 flex justify-between items-center backdrop-blur-md z-10">
        <h3 className="font-mono text-emerald-400 font-bold flex items-center gap-2 tracking-widest">
          <span className="w-3 h-3 bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
          RESEARCH_RADAR // DEEPMIND_LINK
        </h3>
        <span className="text-[10px] font-mono text-emerald-600 border border-emerald-900 px-2 py-0.5 rounded uppercase">
          Latency: 12ms | Encryption: AES-256
        </span>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 font-mono text-sm scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} animate-in fade-in duration-300`}>
            
            {/* Message Bubble */}
            <div className={`max-w-[90%] p-4 border backdrop-blur-sm
              ${msg.type === 'user' 
                ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-100 rounded-bl-xl rounded-tl-xl rounded-tr-xl' 
                : msg.type === 'system'
                  ? 'text-emerald-500/80 border-transparent text-xs'
                  : 'bg-black/80 border-emerald-500/30 text-emerald-300 rounded-br-xl rounded-tl-xl rounded-tr-xl shadow-[0_0_20px_rgba(0,0,0,0.5)]'
              }`}>
              
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.text.split('\n').map((line, i) => {
                    // Styling headers in the briefing
                    if (line.includes('::')) return <div key={i} className="text-emerald-400 font-bold mt-4 mb-2 border-b border-emerald-800 pb-1">{line}</div>;
                    if (line.includes('>>')) return <div key={i} className="pl-4 border-l-2 border-emerald-500/30 mb-1">{line}</div>;
                    return <div key={i}>{line}</div>;
                })}
              </div>

              {/* Source Footnotes for Briefing */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-2 border-t border-emerald-900/50 grid grid-cols-2 gap-2">
                  {msg.sources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[10px] text-emerald-600 hover:text-emerald-400 truncate flex items-center gap-1 transition-colors"
                    >
                      [{idx + 1}] {source.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
            
            <span className="text-[10px] text-emerald-800 mt-1 uppercase">
              {msg.timestamp.toLocaleTimeString()} // {msg.type}
            </span>
          </div>
        ))}
        
        {isScanning && (
            <div className="flex items-center gap-2 text-emerald-500/50 text-xs font-mono animate-pulse">
                <span>[SCANNING_NEURAL_PATHWAYS]</span>
                <span className="inline-block w-1 h-3 bg-emerald-500/50"></span>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Console */}
      <div className="p-4 bg-black/80 border-t border-emerald-500/30 z-10">
        <div className="flex gap-2 items-center">
          <span className="text-emerald-500 font-mono text-lg">{'>'}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isScanning && handleScan()}
            placeholder="ENTER TARGET RESEARCH VECTOR (e.g., 'Agentic Reasoning')..."
            className="flex-1 bg-transparent border-none text-emerald-100 font-mono focus:outline-none placeholder-emerald-800 uppercase"
            disabled={isScanning}
            autoFocus
          />
          <button
            onClick={handleScan}
            disabled={isScanning || !input.trim()}
            className="px-6 py-2 bg-emerald-900/30 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500 hover:text-black font-mono text-xs tracking-widest transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning ? 'EXECUTING...' : 'INITIATE'}
          </button>
        </div>
      </div>
    </div>
  );
};
