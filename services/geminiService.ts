import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Paper, DebateTurn } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a high-level strategic research briefing acting as a DeepMind Principal Engineer.
 * Uses Google Search for grounding and specific persona for style.
 */
export const generateDeepMindBriefing = async (topic: string, onUpdate?: (step: string) => void): Promise<GenerateContentResponse> => {
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

    const result = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash', // Flash is used here for tool access + speed
      contents: `Execute Intelligence Scan on target topic: "${topic}".`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: systemInstruction,
        temperature: 0.4, // Low temperature for precision
      },
    });

    let fullText = "";
    let finalChunk: GenerateContentResponse | null = null;
    let accumulatedGroundingMetadata: any = null;
    let analyzingNotified = false;

    for await (const chunk of result) {
        // Capture the most recent chunk structure as base for the final response
        finalChunk = chunk;

        // Accumulate text
        if (chunk.text) {
             fullText += chunk.text;
             if (!analyzingNotified) {
                 onUpdate?.(">> ANALYZING RESULTS...");
                 analyzingNotified = true;
             }
        }

        // Check for grounding metadata (search queries)
        const metadata = chunk.candidates?.[0]?.groundingMetadata;
        if (metadata) {
             if (metadata.webSearchQueries && metadata.webSearchQueries.length > 0) {
                 // Notify about the first query found
                 onUpdate?.(`>> SEARCHING LIVE WEB: ${metadata.webSearchQueries[0]}...`);
             }
             // Store or merge metadata
             if (metadata.groundingChunks || metadata.webSearchQueries) {
                 accumulatedGroundingMetadata = metadata;
             }
        }
    }

    // Construct a response object compatible with GenerateContentResponse
    const response = {
        ...finalChunk,
        text: fullText,
        candidates: [{
            ...finalChunk?.candidates?.[0],
            groundingMetadata: accumulatedGroundingMetadata
        }]
    };

    return response as unknown as GenerateContentResponse;

  } catch (error) {
    console.error("Error in generateDeepMindBriefing:", error);
    throw error;
  }
};

export const searchLiveResearch = async (query: string): Promise<GenerateContentResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
 * Generates suggested follow-up questions for a given topic or paper.
 */
export const generateSuggestedQuestions = async (context: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate 3-5 short, insightful follow-up questions based on this context: "${context}". Return ONLY a JSON array of strings.`,
            config: {
                responseMimeType: "application/json",
                temperature: 0.5,
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as string[];
        }
        return [];
    } catch (error) {
        console.error("Error in generateSuggestedQuestions:", error);
        return [];
    }
}

/**
 * Performs a deep analysis of a topic using the 'Thinking' model.
 * Uses gemini-3-pro-preview with a high thinking budget.
 */
export const performDeepAnalysis = async (topic: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Perform a comprehensive "State of the Art" analysis on the following topic: "${topic}".
      
      Structure your response as follows:
      1. Executive Summary
      2. Key Technological Breakthroughs
      3. Critical Challenges & Limitations
      4. Future Outlook (Next 12-24 months)
      
      Be technical, precise, and cater to a Senior AI Researcher persona.`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Max budget for deep reasoning
      },
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Error in performDeepAnalysis:", error);
    return "Failed to generate deep analysis. Please try again.";
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
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.8
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
}

/**
 * Analyzes a specific paper with a high-fidelity persona prompt.
 * Modes: 'summary' (Technical TL;DR), 'critique' (Peer Review), 'creative' (Future Applications)
 */
export const analyzePaper = async (title: string, abstract: string, source: string, mode: 'summary' | 'critique' | 'creative'): Promise<string> => {
  try {
    let systemPrompt = "You are a Principal AI Researcher at a top-tier lab (e.g., DeepMind, OpenAI). You value technical precision, skepticism, and novel connections.";
    let userPrompt = "";

    const contextPrefix = `
    Target Paper: "${title}"
    Source Origin: ${source}
    Abstract: "${abstract}"
    `;

    switch (mode) {
      case 'summary':
        userPrompt = `
        ${contextPrefix}
        
        Task: Generate a 'High-Signal' technical summary.
        
        Requirements:
        1. **Attribution**: Start by explicitly stating "Analysis of [${title}] sourced from ${source}".
        2. **Core Innovation**: In 1 sentence, what is the specific delta over SOTA?
        3. **Methodology**: Briefly explain the architecture, loss function, or data strategy.
        4. **Key Result**: Quote the most impressive metric or finding.
        
        Style: Dense, jargon-heavy (appropriate for experts), bullet points.
        `;
        break;
      case 'critique':
        userPrompt = `
        ${contextPrefix}

        Task: Act as Reviewer #2. Provide a critical peer review.

        Requirements:
        1. **Attribution**: Acknowledge the paper "${title}" from ${source} in your opening.
        2. **Potential Flaws**: Identify theoretical bottlenecks or lack of baselines.
        3. **Scalability Check**: Will this work at 100x scale? Why/Why not?
        4. **Missing Comparisons**: What related work should have been cited/compared?

        Style: Constructive but strictly critical.
        `;
        break;
      case 'creative':
        userPrompt = `
        ${contextPrefix}

        Task: Brainstorm novel applications and extensions.

        Requirements:
        1. **Context**: Frame these ideas as extensions of the work presented in "${title}" (${source}).
        2. **Cross-Domain Application**: Apply this technique to a completely different field (e.g., Biology, Finance, Robotics).
        3. **The 'What If' Scenario**: If this technique improves by 10x, what becomes possible?
        4. **A Wild Idea**: A high-risk, high-reward experiment based on this paper.

        Style: Imaginative, visionary, inspiring.
        `;
        break;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: mode === 'creative' ? 0.9 : 0.3, // Higher temp for creativity
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
    const contextBlock = papers.map((p, index) => 
      `[Source ${index + 1}] Title: ${p.title}\nAuthors: ${p.authors.join(', ')}\nDate: ${p.publishedDate}\nAbstract: ${p.abstract}`
    ).join('\n\n----------------\n\n');

    const systemInstruction = `
    You are Synapse Memory, a meta-analysis engine designed to synthesize research collections.
    You have access to a specific database of papers provided by the user AND the capability to search the web for broader context.
    
    YOUR GOAL:
    1. Answer the user's query specifically using the provided sources.
    2. **USE SEARCH GROUNDING** to find "Past" (historical foundation), "Present" (current state outside these papers), and "Future" (emerging trends) context.
    3. Identify "Hidden Threads": Connections between papers that aren't obvious.
    4. Temporal Synthesis: Weave together the selected papers with external knowledge to tell a complete story.
    
    STYLE:
    - Insightful, holistic, and narrative-driven (like a high-quality research podcast host or senior editor).
    - Cite sources using [Source X] for the provided papers, and integrate web sources naturally.
    `;

    const userPrompt = `
    CONTEXT (SELECTED PAPERS):
    ${contextBlock}

    USER QUERY:
    "${query}"
    
    If the query is generic (e.g., "Summarize", "Insights"), provide a comprehensive "State of the Union" for this specific collection, augmented by external search knowledge.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // High context window + Tool usage
      contents: userPrompt,
      config: {
        tools: [{ googleSearch: {} }], // Enable Search Grounding for "Past, Present, Future" insights
        systemInstruction: systemInstruction,
        temperature: 0.5,
      }
    });

    return response.text || "Synthesis failed.";
  } catch (error) {
    console.error("Error in synthesizeCollection:", error);
    return "Unable to synthesize collection at this time.";
  }
};
