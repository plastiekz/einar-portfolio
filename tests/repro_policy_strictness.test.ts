import { describe, it, expect, vi, beforeEach } from 'vitest';
import { realEstateAgent } from '../services/realEstateAgent';
import { policyAgent } from '../services/policyAgent';

// Mock GoogleGenAI for policyAgent and realEstateAgent
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
        constructor() {}
        get models() {
            return {
                generateContent: vi.fn(),
            };
        }
    },
  };
});

describe('RealEstateAgent Policy Strictness', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.API_KEY = 'test-key';
        process.env.NODE_ENV = 'test';
    });

    it('should return empty leads when policy is violated', async () => {
        // Mock policyAgent.canFetch to return false
        vi.spyOn(policyAgent, 'canFetch').mockResolvedValue({
            allowed: false,
            reason: 'BLOCKED for Repro'
        });

        const leads = await realEstateAgent.findLeads('forbidden-zone');

        expect(leads).toEqual([]);
        expect(leads.length).toBe(0);
    });
});
