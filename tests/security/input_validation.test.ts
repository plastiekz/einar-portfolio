import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    generateDeepMindBriefing,
    activateVanguard,
    performDeepAnalysis,
    searchLiveResearch
} from '../../services/geminiService';

// Mock the GoogleGenAI client
const mockGenerateContent = vi.fn();
const mockGenerateContentStream = vi.fn();

// Vitest mock factory
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      constructor() {
        // Return the mock structure
      }
      get models() {
        return {
          generateContent: mockGenerateContent,
          generateContentStream: mockGenerateContentStream,
        };
      }
    },
    GenerateContentResponse: class {},
  };
});

describe('Security Input Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_KEY = 'dummy_key_for_test'; // Matches DUMMY_KEY in service

    // Default mock implementation
    mockGenerateContentStream.mockResolvedValue({
        stream: (async function* () { yield { text: 'mock response' }; })(),
    });
    mockGenerateContent.mockResolvedValue({
        text: '{"result": "mock"}',
    });
  });

  it('should throw an error if topic is too long for generateDeepMindBriefing', async () => {
    const longTopic = 'a'.repeat(600); // Exceeds 500 limit
    await expect(generateDeepMindBriefing(longTopic)).rejects.toThrow(/Input too long/i);
  });

  it('should throw an error if target is too long for activateVanguard', async () => {
    const longTarget = 'a'.repeat(600);
    await expect(activateVanguard(longTarget)).rejects.toThrow(/Input too long/i);
  });

  it('should throw an error if topic is too long for performDeepAnalysis', async () => {
    const longTopic = 'a'.repeat(600);
    await expect(performDeepAnalysis(longTopic)).rejects.toThrow(/Input too long/i);
  });

  it('should throw an error if query is too long for searchLiveResearch', async () => {
    const longQuery = 'a'.repeat(600);
    await expect(searchLiveResearch(longQuery)).rejects.toThrow(/Input too long/i);
  });

  it('should accept valid inputs for generateDeepMindBriefing', async () => {
      const validTopic = 'valid topic';
      const result = await generateDeepMindBriefing(validTopic);
      // Since we mock the response, just checking it didn't throw and returned something
      expect(result).toBeDefined();
      expect(mockGenerateContentStream).toHaveBeenCalled();
  });
});
