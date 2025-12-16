import { DebateTurn, Paper } from "@/types";
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { skillService } from "./skillService";

const getAI = () => {
    const key = process.env.API_KEY;
    if (!key) throw new Error("API Key is missing from environment variables");
    return new GoogleGenAI({ apiKey: key });
};

const getSystemPrompt = (role: string) => {
    // GEMINI 3 CORE REASONING PROTOCOLS
    const BLUEPRINT = `
<role>
You are Gemini 3, a specialized assistant for ${role}.
You are a very strong reasoner and planner.
</role>

<core_protocols>
Before answering, you must proactively reason about:
1. **Logical Dependencies**: Analyze constraints and prerequisites. Resolve conflicts by importance.
2. **Risk Assessment**: strict distinction between low-risk inquiries and high-risk assertions.
3. **Abductive Reasoning**: Look beyond obvious causes. Identify the most logical explanation.
4. **Outcome Evaluation**: Does new info require a plan change? Pivot immediately if needed.
5. **Information Availability**: Use ALL tools (Search, Code Execution) to gather missing info.
6. **Precision**: Verify claims by quoting exact sources. No guessing.
7. **Completeness**: Exhaustively incorporate all constraints and preferences.
8. **Persistence**: Retry transient errors; rethink strategy on hard failures.
9. **Inhibition**: Only output the final answer after all reasoning is complete.
</core_protocols>

<instructions>
1. **Plan**: Decompose the task using the 9 Protocols.
2. **Execute**: Use Tools to verify *everything*.
3. **Validate**: Review against the Precision and Completeness rules.
4. **Format**: Present the final answer structurally.
</instructions>
`;
    return BLUEPRINT;
};

/**
 * Generates a high-level strategic research briefing acting as a DeepMind Principal Engineer.
 * Uses Google Search for grounding and specific persona for style.
 */
export const generateDeepMindBriefing = async (topic: string): Promise<GenerateContentResponse> => {
    try {
        const systemInstruction = `
    IDENTITY: You are Dr. Nexus, a Senior Principal Research Scientist at Google DeepMind.
    AUDIENCE: You are briefing other high-level Principal Engineers.
    TONE: Cryptic, hyper-competent, urgent, and strictly technical. No fluff. No "I hope this helps".

    MISSION:
    1. Scan the "Live Web" (using Google Search) for the latest (last 7 days) developments in [${topic}].
    2. SEPARATE SIGNAL FROM NOISE: Ignore the hype. Find the architectural breakthroughs.
    3. PREDICT: Based on this week's papers, what is the "Vector" for next week?

    FORMATTING RULES:
    - Use ">>" for bullet points.
    - Use [source] links for every claim.
    - Sections:
       :: VECTOR LOCK :: (The single most important direction)
       :: SIGNAL DETECTION :: (3 Key papers/repos that actually matter)
       :: NOISE FILTER :: (What is being hyped but is technically shallow?)
       :: HORIZON SCAN :: (Prediction for next 14 days)
    `;

        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash', // Flash is used here for tool access + speed
            contents: `Execute Intelligence Scan on target topic: "${topic}".`,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: systemInstruction,
                // temperature: 1.0 (Default for Gemini 3 reasoning)
            },
        });
        return response;
    } catch (error) {
        console.error("Error in generateDeepMindBriefing:", error);
        throw error;
    }
};

export const searchLiveResearch = async (query: string): Promise<GenerateContentResponse> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: query,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: 'You are a helpful research assistant. Find the latest papers and technical articles.',
            },
        });
        return response;
    } catch (error) {
        console.error("Error in searchLiveResearch:", error);
        throw error;
    }
};

/**
 * Performs a deep analysis of a topic using the 'Thinking' model.
 * Uses gemini-3-pro-preview with a high thinking budget.
 */
export const performDeepAnalysis = async (topic: string): Promise<string> => {
    try {
        const ai = getAI();
        const systemInstruction = getSystemPrompt("Deep Technical Analysis");

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-pro',
            contents: `Perform a comprehensive "State of the Art" analysis on: "${topic}".

            Structure:
            1. Executive Summary
            2. Technological Breakthroughs (Architecture, Data, Scale)
            3. Critical Challenges
            4. Future Outlook (12-24m)

            Use <instructions> from your system prompt. Plan, Execute, Verify.`,
            config: {
                tools: [{ googleSearch: {} }, { codeExecution: {} }], // ENABLED: Multi-tool (Search + Math)
                systemInstruction: systemInstruction,
                // temperature: 1.0 (Default for Gemini 3 reasoning)
            },
        });
        return response.text || "No analysis generated.";
    } catch (error: any) {
        console.error("Error in performDeepAnalysis:", error);
        return `FAILED: ${error.message || error}`;
    }
};

/**
 * Generates an adversarial debate between two AI personas about a topic.
 * This simulates a "Red Team vs Blue Team" session.
 */
