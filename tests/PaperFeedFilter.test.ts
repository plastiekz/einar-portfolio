import { describe, it, expect } from 'vitest';
import { Paper } from '../types';
import { filterPapers } from '../utils/paperFilter';

// Original logic from PaperFeed.tsx for baseline comparison
function originalFilter(papers: Paper[], dateRange: string, now: Date): Paper[] {
  return papers.filter(paper => {
    let matchesDate = true;
    if (dateRange !== 'ALL') {
      const paperDate = new Date(paper.publishedDate);
      const diffInMs = now.getTime() - paperDate.getTime();
      const diffInDays = diffInMs / (1000 * 3600 * 24);

      if (dateRange === '24H') {
        matchesDate = diffInDays <= 1.5;
      } else if (dateRange === '7D') {
        matchesDate = diffInDays <= 7;
      } else if (dateRange === '30D') {
        matchesDate = diffInDays <= 30;
      }
    }
    return matchesDate;
  });
}

describe('PaperFeed Date Filter Logic', () => {
  const now = new Date('2025-11-25T12:00:00Z');
  const dayMs = 24 * 60 * 60 * 1000;

  const papers: Paper[] = [
    { id: '1', publishedDate: new Date(now.getTime() - 0.5 * dayMs).toISOString(), title: 'Recent', authors: [], abstract: '', source: 'ArXiv', category: 'AI' }, // 12h ago
    { id: '2', publishedDate: new Date(now.getTime() - 1.4 * dayMs).toISOString(), title: 'Just inside 24H limit', authors: [], abstract: '', source: 'ArXiv', category: 'AI' }, // 1.4d ago
    { id: '3', publishedDate: new Date(now.getTime() - 1.6 * dayMs).toISOString(), title: 'Just outside 24H limit', authors: [], abstract: '', source: 'ArXiv', category: 'AI' }, // 1.6d ago
    { id: '4', publishedDate: new Date(now.getTime() - 6.9 * dayMs).toISOString(), title: 'Inside 7D', authors: [], abstract: '', source: 'ArXiv', category: 'AI' }, // 6.9d ago
    { id: '5', publishedDate: new Date(now.getTime() - 7.1 * dayMs).toISOString(), title: 'Outside 7D', authors: [], abstract: '', source: 'ArXiv', category: 'AI' }, // 7.1d ago
    { id: '6', publishedDate: new Date(now.getTime() - 29.9 * dayMs).toISOString(), title: 'Inside 30D', authors: [], abstract: '', source: 'ArXiv', category: 'AI' }, // 29.9d ago
    { id: '7', publishedDate: new Date(now.getTime() - 30.1 * dayMs).toISOString(), title: 'Outside 30D', authors: [], abstract: '', source: 'ArXiv', category: 'AI' }, // 30.1d ago
  ];

  const defaultFilters = {
    selectedSource: 'ALL',
    selectedCategory: 'ALL',
    showSavedOnly: false,
    savedPaperIds: new Set<string>(),
  };

  it('filters 24H correctly (Original vs Optimized)', () => {
    const originalResults = originalFilter(papers, '24H', now);
    const optimizedResults = filterPapers(papers, { ...defaultFilters, dateRange: '24H' }, now);

    expect(optimizedResults.map(p => p.id)).toEqual(originalResults.map(p => p.id));
    // 1 (0.5), 2 (1.4)
    expect(optimizedResults.length).toBe(2);
  });

  it('filters 7D correctly (Original vs Optimized)', () => {
    const originalResults = originalFilter(papers, '7D', now);
    const optimizedResults = filterPapers(papers, { ...defaultFilters, dateRange: '7D' }, now);

    expect(optimizedResults.map(p => p.id)).toEqual(originalResults.map(p => p.id));
    // 1, 2, 3 (1.6), 4 (6.9)
    expect(optimizedResults.length).toBe(4);
  });

  it('filters 30D correctly (Original vs Optimized)', () => {
    const originalResults = originalFilter(papers, '30D', now);
    const optimizedResults = filterPapers(papers, { ...defaultFilters, dateRange: '30D' }, now);

    expect(optimizedResults.map(p => p.id)).toEqual(originalResults.map(p => p.id));
    // 1, 2, 3, 4, 5 (7.1), 6 (29.9)
    expect(optimizedResults.length).toBe(6);
  });

  it('filters ALL correctly (Original vs Optimized)', () => {
    const originalResults = originalFilter(papers, 'ALL', now);
    const optimizedResults = filterPapers(papers, { ...defaultFilters, dateRange: 'ALL' }, now);

    expect(optimizedResults.map(p => p.id)).toEqual(originalResults.map(p => p.id));
    expect(optimizedResults.length).toBe(papers.length);
  });
});
