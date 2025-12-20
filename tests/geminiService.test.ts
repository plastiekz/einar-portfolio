import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as geminiService from '../services/geminiService';

// Mock values hoisted to top
const mocks = vi.hoisted(() => {
  const generateContentMock = vi.fn();
  const embedContentMock = vi.fn();
  const generateContentStreamMock = vi.fn();

  // Mock class for GoogleGenAI
  class GoogleGenAIMock {
    apiKey: string;
    constructor(config: { apiKey: string }) {
      this.apiKey = config.apiKey;
    }
    get models() {
      return {
        generateContent: generateContentMock,
        embedContent: embedContentMock,
        generateContentStream: generateContentStreamMock,
      };
    }
  }

  return {
    generateContentMock,
    embedContentMock,
    generateContentStreamMock,
    GoogleGenAIMock,
  };
});

vi.mock('@google/genai', () => ({
  GoogleGenAI: mocks.GoogleGenAIMock,
}));

describe('Gemini Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_KEY = 'dummy_key_for_test';
  });

  afterEach(() => {
    delete process.env.API_KEY;
  });

  describe('getEmbedding', () => {
    it('should return embedding values on success', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
      mocks.embedContentMock.mockResolvedValue({
        embeddings: [{ values: mockEmbedding }],
      });

      const result = await geminiService.getEmbedding('test text');
      expect(result).toEqual(mockEmbedding);
      expect(mocks.embedContentMock).toHaveBeenCalledWith(expect.objectContaining({
        model: 'text-embedding-004',
      }));
    });

    it('should throw error on failure', async () => {
      mocks.embedContentMock.mockResolvedValue({});
      await expect(geminiService.getEmbedding('test')).rejects.toThrow('Failed to generate embedding');
    });
  });

  describe('generateSuggestedQuestions', () => {
    it('should return parsed questions', async () => {
      const mockQuestions = ['Q1?', 'Q2?'];
      mocks.generateContentMock.mockResolvedValue({
        text: JSON.stringify(mockQuestions),
      });

      const result = await geminiService.generateSuggestedQuestions('context');
      expect(result).toEqual(mockQuestions);
    });

    it('should return empty array on failure', async () => {
      mocks.generateContentMock.mockRejectedValue(new Error('API Error'));
      const result = await geminiService.generateSuggestedQuestions('context');
      expect(result).toEqual([]);
    });
  });

  describe('generateAdversarialDebate', () => {
    it('should return debate turns', async () => {
        const mockTurns = [{ speaker: 'PROTOS', text: 'Hello' }];
        mocks.generateContentMock.mockResolvedValue({
            text: JSON.stringify(mockTurns)
        });

        const result = await geminiService.generateAdversarialDebate('topic');
        expect(result).toEqual(mockTurns);
    });
  });

  describe('activateVanguard', () => {
      it('should return vanguard report', async () => {
          const mockReport = { target: 'test', riskLevel: 10 };
          mocks.generateContentMock.mockResolvedValue({
              text: JSON.stringify(mockReport)
          });
          const result = await geminiService.activateVanguard('target');
          expect(result).toEqual(mockReport);
      });
  });

  describe('synthesizeAxioms', () => {
      it('should return axioms', async () => {
          const mockData = { insights: ['i1'], axioms: ['a1'] };
          mocks.generateContentMock.mockResolvedValue({
              text: JSON.stringify(mockData)
          });
          const result = await geminiService.synthesizeAxioms(['input']);
          expect(result).toEqual(mockData);
      });
  });
});