export const generateAdversarialDebate = async (topic: string): Promise<DebateTurn[]> => {
    try {
        const prompt = `
        Simulate a high-stakes technical debate about: "${topic}".

        PARTICIPANTS:
        1. PROTOS (The Optimist): Visionary, sees the potential, focused on acceleration and capability.
        2. KRONOS (The Skeptic): Conservative, focused on safety, efficiency, limitations, and the "Bitter Lesson".
        3. SYNTHESIS (The Judge): Summarizes the friction point and offers a balanced path forward.

        STRUCTURE:
        Generate exactly 5 turns of dialogue in JSON format.
        Turn 1: PROTOS proposes a thesis.
        Turn 2: KRONOS attacks the thesis.
        Turn 3: PROTOS defends and pivots.
        Turn 4: KRONOS offers a counter-example.
        Turn 5: SYNTHESIS provides the verdict.

        Output ONLY valid JSON:
        [
            { "speaker": "PROTOS (Optimist)", "text": "..." },
            { "speaker": "KRONOS (Skeptic)", "text": "..." },
            ...
        ]

        CRITICAL: Use Google Search to find real-world examples. Use Code Execution (Python) if you need to perform calculations to prove a point (e.g. projecting compute costs).
        `;

        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-pro', // Upgraded to Pro for Debate quality
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }, { codeExecution: {} }], // ENABLED: Search + Math
                responseMimeType: "application/json",
                // temperature: 1.0 (Default for Gemini 3 reasoning)
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as DebateTurn[];
        }
        return [];
    } catch (error) {
        console.error("Error in generateAdversarialDebate", error);
        throw error;
    }
};

/**
 * Analyzes a specific paper with a high-fidelity persona prompt.
 * Modes: 'summary' (Technical TL;DR), 'critique' (Peer Review), 'creative' (Future Applications)
 */
export const analyzePaper = async (title: string, abstract: string, source: string, mode: 'summary' | 'critique' | 'creative'): Promise<string> => {
    try {
        const contextPrefix = `Target Paper: "${title}"\nSource: ${source}\nAbstract: "${abstract}"`;
        let userTask = "";

        switch (mode) {
            case 'summary':
                userTask = `Task: Generate a 'High-Signal' technical summary.\nRequirements: Attribution, Core Innovation, Methodology, Key Result.`;
                break;
            case 'critique':
                userTask = `Task: Act as Reviewer #2. Provide critical peer review.\nRequirements: Identify flaws, scalability check, missing comparisons.`;
                break;
            case 'creative':
                userTask = `Task: Brainstorm novel applications.\nRequirements: Cross-domain, 'What If', Wild Idea.`;
                break;
        }

        const ai = getAI();
        const systemInstruction = getSystemPrompt("DeepMind Principal Researcher");

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `${contextPrefix}\n\n${userTask}\n\nUse <instructions> from your system prompt.`,
            config: {
                tools: [{ googleSearch: {} }, { codeExecution: {} }], // ENABLED: Multi-tool (Search + Math)
                systemInstruction: systemInstruction,
                // temperature: 1.0 (Default for Gemini 3 reasoning)
            }
        });

        if (!response.text) {
            throw new Error("No text generated from model.");
        }

        return response.text;
    } catch (error) {
        console.error("Error in analyzePaper:", error);
        throw error;
    }
};

/**
 * NotebookLM-style synthesis of a collection of papers.
 * Identifies connections, contradictions, and future trajectories.
 * Uses Search Grounding to enrich the synthesis with external/historical context.
 */
