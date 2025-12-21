import { GoogleGenAI } from "@google/genai";
import { policyAgent } from './policyAgent';

interface Lead {
    id: string;
    address: string;
    price: number;
    description: string;
    source: string;
    aiScore?: number;
    aiReasoning?: string;
}

// MOCK DATA: Simulating Zillow/Redfin scrape results
const MOCK_LEADS: Lead[] = [
    {
        id: "1",
        address: "123 Maple St, Springfield",
        price: 250000,
        description: "Fixer upper! Great potential. Owner motivation high, must sell fast due to relocation. Cash offers only.",
        source: "Zillow"
    },
    {
        id: "2",
        address: "456 Oak Ave, Springfield",
        price: 450000,
        description: "Beautifully renovated colonial. New roof, new kitchen. Move-in ready. Firm on price.",
        source: "Redfin"
    },
    {
        id: "3",
        address: "789 Pine Ln, Springfield",
        price: 180000,
        description: "Estate sale. Sold as-is. Needs significant work. Foundation issues noted.",
        source: "Craigslist"
    }
];

class RealEstateAgent {
    private genAI: GoogleGenAI;

    constructor() {
        const key = process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;
        if (!key) throw new Error("API Key is missing via process.env.API_KEY");
        this.genAI = new GoogleGenAI({ apiKey: key });
    }

    /**
     * Simulates finding leads in a specific location.
     * In production, this would use Puppeteer/Playwright.
     */
    async findLeads(location: string): Promise<Lead[]> {
        console.log(`[RealEstateAgent] Searching for properties in ${location}...`);

        const sources = [
            { name: "Zillow", url: `https://www.zillow.com/homes/${location.replace(" ", "-")}` },
            { name: "Redfin", url: `https://www.redfin.com/city/${location.replace(" ", "-")}` },
            { name: "Craigslist", url: `https://${location.replace(" ", "").toLowerCase()}.craigslist.org` }
        ];

        const leads: Lead[] = [];

        for (const source of sources) {
            // Compliance Check in the scraping loop
            const policy = await policyAgent.canFetch(source.url);

            if (policy.allowed) {
                console.log(`[RealEstateAgent] Accessing ${source.name}... (Policy: ${policy.reason})`);
                // Simulate scraping by filtering mock data
                // In production, this would be: await this.scrape(source.url);
                const sourceLeads = MOCK_LEADS.filter(l => l.source === source.name);
                leads.push(...sourceLeads);
            } else {
                console.warn(`[RealEstateAgent] Skipping ${source.name}: ${policy.reason}`);
            }
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return leads;
    }

    /**
     * Uses Gemini to analyze the property description and score it based on "Investor Appeal".
     */
    async qualifyLead(lead: Lead): Promise<Lead> {
        try {
            const prompt = `
            ROLE: Real Estate Investor Analyst.
            TASK: Score this lead from 0-100 based on "Wholesale Deal Potential".

            CRITERIA:
            - High Score (80-100): Distressed, "must sell", fixer-upper, cash only, estate sale.
            - Low Score (0-40): Renovated, retail price, "firm on price", move-in ready.

            PROPERTY:
            Address: ${lead.address}
            Price: $${lead.price}
            Description: "${lead.description}"

            OUTPUT JSON ONLY:
            {
                "score": number,
                "reasoning": "string"
            }
            `;

            const result = await this.genAI.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });

            const text = result.text;
            if (!text) return { ...lead, aiScore: 0, aiReasoning: "AI Failed" };

            const analysis = JSON.parse(text);

            return {
                ...lead,
                aiScore: analysis.score,
                aiReasoning: analysis.reasoning
            };

        } catch (error) {
            console.error(`AI Qualification Failed for ${lead.id}`, error);
            return lead;
        }
    }
}

export const realEstateAgent = new RealEstateAgent();
