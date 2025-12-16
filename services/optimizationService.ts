import { vectorStore } from './vectorStore';
import { synthesizeAxioms } from './geminiService';

export interface OptimizationResult {
    analyzedCount: number;
    insights: string[];
    axioms: string[];
    timestamp: string;
}

export const runOptimizationCycle = async (limit: number = 20): Promise<OptimizationResult> => {
    try {
        // 1. Audit: Fetch recent memories
        console.log(`[Optimization] Fetching top ${limit} recent memories...`);
        const docs = await vectorStore.getRecentDocuments(limit);

        if (docs.length === 0) {
            return {
                analyzedCount: 0,
                insights: ["No valid memories found to optimize."],
                axioms: [],
                timestamp: new Date().toISOString()
            };
        }

        // 2. Prepare Inputs
        const inputs = docs.map(d => {
            const date = new Date(d.timestamp).toISOString();
            // Format: [2025-11-25] [Source] Text fragment
            return `[${date}] [${d.metadata.source || 'Unknown'}] ${d.text.substring(0, 300)}...`;
        });

        // 3. Compress & Synthesize
        console.log("[Optimization] Synthesizing axioms...");
        const result = await synthesizeAxioms(inputs);

        return {
            analyzedCount: docs.length,
            insights: result.insights,
            axioms: result.axioms,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error("Optimization Cycle Failed:", error);
        throw error;
    }
};
