import { describe, it, expect, vi, beforeEach } from 'vitest';
import { policyAgent } from '../services/policyAgent';

// Mock global.fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('PolicyAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateMCP', () => {
    it('should block blacklisted tools', () => {
      const decision = policyAgent.validateMCP({ tool: 'rm_rf', args: {} });
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toContain('blacklisted');
    });

    it('should allow safe tools', () => {
      const decision = policyAgent.validateMCP({ tool: 'calculator', args: {} });
      expect(decision.allowed).toBe(true);
    });
  });

  describe('canFetch', () => {
    it('should allow normal urls (simulated)', async () => {
      const decision = await policyAgent.canFetch('https://example.com');
      expect(decision.allowed).toBe(true);
    });

    it('should block forbidden urls (simulated)', async () => {
      const decision = await policyAgent.canFetch('https://forbidden-site.com');
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toContain('BLOCKED');
    });
  });
});
