import React, { useState, useEffect } from 'react';
import { skillService } from '@/services/skillService';
import { Skill } from '../types';

export const ToolFabric: React.FC = () => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newSkill, setNewSkill] = useState<Partial<Skill>>({
        id: '',
        name: '',
        description: '',
        code: 'def my_function(args):\n    # logic here\n    return result',
        arguments: {}
    });

    const loadSkills = async () => {
        const loaded = await skillService.getAllSkills();
        setSkills(loaded);
    };

    useEffect(() => {
        loadSkills();
    }, []);

    const handleSave = async () => {
        if (!newSkill.id || !newSkill.name) return;

        const skill: Skill = {
            id: newSkill.id,
            name: newSkill.name || 'Untitled',
            description: newSkill.description || '',
            code: newSkill.code || '',
            arguments: newSkill.arguments || {},
            timestamp: Date.now()
        };

        await skillService.registerSkill(skill);
        await loadSkills();
        setIsAdding(false);
        setNewSkill({ id: '', name: '', code: '' });
    };

    const handleDelete = async (id: string) => {
        if (confirm('Forget this skill?')) {
            await skillService.deleteSkill(id);
            loadSkills();
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-end mb-8 relative z-10">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                        <span className="bg-orange-600 text-[10px] px-2 py-1 rounded-full text-white tracking-widest uppercase">Motor Cortex</span>
                        Skill Registry
                    </h2>
                    <p className="text-slate-400 text-sm max-w-lg">
                        The Synapse "Hands". These Python tools are available for the Agent to execute in the Sandbox.
                    </p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-sm tracking-wider transition-all shadow-[0_0_20px_rgba(234,88,12,0.3)] flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    TEACH NEW SKILL
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 pb-20">
                {isAdding && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white/5 border border-orange-500/50 rounded-2xl p-6 animate-in fade-in zoom-in-95 duration-300">
                        <h3 className="text-orange-400 font-bold mb-4">Define New Capability</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <input
                                placeholder="Skill ID (e.g. scrape_linkedin)"
                                className="bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm font-mono focus:border-orange-500 outline-none"
                                value={newSkill.id}
                                onChange={e => setNewSkill({ ...newSkill, id: e.target.value })}
                            />
                            <input
                                placeholder="Human Name (e.g. Scrape LinkedIn Profile)"
                                className="bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-orange-500 outline-none"
                                value={newSkill.name}
                                onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                            />
                        </div>
                        <textarea
                            placeholder="Description"
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm mb-4 focus:border-orange-500 outline-none"
                            value={newSkill.description}
                            onChange={e => setNewSkill({ ...newSkill, description: e.target.value })}
                        />
                        <textarea
                            placeholder="Python Code"
                            className="w-full h-40 bg-black/80 border border-white/10 rounded-lg p-4 text-emerald-400 font-mono text-xs mb-4 focus:border-orange-500 outline-none"
                            value={newSkill.code}
                            onChange={e => setNewSkill({ ...newSkill, code: e.target.value })}
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                            <button onClick={handleSave} className="bg-orange-600 hover:bg-orange-500 px-6 py-2 rounded-lg text-white font-bold">Save Skill</button>
                        </div>
                    </div>
                )}

                {skills.map(skill => (
                    <div key={skill.id} className="bg-slate-900/50 border border-white/5 hover:border-orange-500/30 rounded-2xl p-5 group transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDelete(skill.id)} className="text-red-500 hover:text-red-400" aria-label="Delete Skill">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-white leading-tight">{skill.name}</h3>
                                <p className="text-xs text-slate-500 font-mono mt-1">{skill.id}</p>
                            </div>
                        </div>

                        <p className="text-slate-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">{skill.description}</p>

                        <div className="bg-black/50 rounded-lg p-3 border border-white/5">
                            <pre className="text-[10px] text-emerald-500 font-mono overflow-x-hidden line-clamp-4">
                                {skill.code}
                            </pre>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
