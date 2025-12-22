import { Paper } from '../types';

/**
 * Filter papers based on search query, source, category, date range, and saved status.
 * Optimized to avoid repeated Date object creation inside the loop.
 *
 * @param papers - List of papers to filter (or vector results)
 * @param filters - Filter criteria
 * @param now - Reference date for relative time calculations (defaults to current time)
 */
export function filterPapers(
  papers: Paper[],
  filters: {
    selectedSource: string;
    selectedCategory: string;
    dateRange: string;
    showSavedOnly: boolean;
    savedPaperIds: Set<string>;
  },
  now: Date = new Date()
): Paper[] {
  const { selectedSource, selectedCategory, dateRange, showSavedOnly, savedPaperIds } = filters;

  // Pre-calculate date cutoff to avoid O(N) Date objects and math
  let cutoffDate: number | null = null;

  if (dateRange !== 'ALL') {
    const nowTime = now.getTime();
    if (dateRange === '24H') {
      // Logic was: diffInDays <= 1.5
      // diffInDays = (now - paper) / (1000*3600*24)
      // (now - paper) / dayMs <= 1.5
      // now - paper <= 1.5 * dayMs
      // paper >= now - 1.5 * dayMs
      cutoffDate = nowTime - (1.5 * 24 * 60 * 60 * 1000);
    } else if (dateRange === '7D') {
      cutoffDate = nowTime - (7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === '30D') {
      cutoffDate = nowTime - (30 * 24 * 60 * 60 * 1000);
    }
  }

  return papers.filter(paper => {
    // 1. Source
    if (selectedSource !== 'ALL' && paper.source !== selectedSource) {
      return false;
    }

    // 2. Category
    if (selectedCategory !== 'ALL' && paper.category !== selectedCategory) {
      return false;
    }

    // 3. Date Range
    if (cutoffDate !== null) {
      const paperTime = new Date(paper.publishedDate).getTime();
      if (paperTime < cutoffDate) {
        return false;
      }
    }

    // 4. Saved Only
    if (showSavedOnly && !savedPaperIds.has(paper.id)) {
      return false;
    }

    return true;
  });
}
