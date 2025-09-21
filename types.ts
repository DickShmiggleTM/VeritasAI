import type { Part } from "@google/genai";

export type ResearchDepth = 'surface' | 'moderate' | 'deep';

export interface Source {
  title: string;
  url: string;
  justification: string;
  confidenceScore: number;
}

export interface KnowledgeGraphNode {
  id: string;
  name: string;
  type: string;
  details: string;
}

export interface KnowledgeGraphLink {
  source: string;
  target: string;
  relationship: string;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  links: KnowledgeGraphLink[];
}

export interface ResearchResult {
  phenomenologicalSummary: string;
  metaphysicalFrameworkAnalysis: string;
  symbolicResonanceMapping: string;
  archetypeFrequencyAnalysis: string;
  technologyDeconstruction: string[];
  firstPrinciplesHypothesis: string[];
  experimentalProtocols: string[];
  sources: Source[];
  knowledgeGraph: KnowledgeGraphData;
}

export interface HistoryItem {
  id: string;
  topic: string;
  timestamp: string;
  result: ResearchResult;
  imageName?: string;
}

export type AiProvider = 'google' | 'ollama' | 'mistral' | 'cohere' | 'openrouter' | 'huggingface' | 'chutes';

export interface Settings {
  provider: AiProvider;
  apiKeys: {
    mistral: string;
    cohere: string;
    openrouter: string;
    huggingface: string;
    chutes: string;
  };
  models: {
    google: string;
    ollama: string;
    mistral: string;
    cohere: string;
    openrouter: string;
    huggingface: string;
    chutes: string;
  };
  ollama: {
    serverUrl: string;
    availableModels: string[];
  };
  theme: 'dark' | 'light';
  showTooltips: boolean;
}
