import { GoogleGenAI } from "@google/genai";
import robotsParser from 'robots-parser';
import { PolicyDecision, VanguardReport } from '../types';

class PolicyAgent {
    private userAgent: string;
    private genAI: GoogleGenAI | null = null;
    // Whitelist of allowed MCP tools (as per security specs)
    private readonly ALLOWED_TOOLS = ['googleSearch', 'codeExecution', 'calculator', 'clock'];

    constructor(userAgent: string = 'SynapseBot/1.0') {
        this.userAgent = userAgent;
        // Support both Node.js (process.env) and Vite (import.meta.env) safely
        const key = process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;

        console.log(`[Vanguard] Constructor loaded.`);

        if (key) {
            this.genAI = new GoogleGenAI({ apiKey: key });
        }
    }

    private getClient(): GoogleGenAI {
        if (!this.genAI) {
             const key = process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;
            if (key) {
                this.genAI = new GoogleGenAI({ apiKey: key });
            } else {
                throw new Error("Vanguard requires API Key. Please set VITE_GEMINI_API_KEY.");
            }
        }
        return this.genAI;
    }

    /**
     * Vanguard Mission: Analyze a target domain and produce a Strategic Scraping Policy.
     */
    async generateStrategy(targetUrl: string): Promise<VanguardReport> {
        try {
            const ai = this.getClient();
            console.log(`[Vanguard] 🛡️ Analyzing target for Strategic Policy: ${targetUrl}`);

            const prompt = `
            ROLE: You are 'Vanguard', The Policy Agent. An expert in Legal Scraping, Model Context Protocol (MCP), and Ethical Data Collection.
            TASK: precise analysis of the scraping feasibility for: ${targetUrl}

            1. ANALYZE:
               - Expected Robots.txt strictness for this type of site.
               - Likely Terms of Service constraints.
               - Anti-bot protections.

            2. STRATEGY:
               - Define the "Rules of Engagement".
               - Suggest the safest technical approach.
               - "Boundaries of legality".

            3. MCP CONFIGURATION:
               - Generate a JSON configuration for an MCP Server that would lawfully serve this data.

            OUTPUT JSON STRICTLY:
            {
                "riskScore": number (0-100),
                "riskLevel": "SAFE" | "AGGRESSIVE" | "ILLEGAL",
                "justification": "Short summary of risk",
                "markdownStrategy": "## Strategic Policy\nA detailed markdown report...",
                "mcpConfig": "string (JSON string of the config)"
            }
            `;

            const result = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });

            const text = result.text;
            if (!text) throw new Error("AI returned empty strategy.");

            interface AIResponse {
                riskScore: number;
                riskLevel: "SAFE" | "AGGRESSIVE" | "ILLEGAL";
                justification: string;
                markdownStrategy: string;
                mcpConfig: any;
            }

            const analysis = JSON.parse(text) as AIResponse;

