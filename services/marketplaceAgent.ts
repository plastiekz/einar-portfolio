import { GoogleGenAI } from "@google/genai";
import { MarketItem, DealAnalysis } from '../types';

// Initialize Generative AI
// Lazy initialization or dummy key to prevent crash on load
const getGenAI = () => {
    const key = process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!key || key === "dummy_key_for_ui") {
       throw new Error("MarketplaceAgent: API Key is missing. Please set GOOGLE_API_KEY or VITE_GEMINI_API_KEY.");
    }
    return new GoogleGenAI({ apiKey: key });
};

// Mock Data Store
const MOCK_DEALS: MarketItem[] = [
    {
        id: 'mock-1',
        title: 'MacBook Pro M1 2020',
        price: 850,
        location: 'Antwerp',
        url: 'https://2dehands.be/mock/1',
        description: 'Perfect condition, barely used.',
        seller: 'TechUser',
        source: '2dehands.be'
    },
    {
        id: 'mock-2',
        title: 'IKEA Sofa Bed',
        price: 150,
        location: 'Gent',
        url: 'https://2dehands.be/mock/2',
        source: '2dehands.be'
    },
    {
        id: 'mock-3',
        title: 'Sony A7III Camera Body',
        price: 1200,
        location: 'Brussels',
        url: 'https://2dehands.be/mock/3',
        source: '2dehands.be'
    }
];

export class MarketplaceAgent {

    /**
     * Generates a tailored cover letter for a specific deal.
     */
    async generateCoverLetter(item: DealAnalysis, resumeText: string): Promise<string> {
        const prompt = `
         ROLE: Expert Career Coach & Copywriter.
         TASK: Write a highly persuasive, tailored cover letter for this job/deal.

         ITEM DETAILS:
         Title: "${item.title}"
         Seller: "${item.seller}"
         Description: "${item.description || "See URL"}"

         MY RESUME/BIO:
         ${resumeText}

         OUTPUT: Just the letter text. No preamble.
         `;

        try {
            const result = await getGenAI().models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: prompt,
            });
            return result.text || "Failed to generate.";
        } catch (e) {
            console.error("Cover Letter Generation Failed", e);
            return "Error generating cover letter.";
        }
    }

    /**
     * Scrapes 2dehands.be for a given query.
     * MOCKED for Browser Environment.
     */
    async findDeals(query: string, location: string): Promise<MarketItem[]> {
        console.log(`[MarketplaceAgent] Searching for '${query}' in ${location}...`);

        // Return filtered mock data + some generated ones to simulate activity
        const relevant = MOCK_DEALS.filter(d => d.title.toLowerCase().includes(query.toLowerCase()));

        if (relevant.length === 0) {
            // Generate a dynamic mock one
            return [{
                id: `gen-${Date.now()}`,
                title: `${query} (Found by Agent)`,
                price: "Negotiable",
                location: location,
                url: '#',
                source: 'Simulated Market'
            }];
        }

        return relevant;
    }

    /**
     * Analyzes a deal using GenAI.
     */
    async analyzeDeal(item: MarketItem): Promise<DealAnalysis> {
        if (!item || !item.title) return { ...item, aiScore: 0, aiReasoning: "Invalid Item", matchType: "PASS" } as DealAnalysis;

        const prompt = `
        ROLE: Expert Reseller / Buyer Agent.
        GOAL: Evaluate this item.

        ITEM:
        Title: "${item.title}"
        Price: ${item.price}

        TASK:
        Evaluate value. Is it a good deal? Assign score (0-100).

        OUTPUT JSON ONLY:
        {
            "score": number,
            "reasoning": "string",
            "matchType": "STEAL" | "FAIR" | "OVERPRICED" | "PASS"
        }
        `;

        try {
            const result = await getGenAI().models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });

            const text = result.text;
            if (!text) throw new Error("No AI response");

            let aiRes = JSON.parse(text);
            if (Array.isArray(aiRes)) aiRes = aiRes[0];

            return {
                ...item,
                aiScore: aiRes.score,
                aiReasoning: aiRes.reasoning,
                matchType: aiRes.matchType
            };

        } catch (error) {
            console.error("AI Analysis Failed:", error);
            return {
                ...item,
                aiScore: 50,
                aiReasoning: "AI Analysis Failed " + error,
                matchType: "PASS"
            };
        }
    }
}

export const marketplaceAgent = new MarketplaceAgent();

// Helper standalone export for the UI component
export const findDeals = async (query: string, location: string) => {
    const deals = await marketplaceAgent.findDeals(query, location);
    // Enrich with AI analysis in parallel
    const analyzed = await Promise.all(deals.map(d => marketplaceAgent.analyzeDeal(d)));
    return analyzed;
};
