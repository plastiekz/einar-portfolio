import { GoogleGenAI } from "@google/genai";
import { StrategicPlan } from "./types";

const getAI = () => {
    const key = process.env.API_KEY;
    if (!key) throw new Error("API Key is missing");
    return new GoogleGenAI({ apiKey: key });
};

export async function analyzeStrategy(goal: string,
    problemContext: string,
    currentMetrics?: Record<string, any>): Promise<StrategicPlan> {
    try {
        const ai = getAI();

        const systemPrompt = `
        ROLE: You are the "Prefrontal Cortex" of an advanced AI Agent.
        Your job is META-REASONING and STRATEGIC DIAGNOSIS.
        You do not execute code. You analyze *why* execution is failing and propose *structural* changes.

        ARCHETYPE: McKinsey Senior Partner + DeepMind Principal Researcher.

        TASK:
        1. Analyze the User's Goal and current Failure Mode (Problem Context).
        2. Diagnosis: distinct from the symptom. Find the ROOT CAUSE (e.g. "Market Saturation", "Wrong Keyword Strategy", "Pricing Mismatch").
        3. Pivot: A high-level strategic shift.
        4. Action Items: 3-5 concrete steps to execute the pivot.

        OUTPUT FORMAT: JSON only.
        {
            "diagnosis": "string",
            "pivot_strategy": "string",
            "market_gap": "string",
            "action_items": ["string", "string"],
            "confidence_score": number
        }
        `;

        const userPrompt = `
        GOAL: "${goal}"
        CONTEXT/PROBLEM: "${problemContext}"
        METRICS: ${JSON.stringify(currentMetrics || {})}

        Diagnose the failure. Provide a turnaround plan.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as StrategicPlan;
        }
        throw new Error("No strategy generated");

    } catch (error) {
        console.error("Meta-Reasoning Failed:", error);
        return {
            diagnosis: "System Failure in Meta-Layer",
            pivot_strategy: "Manual Intervention Required",
            action_items: ["Check API Keys", "Review Logs"],
            confidence_score: 0
        };
    }
}
