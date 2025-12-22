import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { policyAgent } from '../services/policyAgent';

// Mock global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('PolicyAgent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('canFetch (Robots.txt)', () => {
        it('should allow access if robots.txt allows User-Agent', async () => {
            // Mock successful robots.txt fetch via proxy
            fetchMock.mockResolvedValueOnce({
                ok: true,
                text: async () => `
                    User-agent: *
                    Allow: /
                `
            });

            const result = await policyAgent.canFetch("https://example.com/page");
            expect(result.allowed).toBe(true);
            expect(result.reason).toContain("Allowed by robots.txt");
        });

        it('should disallow access if robots.txt explicitly disallows', async () => {
             // Mock robots.txt blocking SynapseBot
             fetchMock.mockResolvedValueOnce({
                ok: true,
                text: async () => `
                    User-agent: SynapseBot
                    Disallow: /private
                `
            });

            const result = await policyAgent.canFetch("https://example.com/private");
            // Note: If logic is correct, it should respect the disallow.
            // However, policyAgent might have complex logic. We assume standard robots parser behavior.
            expect(result.allowed).toBe(false);
        });

        it('should default to allowed if robots.txt fetch fails', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            const result = await policyAgent.canFetch("https://example.com/page");
            expect(result.allowed).toBe(true);
            expect(result.reason).toContain("Robots.txt not found");
        });
    });

    describe('validateMCP', () => {
        it('should allow whitelisted tools', async () => {
            const config = JSON.stringify({
                tools: [{ name: "googleSearch" }]
            });
            const result = await policyAgent.validateMCP(config);
            expect(result.allowed).toBe(true);
        });

        it('should block non-whitelisted tools', async () => {
             const config = JSON.stringify({
                tools: [{ name: "hack_database" }]
            });
            const result = await policyAgent.validateMCP(config);
            expect(result.allowed).toBe(false);
            expect(result.reason).toContain("Unauthorized tool");
        });

        it('should block invalid JSON', async () => {
            const result = await policyAgent.validateMCP("{ bad json ");
            expect(result.allowed).toBe(false);
            expect(result.reason).toContain("Invalid MCP Configuration");
        });
    });
});
