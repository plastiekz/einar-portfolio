import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleGenAI } from '@google/genai';
import { generateSuggestedQuestions, generateAdversarialDebate } from '../services/geminiService';

// Mock the GoogleGenAI class and its methods
// We need to use vi.hoisted to ensure the mock is established before imports
const mocks = vi.hoisted(() => {
    return {
        generateContent: vi.fn(),
    };
});

vi.mock('@google/genai', () => {
    // Return a constructible class
    return {
        GoogleGenAI: class {
            constructor() {
                // Returns the mock object
                return {
                    models: {
                        generateContent: mocks.generateContent,
                        generateContentStream: vi.fn(),
                        embedContent: vi.fn(),
                    }
                };
            }
        }
    };
});

describe('GeminiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset default mock implementation
        mocks.generateContent.mockResolvedValue({
            text: JSON.stringify(["Question 1", "Question 2"]),
        });
    });

    describe('generateSuggestedQuestions', () => {
        it('should return an array of strings when API returns valid JSON', async () => {
            const mockQuestions = ["Why is the sky blue?", "What is scattering?"];
            mocks.generateContent.mockResolvedValueOnce({
                text: JSON.stringify(mockQuestions),
            });

            const result = await generateSuggestedQuestions("Physics context");
            expect(result).toEqual(mockQuestions);
            expect(mocks.generateContent).toHaveBeenCalledWith(expect.objectContaining({
                contents: expect.stringContaining("Physics context"),
                config: expect.objectContaining({
                    responseMimeType: "application/json"
                })
            }));
        });

        it('should return empty array on JSON parse error', async () => {
            mocks.generateContent.mockResolvedValueOnce({
                text: "Not valid JSON",
            });

            const result = await generateSuggestedQuestions("Context");
            expect(result).toEqual([]);
        });

        it('should return empty array on API error', async () => {
            mocks.generateContent.mockRejectedValueOnce(new Error("API Failure"));
            const result = await generateSuggestedQuestions("Context");
            expect(result).toEqual([]);
        });
    });

    describe('generateAdversarialDebate', () => {
        it('should return debate turns when API returns valid JSON', async () => {
            const mockDebate = [
                { speaker: "PROTOS (Optimist)", text: "AI is great." },
                { speaker: "KRONOS (Skeptic)", text: "AI is risky." }
            ];
            mocks.generateContent.mockResolvedValueOnce({
                text: JSON.stringify(mockDebate),
            });

            const result = await generateAdversarialDebate("AI Safety");
            expect(result).toEqual(mockDebate);
        });

        it('should throw error on failure', async () => {
             mocks.generateContent.mockRejectedValueOnce(new Error("API Error"));
             await expect(generateAdversarialDebate("Topic")).rejects.toThrow("API Error");
        });
    });
});
