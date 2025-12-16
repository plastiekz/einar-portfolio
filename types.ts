import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

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
  DEEP_DIVE = 'DEEP_DIVE',
  AGENT_COMMAND = 'AGENT_COMMAND'
}

export interface VanguardReport {
  target: string;
  url: string;
  riskLevel: number; // 0 to 100
  riskLabel: 'SAFE' | 'GRAY_ZONE' | 'AGGRESSIVE' | 'ILLEGAL';
  legalBoundaries: string[]; // List of constraints (e.g., "Robots.txt disallow: /api")
  strategy: string; // The detailed policy narrative
  mcpConfig: string; // The JSON/Code for the MCP Server
  reconData: string; // Summary of data found
}

export interface ChartDataPoint {
  name: string;
  value: number;
}
export interface JulesState {
    connectedRepositories: string[];
    sessions: {
        active: string | null;
        history: string[];
    };
}

// Optimization Types
export interface OptimizationResult {
    insights: string[];
    axioms: string[];
    analyzedCount: number;
}

export interface SourceGuide {
    summary: string;
    keyTopics: Array<{ name: string; description: string }>;
    suggestedQuestions: string[];
}

export interface PodcastSegment {
    speaker: string;
    text: string;
}

export interface StrategicPlan {
    diagnosis: string;
    pivot_strategy: string;
    action_items: string[];
    market_gap?: string;
}

// Market Agent Types
export interface MarketItem {
    id: string;
    title: string;
    price: number | string;
    location: string;
    url: string;
    description?: string;
    seller?: string;
    source: string;
    aiScore?: number; // Optional as it comes from analysis
}

export interface DealAnalysis extends MarketItem {
    aiScore: number;
    aiReasoning: string;
    matchType: "STEAL" | "FAIR" | "OVERPRICED" | "PASS";
}

// Legal Agent Types
export interface LawFirm {
    id: string;
    name: string;
    address: string;
    zip: number;
    city: string;
    website?: string;
    email?: string;
    practiceAreas?: string[];
}

export interface PolicyDecision {
    allowed: boolean;
    reason: string;
}
