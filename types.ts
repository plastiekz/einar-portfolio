export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publishedDate: string;
  source: 'ArXiv' | 'Hugging Face' | 'Semantic Scholar';
  category: string;
  url?: string;
  impactScore?: number; // Calculated metric (0-100)
  estimatedCarbon?: {
    tCO2e: number; // Tonnes of CO2 equivalent
    computeHours: number; // GPU hours
    label: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  };
}

export interface Metric {
  label: string;
  value: string | number;
  change: number; // Percentage change
  status: 'positive' | 'negative' | 'neutral';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
  sources?: Array<{
    title: string;
    uri: string;
  }>;
}

export interface DebateTurn {
  speaker: 'PROTOS (Optimist)' | 'KRONOS (Skeptic)' | 'SYNTHESIS (Judge)';
  text: string;
  id: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  RESEARCH_FEED = 'RESEARCH_FEED',
  RESEARCH_RADAR = 'RESEARCH_RADAR',
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE', // New NotebookLM-style view
  DEEP_DIVE = 'DEEP_DIVE'
}

export interface ChartDataPoint {
  name: string;
  value: number;
}