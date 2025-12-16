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
  const now = new Date();
  const pubDate = new Date(paper.publishedDate);

  // Difference in days
  const diffTime = Math.abs(now.getTime() - pubDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) {
    score += 12;
  } else if (diffDays <= 30) {
    score += 8;
  } else if (diffDays <= 90) {
    score += 4;
  }

  // 3. Keyword Analysis (Title & Abstract)
  // Add safety check for text fields
  const title = paper.title || '';
  const abstract = paper.abstract || '';
  const text = `${title} ${abstract}`.toLowerCase();

  // Higher weight keywords
  const highImpactKeywords = [
    'transformer', 'diffusion', 'foundation model', 'state-of-the-art', 'sota',
    'attention', 'neural network', 'deep learning', 'large language model'
  ];

  // Regular keywords
  const regularKeywords = [
    'generative', 'reasoning', 'multimodal', 'agent', 'reinforcement',
    'process supervision', 'architecture', 'linear-time', 'scaling'
  ];

  let keywordBonus = 0;

  highImpactKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      keywordBonus += 6;
    }
  });

  regularKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      keywordBonus += 3;
    }
  });

  // Cap keyword bonus at 30
  score += Math.min(keywordBonus, 30);

  // 4. Carbon/Compute Complexity (Proxy for Model Scale/Significance)
  if (paper.estimatedCarbon) {
    if (paper.estimatedCarbon.label === 'EXTREME') {
      score += 10;
    } else if (paper.estimatedCarbon.label === 'HIGH') {
      score += 6;
    } else if (paper.estimatedCarbon.label === 'MEDIUM') {
      score += 2;
    }
  }

  // 5. Author Collaboration
  // Safety check for authors array
  if (Array.isArray(paper.authors)) {
      if (paper.authors.length > 3 || paper.authors.some(a => a && a.includes('et al.'))) {
        score += 5;
      }
  }

  // Clamp score between 0 and 100
  return Math.min(Math.max(score, 0), 100);
};
