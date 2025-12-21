import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getEmbedding, generateSuggestedQuestions, generateAdversarialDebate, synthesizeAxioms } from '../services/geminiService';

// Hoist mocks
const { mockEmbedContent, mockGenerateContent, mockGenerateContentStream } = vi.hoisted(() => {
  return {
    mockEmbedContent: vi.fn(),
    mockGenerateContent: vi.fn(),
    mockGenerateContentStream: vi.fn(),
  };
});

vi.mock('@google/genai', () => {
  return {
    // Mock class using a function that returns an object, but ensuring it can be 'new'ed
    GoogleGenAI: class {
      constructor() {}
      get models() {
        return {
          embedContent: mockEmbedContent,
          generateContent: mockGenerateContent,
          generateContentStream: mockGenerateContentStream,
        };
      }
    },
    GeminiError: class extends Error {},
  };
});

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_KEY = 'dummy_key_for_test';
    process.env.NODE_ENV = 'test'; // Ensure we hit the test path in getGenAIClient

    // Default mock returns
    mockEmbedContent.mockResolvedValue({
      embeddings: [{ values: [0.1, 0.2, 0.3] }]
    });

    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(['Q1', 'Q2']),
    });
  });

  it('getEmbedding calls the AI client', async () => {
    await getEmbedding('test text');
    expect(mockEmbedContent).toHaveBeenCalled();
  });

  it('generateSuggestedQuestions calls the AI client', async () => {
    const result = await generateSuggestedQuestions('context');
    expect(mockGenerateContent).toHaveBeenCalled();
    expect(result).toEqual(['Q1', 'Q2']);
  });

  it('generateAdversarialDebate calls the AI client', async () => {
      mockGenerateContent.mockResolvedValueOnce({
          text: JSON.stringify([{ speaker: "Test", text: "Hello" }])
      });
      const result = await generateAdversarialDebate('topic');
      expect(mockGenerateContent).toHaveBeenCalled();
      expect(result).toHaveLength(1);
  });

  it('synthesizeAxioms calls the AI client', async () => {
      mockGenerateContent.mockResolvedValueOnce({
          text: JSON.stringify({ insights: ['I1'], axioms: ['A1'] })
      });
      const result = await synthesizeAxioms(['input']);
      expect(mockGenerateContent).toHaveBeenCalled();
      expect(result.insights).toHaveLength(1);
  });
});
