import { Metric, Paper, ChartDataPoint } from './types';

export const INITIAL_METRICS: Metric[] = [
  { label: 'Papers Ingested (24h)', value: 142, change: 12.5, status: 'positive' },
  { label: 'Active Collaborators', value: 8, change: 0, status: 'neutral' },
  { label: 'Pending Peer Reviews', value: 24, change: -5.2, status: 'positive' },
  { label: 'Eco-Efficiency Score', value: 'A+', change: 4.2, status: 'positive' },
];

const getRelativeDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const MOCK_PAPERS: Paper[] = [
  {
    id: 'p1',
    title: 'Attention Is All You Need (Revisited)',
    authors: ['A. Vaswani', 'et al.'],
    abstract: 'A retrospective analysis of the Transformer architecture and its evolution over the last decade. We examine the scaling laws that have held true and the emerging bottlenecks in quadratic attention mechanisms.',
    publishedDate: getRelativeDate(1), // Yesterday
    source: 'ArXiv',
    category: 'NLP',
    impactScore: 98,
    estimatedCarbon: { tCO2e: 120, computeHours: 25000, label: 'HIGH' }
  },
  {
    id: 'p2',
    title: 'Scalable Diffusion Models with Transformers',
    authors: ['W. Peebles', 'S. Xie'],
    abstract: 'Exploring the intersection of diffusion models and transformer architectures (DiT) for high-fidelity image generation. This paper proposes a unified framework that outperforms U-Net based approaches.',
    publishedDate: getRelativeDate(2), // 2 days ago
    source: 'Hugging Face',
    category: 'Computer Vision',
    impactScore: 95,
    estimatedCarbon: { tCO2e: 450, computeHours: 80000, label: 'EXTREME' }
  },
  {
    id: 'p3',
    title: 'Chain-of-Thought Prompting Elicits Reasoning',
    authors: ['J. Wei', 'et al.'],
    abstract: 'Investigating how step-by-step reasoning prompts significantly improve LLM performance on complex tasks. We demonstrate that reasoning capabilities emerge as a function of model scale.',
    publishedDate: getRelativeDate(3), // 3 days ago
    source: 'Semantic Scholar',
    category: 'Reasoning',
    impactScore: 92,
    estimatedCarbon: { tCO2e: 0.5, computeHours: 100, label: 'LOW' }
  },
  {
    id: 'p4',
    title: 'Liquid Time-Constant Networks: A New Frontier',
    authors: ['R. Hasani', 'D. Rus'],
    abstract: 'Introducing a new class of time-continuous recurrent neural networks. LTCs exhibit stable and bounded behavior, superior expressivity, and causal interpretation capabilities for time-series data.',
    publishedDate: getRelativeDate(5), // 5 days ago
    source: 'ArXiv',
    category: 'Neuromorphic',
    impactScore: 89,
    estimatedCarbon: { tCO2e: 12, computeHours: 4000, label: 'MEDIUM' }
  },
  {
    id: 'p5',
    title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
    authors: ['A. Gu', 'T. Dao'],
    abstract: 'Mamba is a new architecture that rivals Transformers in performance while scaling linearly with sequence length. We introduce a selective mechanism that allows the model to compress context efficiently.',
    publishedDate: getRelativeDate(7), // 7 days ago
    source: 'ArXiv',
    category: 'Architecture',
    impactScore: 94,
    estimatedCarbon: { tCO2e: 25, computeHours: 6500, label: 'MEDIUM' }
  },
  {
    id: 'p6',
    title: 'Q*: Process Supervision for Mathematical Reasoning',
    authors: ['OpenAI Research'],
    abstract: 'We explore the use of process supervision to guide search in mathematical reasoning tasks. By rewarding correct steps rather than just outcomes, we achieve state-of-the-art results on the MATH dataset.',
    publishedDate: getRelativeDate(10), // 10 days ago
    source: 'Hugging Face',
    category: 'RLHF',
    impactScore: 99,
    estimatedCarbon: { tCO2e: 320, computeHours: 60000, label: 'HIGH' }
  }
];

export const TREND_DATA: ChartDataPoint[] = [
  { name: 'Mon', value: 45 },
  { name: 'Tue', value: 52 },
  { name: 'Wed', value: 48 },
  { name: 'Thu', value: 61 },
  { name: 'Fri', value: 55 },
  { name: 'Sat', value: 67 },
  { name: 'Sun', value: 72 },
];
