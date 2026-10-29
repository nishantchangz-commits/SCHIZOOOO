export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isCrisisOverride?: boolean;
}

export type ActiveTab = 'chat' | 'erp-lab' | 'grounding' | 'library';

export interface ErpCondition {
  id: string;
  name: string;
  subtitle: string;
  leadResearcher: string;
  year: number;
  description: string;
  clinicalSignificance: string;
  waveforms: {
    label: string;
    color: string;
    dash?: string;
    points: { timeMs: number; voltageUv: number }[];
  }[];
  peakMarker?: {
    timeMs: number;
    voltageUv: number;
    label: string;
  };
  notes: string;
}

export interface ResearchArticle {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi?: string;
  keyFindings: string[];
  psychoeducationalTakeaway: string;
  category: 'corollary-discharge' | 'sensory-gating' | 'mmn' | 'oscillations' | 'aberrant-salience';
}

export interface GroundingStep {
  sense: string;
  count: number;
  title: string;
  instruction: string;
  examples: string[];
}
