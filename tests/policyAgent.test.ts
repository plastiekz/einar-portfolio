import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { policyAgent } from '../services/policyAgent';

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('PolicyAgent', () => {
    beforeEach(() => {
        fetchMock.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should allow fetching when robots.txt allows it', async () => {
        const mockRobotsTxt = `
            User-agent: *
            Allow: /
        `;

        fetchMock.mockResolvedValue({
            status: 200,
            ok: true,
            text: async () => mockRobotsTxt,
        });

        const decision = await policyAgent.canFetch('https://example.com/allowed-page');

        expect(decision.allowed).toBe(true);
        expect(decision.reason).toContain('Allowed by robots.txt');
        expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('https://api.allorigins.win/raw?url='));
    });

    it('should block fetching when robots.txt disallows it', async () => {
        const mockRobotsTxt = `
            User-agent: *
            Disallow: /private/
        `;

        fetchMock.mockResolvedValue({
            status: 200,
            ok: true,
            text: async () => mockRobotsTxt,
        });

        const decision = await policyAgent.canFetch('https://example.com/private/page');

        expect(decision.allowed).toBe(false);
        expect(decision.reason).toBe('Blocked by robots.txt');
    });

    it('should allow fetching if robots.txt returns 404', async () => {
        fetchMock.mockResolvedValue({
            status: 404,
            ok: false,
            text: async () => 'Not Found',
        });

        const decision = await policyAgent.canFetch('https://example.com/some-page');

        expect(decision.allowed).toBe(true);
        expect(decision.reason).toContain('No robots.txt found');
    });

    it('should block fetching if fetch fails (fail closed)', async () => {
        fetchMock.mockResolvedValue({
            status: 500,
            ok: false,
            text: async () => 'Internal Server Error',
        });

        const decision = await policyAgent.canFetch('https://example.com/some-page');

        expect(decision.allowed).toBe(false);
        expect(decision.reason).toContain('Could not verify robots.txt');
    });

    it('should handle network errors gracefully', async () => {
        fetchMock.mockRejectedValue(new Error('Network Error'));

        const decision = await policyAgent.canFetch('https://example.com/some-page');

        expect(decision.allowed).toBe(false);
        expect(decision.reason).toContain('Policy Check Failed');
    });
});
