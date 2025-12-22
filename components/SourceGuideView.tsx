import React from 'react';
import { SourceGuide } from '../types';

interface SourceGuideProps {
    guide: SourceGuide | null;
    isLoading: boolean;
    onSelectQuestion: (question: string) => void;
}

export const SourceGuideView: React.FC<SourceGuideProps> = ({ guide, isLoading, onSelectQuestion }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <div className="flex gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                </div>
                <p className="text-sm font-mono tracking-widest uppercase">Analyzing Source Material...</p>
            </div>
        );
    }

    if (!guide) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <p className="text-sm">Select sources to generate a guide.</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-6 space-y-8 scrollbar-thin">
            {/* Executive Summary */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                    Executive Summary
                </h3>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-slate-200 leading-relaxed text-sm">
                    {guide.summary}
                </div>
            </section>

            {/* Key Topics */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    Key Topics
                </h3>
                <div className="grid gap-4">
                    {guide.keyTopics.map((topic, idx) => (
                        <div key={idx} className="bg-black/20 border border-white/5 rounded-xl p-4 hover:border-indigo-500/30 transition-all">
                            <h4 className="text-indigo-300 font-bold text-sm mb-1">{topic.name}</h4>
                            <p className="text-slate-400 text-xs">{topic.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Suggested Questions */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Deep Dive Questions
                </h3>
                <div className="flex flex-wrap gap-2">
                    {guide.suggestedQuestions.map((q, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSelectQuestion(q)}
                            className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/20 rounded-full text-xs font-medium transition-all text-left"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
};
