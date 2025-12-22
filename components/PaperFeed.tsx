import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Paper } from '../types';
import { analyzePaper } from "@/services/ai";
import { vectorStore } from "@/services/vectorStore";
import { filterPapers } from "@/utils/paperFilter";
import PaperCard from './PaperCard';

interface PaperFeedProps {
  papers: Paper[];
  savedPaperIds: Set<string>;
  onToggleSave: (id: string) => void;
}

export const PaperFeed: React.FC<PaperFeedProps> = ({ papers, savedPaperIds, onToggleSave }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{ id: string, type: string, text: string } | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorState, setErrorState] = useState<{ id: string, message: string } | null>(null);

  // -- Filter State --
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [dateRange, setDateRange] = useState('ALL'); // ALL, 24H, 7D, 30D
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // -- Derived Options --
  const sources = useMemo(() => ['ALL', ...Array.from(new Set(papers.map(p => p.source)))], [papers]);
  const categories = useMemo(() => ['ALL', ...Array.from(new Set(papers.map(p => p.category)))], [papers]);

  // -- Vector Search State --
  const [vectorResults, setVectorResults] = useState<Paper[] | null>(null);
  const [isSearchingVector, setIsSearchingVector] = useState(false);

  // -- Vector Search Effect --
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setVectorResults(null);
        return;
      }

      setIsSearchingVector(true);
      try {
        const results = await vectorStore.search(searchQuery, 10); // Top 10 semantic matches
        // Reconstruct Paper objects from Vector Documents
        const searchedPapers: Paper[] = results.map(doc => {
          // Try to find in current prop first (fidelity), else reconstruct
          const existing = papers.find(p => p.id === doc.id);
          if (existing) return existing;

          const [title, abstract, categoryLine] = doc.text.split('\n');
          const category = categoryLine?.replace('Category: ', '') || 'Unknown';

          return {
            id: doc.id,
            title: title.trim(),
            abstract: abstract.trim(),
            category: category,
            source: doc.metadata.source || 'Archive',
            authors: doc.metadata.authors || [],
            publishedDate: doc.metadata.publishedDate || new Date().toISOString(),
            url: doc.metadata.url,
            impactScore: Math.round(doc.score * 100) // Use Similarity Score as Impact
          } as Paper;
        });
        setVectorResults(searchedPapers);
      } catch (err) {
        console.error("Vector search failed:", err);
      } finally {
        setIsSearchingVector(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [searchQuery, papers]);

  // -- Filter Logic --
  const filteredPapers = useMemo(() => {
    // If searching, use vector results as base. Otherwise use passed papers.
    const baseList = vectorResults !== null ? vectorResults : papers;

    // Use optimized filter utility to avoid O(N) Date creation
    return filterPapers(baseList, {
      selectedSource,
      selectedCategory,
      dateRange,
      showSavedOnly,
      savedPaperIds
    });
  }, [papers, vectorResults, selectedSource, selectedCategory, dateRange, showSavedOnly, savedPaperIds]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId(prev => {
      if (prev === id) {
        setAnalysisResult(null);
        setLoadingAction(null);
        setErrorState(null);
        return null;
      } else {
        setAnalysisResult(null);
        setErrorState(null);
        return id;
      }
    });
  }, []);

  const handleGeminiAction = useCallback(async (e: React.MouseEvent, paper: Paper, mode: 'summary' | 'critique' | 'creative') => {
    e.stopPropagation();
    setLoadingAction(mode);
    setAnalysisResult(null);
    setErrorState(null);

    try {
      const text = await analyzePaper(paper.title, paper.abstract, paper.source, mode);
      setAnalysisResult({ id: paper.id, type: mode, text });
    } catch (error) {
      setErrorState({
        id: paper.id,
        message: "We couldn't generate the analysis. The network might be congested or the API key limit reached. Please try again."
      });
    } finally {
      setLoadingAction(null);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Filter Control Bar */}
      <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-xl sticky top-4 z-10">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search titles, authors, content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder-slate-600"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide items-center">
          <button
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all whitespace-nowrap ${showSavedOnly
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              : 'bg-slate-900/60 border-white/10 text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
          >
            <svg className="w-4 h-4" fill={showSavedOnly ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Saved ({savedPaperIds.size})
          </button>

          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            aria-label="Filter by Source"
            className="bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer hover:bg-white/5 transition-colors appearance-none min-w-[120px]"
          >
            <option value="ALL">All Sources</option>
            {sources.filter(s => s !== 'ALL').map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by Category"
            className="bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer hover:bg-white/5 transition-colors appearance-none min-w-[140px]"
          >
            <option value="ALL">All Categories</option>
            {categories.filter(c => c !== 'ALL').map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            aria-label="Filter by Date Range"
            className="bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer hover:bg-white/5 transition-colors appearance-none min-w-[130px]"
          >
            <option value="ALL">Any Time</option>
            <option value="24H">Last 24 Hours</option>
            <option value="7D">Last 7 Days</option>
            <option value="30D">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Results Count & Clear */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
          Found {filteredPapers.length} Result{filteredPapers.length !== 1 ? 's' : ''}
        </span>
        {(selectedSource !== 'ALL' || selectedCategory !== 'ALL' || dateRange !== 'ALL' || searchQuery || showSavedOnly) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSource('ALL');
              setSelectedCategory('ALL');
              setDateRange('ALL');
              setShowSavedOnly(false);
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            Clear Filters
          </button>
        )}
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {filteredPapers.length > 0 ? (
          filteredPapers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              isExpanded={expandedId === paper.id}
              isSaved={savedPaperIds.has(paper.id)}
              analysisResult={analysisResult}
              loadingAction={loadingAction}
              errorState={errorState}
              onToggleExpand={toggleExpand}
              onToggleSave={onToggleSave}
              onGeminiAction={handleGeminiAction}
            />
          ))
        ) : (
          <div className="text-center py-20 text-slate-500 bg-black/20 rounded-2xl border border-white/5 border-dashed">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="font-medium tracking-wide">No neural patterns match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
