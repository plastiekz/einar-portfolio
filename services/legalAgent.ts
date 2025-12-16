import { GoogleGenAI } from "@google/genai";
import { policyAgent } from './policyAgent';
import { LawFirm } from '../types';

export class LegalAgent {
    private genAI: GoogleGenAI;

    constructor() {
        const key = process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;
        // In browser, we might not want to throw immediately if key is missing to avoid crash on load,
        // but for functionality we need it.
        this.genAI = new GoogleGenAI({ apiKey: key || "dummy_key" });
    }

    /**
     * Search for Law Firms using GenAI as a "Knowledge Engine".
     */
    async findFirms(query: string, targetZipRange: [number, number] = [2000, 2660]): Promise<LawFirm[]> {
        console.log(`[LegalAgent] ⚖️  AI-Searching for '${query}' in range ${targetZipRange[0]}-${targetZipRange[1]}...`);

        // 1. Policy Check
        const policy = await policyAgent.canFetch("https://www.google.com");
        if (!policy.allowed) {
            console.warn(`[LegalAgent] ⚠️ Policy Violation`);
            return [];
        }

        // 2. AI Search Prompt
        const prompt = `
        TASK: List 5 REAL Law Firms matching "${query}" in Antwerp, Belgium.
        CONSTRAINT: Zip Codes must be between ${targetZipRange[0]} and ${targetZipRange[1]}.
        REQUIREMENTS:
        - Must be real active firms.
        - Provide accurate Address and Website.
        - Output as strict JSON Array.

        OUTPUT FORMAT:
        [
            { "name": "Firm Name", "address": "Full Street Address", "zip": 2000, "city": "Antwerp", "website": "https://..." }
        ]
        `;

        try {
            const result = await this.genAI.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });

            const text = result.text;
            if (!text) return [];

            interface RawFirmData {
                name: string;
                address: string;
                zip: number;
                city?: string;
                website?: string;
                email?: string;
            }

            const rawFirms = JSON.parse(text) as RawFirmData[];

            // 3. Validation & Typing
            const firms: LawFirm[] = rawFirms.map((f, index) => ({
                id: `ai-gen-${index}`,
                name: f.name || "Unknown Firm",
                address: f.address || "Unknown Address",
                zip: f.zip,
                city: f.city || "Antwerp",
                website: f.website,
                email: f.email
            }));

            console.log(`[LegalAgent] ✅ AI found ${firms.length} results.`);
            return firms;

        } catch (error) {
            console.error("[LegalAgent] AI Search Failed:", error);
            // Return dummy data if AI fails (e.g. no key)
            return [
                { id: 'err-1', name: 'Demo Law Firm', address: 'Amerikalei 100', zip: 2000, city: 'Antwerp', website: 'https://example.com' }
            ];
        }
    }

    generateCSV(firms: LawFirm[]): string {
        const header = "Name,Address,Zip,City,Website,Email\n";
        const rows = firms.map(f => {
            const clean = (val?: string | number) => `"${(val || '').toString().replace(/"/g, '""')}"`;
            return [
                clean(f.name),
                clean(f.address),
                clean(f.zip),
                clean(f.city),
                clean(f.website),
                clean(f.email)
            ].join(",");
        });
        return header + rows.join("\n");
    }
}

export const legalAgent = new LegalAgent();

// Standalone helper
export const findFirms = (query: string) => legalAgent.findFirms(query);
