import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateSuggestedQuestions, generateAdversarialDebate } from '../services/geminiService';

// Use vi.hoisted to create a mock function accessible in both the mock factory and tests
const { mockGenerateContent } = vi.hoisted(() => {
  return { mockGenerateContent: vi.fn() };
});

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      constructor(options: any) {}
      models = {
        generateContent: mockGenerateContent,
        embedContent: vi.fn().mockResolvedValue({
            embeddings: [{ values: [0.1, 0.2, 0.3] }]
        }),
        generateContentStream: vi.fn().mockImplementation(async function* () {
             yield { text: "Simulated stream content" };
        })
      };
    }
  };
});

describe('GeminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_KEY = 'test_key';
  });

  describe('generateSuggestedQuestions', () => {
    it('should return a list of questions when API returns valid JSON', async () => {
      const mockQuestions = ["Why is sky blue?", "What is gravity?"];
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(mockQuestions)
      });

      const questions = await generateSuggestedQuestions("Science context");
      expect(questions).toEqual(mockQuestions);
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should return empty array if API returns empty text', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: ''
      });

      const questions = await generateSuggestedQuestions("Context");
      expect(questions).toEqual([]);
    });

    it('should return empty array on JSON parse error', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: 'Invalid JSON'
      });

      const questions = await generateSuggestedQuestions("Context");
      expect(questions).toEqual([]);
    });
  });

  describe('generateAdversarialDebate', () => {
    it('should return debate turns when API returns valid JSON', async () => {
      const mockDebate = [
        { speaker: "PROTOS", text: "AI is good." },
        { speaker: "KRONOS", text: "AI is risky." }
      ];
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(mockDebate)
      });

      const result = await generateAdversarialDebate("AI Safety");
      expect(result).toEqual(mockDebate);
    });

    it('should return empty array if API response is empty', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: ''
      });

      const result = await generateAdversarialDebate("Topic");
      expect(result).toEqual([]);
    });
  });
});
