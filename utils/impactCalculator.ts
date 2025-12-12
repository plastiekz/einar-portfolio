import { Paper } from '../types';

export const calculateImpactScore = (paper: Omit<Paper, 'impactScore'>): number => {
  let score = 50;

  // 1. Source Factor
  switch (paper.source) {
    case 'Semantic Scholar':
      score += 15;
      break;
    case 'Hugging Face':
      score += 12;
      break;
    case 'ArXiv':
      score += 10;
      break;
    default:
      score += 5;
  }

  // 2. Recency Factor
  // Using the system date (Dec 2025) which matches the mock data timeframe
  const pubDate = new Date(paper.publishedDate);
  const now = new Date();

  // Difference in days
  const diffTime = Math.abs(now.getTime() - pubDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) {
    score += 10;
  } else if (diffDays <= 30) {
    score += 5;
  }

  // 3. Keyword Analysis (Title & Abstract)
  const text = `${paper.title} ${paper.abstract}`.toLowerCase();
  const keywords = [
    'transformer', 'llm', 'diffusion', 'generative', 'state-of-the-art',
    'sota', 'reasoning', 'foundation model', 'multimodal', 'agent'
  ];

  let keywordMatches = 0;
  keywords.forEach(keyword => {
    if (text.includes(keyword)) {
      keywordMatches++;
    }
  });

  // Cap keyword bonus at 20
  score += Math.min(keywordMatches * 5, 20);

  // 4. Carbon/Compute Complexity (Proxy for Model Scale/Significance)
  if (paper.estimatedCarbon) {
    if (paper.estimatedCarbon.label === 'EXTREME' || paper.estimatedCarbon.label === 'HIGH') {
      score += 5;
    }
  }

  // 5. Author Collaboration
  if (paper.authors.length > 3) {
    score += 3;
  }

  // Clamp score between 0 and 100
  return Math.min(Math.max(score, 0), 100);
};