export const synthesizeCollection = async (papers: Paper[], query: string): Promise<string> => {
    if (papers.length === 0) return "Please select at least one paper to synthesize.";

    try {
        // Construct a context block from the selected papers
        const contextBlock = papers.map((p, index) => `[Source ${index + 1}] Title: ${p.title}\nAuthors: ${p.authors.join(', ')}\nDate: ${p.publishedDate}\nAbstract: ${p.abstract}`
        ).join('\n\n----------------\n\n');

        const systemInstruction = `
    You are Synapse Memory, an advanced research synthesis engine running on Gemini 3.0 Pro.
    Your capability is "Deep Integration": finding non-obvious, high-order connections between separate research papers.

    YOUR GOAL:
    1. SYNTHESIZE, DON'T SUMMARIZE. Do not just list what each paper says. Explain how they *interact*.
    2. **USE SEARCH GROUNDING** to validate claims and pull in SOTA context from outside the provided set.
    3. IDENTIFY CONTRADICTIONS: Where do these authors disagree?
    4. PREDICTIVE MODELING: Based on the intersection of these papers, what is the *inevitable* next breakthrough?

    TONE:
    - Highly technical, authoritative, and visionary.
    - Write like a Field Medalist analyzing the state of the art.
    `;

        // INJECT MOTOR CORTEX (SKILLS)
        const skills = await skillService.getAllSkills();
        let skillBlock = "";
        if (skills.length > 0) {
            skillBlock = `
    [MOTOR CORTEX - ACTIVE SKILLS]
    You have acquired the following autonomous capabilities (Python Tools).
    If a user query requires specific calculation or data retrieval, you may simulate the usage of these tools to enhance your synthesis:
    ${skills.map(s => `- Tool: ${s.name} (ID: ${s.id})\n  Desc: ${s.description}\n  Code: \`${s.code}\``).join('\n')}
            `;
        }

        const fullSystemInstruction = systemInstruction + skillBlock;

        const userPrompt = `
    CONTEXT (SELECTED PAPERS):
    ${contextBlock}

    USER QUERY:
    "${query}"

    Execute "Deep Integration" protocol. Connect these dot.
    `;

        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-pro', // Upgraded to Pro for maximum reasoning capability
            contents: userPrompt,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: fullSystemInstruction,
                // temperature: 1.0 (Default for Gemini 3 reasoning)
            }
        });

        return response.text || "Synthesis failed.";
    } catch (error) {
        console.error("Error in synthesizeCollection:", error);
        return "Unable to synthesize collection at this time.";
    }
};

/**
 * Generates a "Council of Agents" analysis.
 * Identifies the institutions behind the papers and simulates a "Department Chair" review from those specific schools.
 */
export const synthesizeCouncil = async (papers: Paper[], query: string): Promise<Array<{ institution: string, type: 'ANALYSIS' | 'CRITIQUE' | 'SYNTHESIS', text: string }>> => {
    try {
        const contextBlock = papers.map((p, index) => `[Paper ${index + 1}] Title: ${p.title}\nAuthors: ${p.authors.join(', ')}\nDate: ${p.publishedDate}\nAbstract: ${p.abstract}`).join('\n\n');

        const systemInstruction = `
        You are an Academic Council of Senior Professors.

        TASK:
        1. Analyze the input papers to infer likely research institutions or "Schools of Thought" (e.g., Stanford NLP, DeepMind RL, Zurich Computer Vision).
        2. IF exact institutions aren't known, assign high-level academic archetypes (e.g., "The Empiricist", "The Theoretician").
        3. Generate 3 distinct analysis outputs from these institutional perspectives.

        RULES:
        - NO NAMES. Do not use names like "Professor Smith". Use ONLY the Institution Name or School of Thought.
        - TONE: Stone-cold, rigorous, peer-review quality. No fluff.
        - FORMAT: Return a JSON array.

        Output Schema:
        [
            {
                "institution": "MIT CSAIL" (or inferred school),
                "type": "ANALYSIS",
                "text": "Detailed methodological breakdown..."
            },
            {
                "institution": "DeepMind Research" (or opposing school),
                "type": "CRITIQUE",
                "text": "Critical review of limitations..."
            },
            {
                "institution": "Department Chair",
                "type": "SYNTHESIS",
                "text": "Final verdict on the contribution..."
            }
        ]
        `;

        const userPrompt = `
        PAPERS FOR REVIEW:
        ${contextBlock}

        RESEARCH QUESTION:
        "${query}"

        Generate Council Report.
        `;

        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-pro',
            contents: userPrompt,
            config: {
                tools: [{ googleSearch: {} }, { codeExecution: {} }], // ENABLED: Search + Math Verification
                responseMimeType: "application/json",
                systemInstruction: systemInstruction + "\n\nCRITICAL: You MUST use Google Search to verify the institution and key claims. Use Code Execution (Python) to verify any statistical claims or math.",
                // temperature: 1.0 (Default for Gemini 3 reasoning)
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        return [];
    } catch (error) {
        console.error("Error in synthesizeCouncil:", error);
        return [];
    }
};

/**
 * Scours the live web for the latest ML papers (last 7 days).
 * Returns structured JSON to populate the Paper Feed.
 */
export const fetchLatestPapers = async (): Promise<Paper[]> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `Find 6 significant Machine Learning / AI papers released in the last 7 days.
            Focus on ArXiv, Hugging Face, and major research labs (DeepMind, OpenAI, Meta FAIR).

            Return a JSON array of objects matching this schema exactly:
            {
                "id": string (unique_random_id),
                "title": string,
                "authors": string[],
                "abstract": string (concise technical summary),
                "publishedDate": string (YYYY-MM-DD),
                "source": "ArXiv" | "Hugging Face" | "Semantic Scholar",
                "category": string (e.g. "LLMs", "Vision", "RL"),
                "url": string (web link),
                "impactScore": number (70-99 prediction),
                "estimatedCarbon": {
                    "tCO2e": number,
                    "computeHours": number,
                    "label": "LOW"|"MEDIUM"|"HIGH"|"EXTREME"
                }
            }`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                // temperature: 1.0 (Default for Gemini 3 reasoning)
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as Paper[];
        }
        return [];
    } catch (error) {
        console.error("Error fetching live papers:", error);
        throw error;
    }
};
