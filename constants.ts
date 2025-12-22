import { Metric, Paper, ChartDataPoint } from './types';
import { calculateImpactScore } from './utils/impactCalculator';

export const INITIAL_METRICS: Metric[] = [
  { label: 'Papers Ingested (24h)', value: 142, change: 12.5, status: 'positive' },
  { label: 'Active Collaborators', value: 8, change: 0, status: 'neutral' },
  { label: 'Pending Peer Reviews', value: 24, change: -5.2, status: 'positive' },
  { label: 'Eco-Efficiency Score', value: 'A+', change: 4.2, status: 'positive' },
];

const RAW_PAPERS: Omit<Paper, 'impactScore'>[] = [
  {
    id: 'p1',
    title: 'Attention Is All You Need (Revisited)',
    authors: ['A. Vaswani', 'et al.'],
    abstract: 'A retrospective analysis of the Transformer architecture and its evolution over the last decade. We examine the scaling laws that have held true and the emerging bottlenecks in quadratic attention mechanisms.',
    publishedDate: '2025-11-24',
    source: 'ArXiv',
    category: 'NLP',
    estimatedCarbon: { tCO2e: 120, computeHours: 25000, label: 'HIGH' }
  },
  {
    id: 'p2',
    title: 'Scalable Diffusion Models with Transformers',
    authors: ['W. Peebles', 'S. Xie'],
    abstract: 'Exploring the intersection of diffusion models and transformer architectures (DiT) for high-fidelity image generation. This paper proposes a unified framework that outperforms U-Net based approaches.',
    publishedDate: '2025-11-23',
    source: 'Hugging Face',
    category: 'Computer Vision',
    estimatedCarbon: { tCO2e: 450, computeHours: 80000, label: 'EXTREME' }
  },
  {
    id: 'p3',
    title: 'Chain-of-Thought Prompting Elicits Reasoning',
    authors: ['J. Wei', 'et al.'],
    abstract: 'Investigating how step-by-step reasoning prompts significantly improve LLM performance on complex tasks. We demonstrate that reasoning capabilities emerge as a function of model scale.',
    publishedDate: '2025-11-22',
    source: 'Semantic Scholar',
    category: 'Reasoning',
    estimatedCarbon: { tCO2e: 0.5, computeHours: 100, label: 'LOW' }
  },
  {
    id: 'p4',
    title: 'Liquid Time-Constant Networks: A New Frontier',
    authors: ['R. Hasani', 'D. Rus'],
    abstract: 'Introducing a new class of time-continuous recurrent neural networks. LTCs exhibit stable and bounded behavior, superior expressivity, and causal interpretation capabilities for time-series data.',
    publishedDate: '2025-11-20',
    source: 'ArXiv',
    category: 'Neuromorphic',
    estimatedCarbon: { tCO2e: 12, computeHours: 4000, label: 'MEDIUM' }
  },
  {
    id: 'p5',
    title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
    authors: ['A. Gu', 'T. Dao'],
    abstract: 'Mamba is a new architecture that rivals Transformers in performance while scaling linearly with sequence length. We introduce a selective mechanism that allows the model to compress context efficiently.',
    publishedDate: '2025-11-18',
    source: 'ArXiv',
    category: 'Architecture',
    estimatedCarbon: { tCO2e: 25, computeHours: 6500, label: 'MEDIUM' }
  },
  {
    id: 'p6',
    title: 'Q*: Process Supervision for Mathematical Reasoning',
    authors: ['OpenAI Research'],
    abstract: 'We explore the use of process supervision to guide search in mathematical reasoning tasks. By rewarding correct steps rather than just outcomes, we achieve state-of-the-art results on the MATH dataset.',
    publishedDate: '2025-11-15',
    source: 'Hugging Face',
    category: 'RLHF',
    estimatedCarbon: { tCO2e: 320, computeHours: 60000, label: 'HIGH' }
  },
  // Add more mock papers to test pagination (need > 20)
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `p-gen-${i}`,
    title: `Generated Paper ${i}: Optimizing for Speed`,
    authors: [`Bolt ${i}`],
    abstract: `This is a generated paper #${i} to verify pagination performance. It contains enough text to simulate a real abstract card rendering load.`,
    publishedDate: '2025-11-01',
    source: 'Simulation',
    category: 'Performance',
    estimatedCarbon: { tCO2e: 0.1, computeHours: 10, label: 'LOW' }
  }))
];

export const MOCK_PAPERS: Paper[] = RAW_PAPERS.map(paper => ({
  ...paper,
  impactScore: calculateImpactScore(paper)
}));

export const TREND_DATA: ChartDataPoint[] = [
  { name: 'Mon', value: 45 },
  { name: 'Tue', value: 52 },
  { name: 'Wed', value: 48 },
  { name: 'Thu', value: 61 },
  { name: 'Fri', value: 55 },
  { name: 'Sat', value: 67 },
  { name: 'Sun', value: 72 },
];