            return {
                target: targetUrl,
                url: targetUrl,
                riskLevel: analysis.riskScore,
                riskLabel: analysis.riskLevel,
                legalBoundaries: [analysis.justification],
                strategy: analysis.markdownStrategy,
                mcpConfig: typeof analysis.mcpConfig === 'string' ? analysis.mcpConfig : JSON.stringify(analysis.mcpConfig, null, 2),
                reconData: "Simulated Recon Data"
            };

        } catch (error) {
            console.error("[Vanguard] Strategy Generation Failed:", error);
            return {
                target: targetUrl,
                url: targetUrl,
                riskLevel: 100,
                riskLabel: "ILLEGAL",
                legalBoundaries: ["Analysis Failed"],
                strategy: "## Analysis Failed\nCould not generate strategy due to system error.",
                mcpConfig: "{}",
                reconData: "Error"
            };
        }
    }

    /**
     * Checks if scraping a specific URL is allowed by the site's robots.txt.
     * BROWSER COMPATIBLE VERSION (Uses CORS proxy + robots-parser)
     */
    async canFetch(targetUrl: string): Promise<PolicyDecision> {
        console.log(`[PolicyAgent] Checking compliance for: ${targetUrl}`);
        try {
            console.log(`[PolicyAgent] Checking compliance for: ${targetUrl}`);

            const url = new URL(targetUrl);
            const robotsUrl = `${url.protocol}//${url.hostname}/robots.txt`;

            // Use a public CORS proxy for browser environment
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(robotsUrl)}`;

            console.log(`[PolicyAgent] Fetching robots.txt via proxy: ${proxyUrl}`);

            const response = await fetch(proxyUrl);

            if (response.status === 404) {
                // If robots.txt doesn't exist, everything is allowed
                return { allowed: true, reason: "No robots.txt found (Assumed Allowed)" };
            }

            if (!response.ok) {
                 // If fetching fails for other reasons, be cautious but arguably allow if network error.
                 // However, for strict policy agent, we might warn.
                 // Here we return false to be safe as per "Policy" role.
                 return { allowed: false, reason: `Could not verify robots.txt (HTTP ${response.status})` };
            }

            const robotsContent = await response.text();
            const robot = robotsParser(robotsUrl, robotsContent);

            const isAllowed = robot.isAllowed(targetUrl, this.userAgent);
            const preferredCrawlDelay = robot.getCrawlDelay(this.userAgent);

            if (isAllowed) {
                return {
                    allowed: true,
                    reason: `Allowed by robots.txt.${preferredCrawlDelay ? ` (Crawl-Delay: ${preferredCrawlDelay}s)` : ''}`
                };
            } else {
                return { allowed: false, reason: "Blocked by robots.txt" };
            }

        } catch (error) {
            console.warn(`[PolicyAgent] Robots check error: ${error}`);
            // Fallback for simulation or network errors
            if (targetUrl.includes("forbidden")) {
                 return { allowed: false, reason: "BLOCKED by Simulated Robots.txt (Fallback)" };
            }
            // If we can't check, we default to blocking in a strict environment,
            // but for this tool, failing closed (false) is safer.
            return { allowed: false, reason: `Policy Check Failed: ${error}` };
        }
    }

    validateMCP(toolCall: { tool: string; args: any; }): PolicyDecision {
        // Sentinel Security Improvement: Switch from Blacklist to Strict Whitelist
        const WHITELIST = ['googleSearch', 'codeExecution', 'calculator', 'clock'];

        // Defense in Depth: Pattern Check
        const SAFE_PATTERN = /^[a-zA-Z0-9_]+$/;

        if (!SAFE_PATTERN.test(toolCall.tool)) {
             return {
                 allowed: false,
                 reason: `[SECURITY] Tool name '${toolCall.tool}' contains invalid characters.`
             };
        }

        if (!WHITELIST.includes(toolCall.tool)) {
            return {
                allowed: false,
                reason: `[SECURITY] Tool '${toolCall.tool}' is not in the allowed whitelist.`
            };

        } catch (error) {
            console.warn(`[PolicyAgent] Failed to fetch/parse robots.txt: ${error}`);
            // Fail open (allow) or closed (deny) depending on policy.
            // Choosing to allow with warning for resilience, but logging it.
            return { allowed: true, reason: `Robots.txt check failed (${error}), proceeding with caution.` };
        }
    }

    /**
     * Validates an MCP Configuration string (JSON) against security policies.
     * Enforces a strict whitelist of tools.
     */
    validateMCP(configString: string): Promise<PolicyDecision> { // Changed to async/Promise to match potential future async checks
        return new Promise(resolve => {
            try {
                const config = JSON.parse(configString);
                if (!config.tools || !Array.isArray(config.tools)) {
                    resolve({ allowed: true, reason: "No tools defined in MCP config." });
                    return;
                }

                for (const tool of config.tools) {
                    if (!tool.name) continue;

                    // Strict Whitelist Check
                    if (!this.ALLOWED_TOOLS.includes(tool.name)) {
                         resolve({
                            allowed: false,
                            reason: `Unauthorized tool detected: '${tool.name}'. Allowed: ${this.ALLOWED_TOOLS.join(', ')}`
                        });
                        return;
                    }
                }

                resolve({ allowed: true, reason: "MCP Configuration complies with security protocols." });

            } catch (e) {
                resolve({ allowed: false, reason: "Invalid MCP Configuration (JSON Parse Error)." });
            }
        });
    }
}

export const policyAgent = new PolicyAgent();
