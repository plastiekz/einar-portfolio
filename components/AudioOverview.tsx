import React, { useState, useEffect } from 'react';
import { PodcastTurn } from '../types';

interface AudioOverviewProps {
    script: PodcastTurn[] | null;
    isLoading: boolean;
    onGenerate: () => void;
}

export const AudioOverview: React.FC<AudioOverviewProps> = ({ script, isLoading, onGenerate }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentLine, setCurrentLine] = useState(-1);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && script) {
            interval = setInterval(() => {
                setCurrentLine(prev => {
                    if (prev >= script.length - 1) {
                        setIsPlaying(false);
                        return -1;
                    }
                    return prev + 1;
                });
            }, 3000); // Simulate reading speed (3s per turn)
        }
        return () => clearInterval(interval);
    }, [isPlaying, script]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <div className="flex gap-1 items-end h-8">
                    <span className="w-1.5 bg-indigo-500 rounded-full animate-[bounce_1s_infinite] h-4"></span>
                    <span className="w-1.5 bg-indigo-500 rounded-full animate-[bounce_1.2s_infinite] h-8"></span>
                    <span className="w-1.5 bg-indigo-500 rounded-full animate-[bounce_0.8s_infinite] h-6"></span>
                    <span className="w-1.5 bg-indigo-500 rounded-full animate-[bounce_1.1s_infinite] h-3"></span>
                </div>
                <p className="text-sm font-mono tracking-widest uppercase">Synthesizing Audio Overview...</p>
            </div>
        );
    }

    if (!script) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="p-6 bg-white/5 rounded-full border border-white/10">
                    <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </div>
                <div className="text-center max-w-md px-6">
                    <h3 className="text-white font-bold mb-2">Generate Audio Overview</h3>
                    <p className="text-slate-400 text-sm mb-6">Create a "Deep Dive" conversation between two AI hosts discussing your selected sources. Great for understanding complex connections.</p>
                    <button
                        onClick={onGenerate}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-900/30 transition-all flex items-center gap-2 mx-auto"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Generate Podcast
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Player Controls */}
            <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-12 h-12 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center shadow-lg transition-all"
                    >
                        {isPlaying ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : (
                            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                        )}
                    </button>
                    <div>
                        <h3 className="text-white font-bold text-sm">Deep Dive Episode</h3>
                        <p className="text-xs text-indigo-300 font-mono">SYNAPSE AUDIO • 5 MIN LISTEN</p>
                    </div>
                </div>
                <div className="flex gap-1 h-8 items-center opacity-50">
                     {/* Fake visualizer */}
                     {[...Array(8)].map((_,i) => (
                         <div key={i} className={`w-1 bg-white rounded-full transition-all duration-300 ${isPlaying ? 'animate-[pulse_0.5s_ease-in-out_infinite]' : 'h-2'}`} style={{ height: isPlaying ? `20px` : '4px', animationDelay: `${i * 0.1}s` }}></div>
                     ))}
                </div>
            </div>

            {/* Transcript */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                {script.map((turn, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-4 transition-all duration-500 ${currentLine === idx ? 'opacity-100 scale-105' : 'opacity-60 grayscale'}`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                            turn.speaker === 'Host'
                                ? 'bg-indigo-900/50 border-indigo-500/30 text-indigo-300'
                                : 'bg-emerald-900/50 border-emerald-500/30 text-emerald-300'
                        }`}>
                            {turn.speaker === 'Host' ? 'H' : 'E'}
                        </div>
                        <div className="flex-1 pt-2">
                             <h4 className={`text-xs font-bold uppercase mb-1 ${
                                 turn.speaker === 'Host' ? 'text-indigo-400' : 'text-emerald-400'
                             }`}>
                                 {turn.speaker}
                             </h4>
                             <p className="text-slate-200 text-sm leading-relaxed font-serif">
                                 {turn.text}
                             </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
