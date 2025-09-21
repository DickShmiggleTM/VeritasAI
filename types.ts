export type ResearchDepth = 'surface' | 'moderate' | 'deep';

export interface Source {
  url: string;
  title: string;
  confidenceScore: number;
  justification: string;
}

export interface KnowledgeGraphNode {
  id: string;
  name: string;
  type: string;
  description?: string;
}

export interface KnowledgeGraphLink {
  source: string;
  target: string;
  label: string;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  links: KnowledgeGraphLink[];
}

export interface ResearchResult {
  summary: string;
  graphData: KnowledgeGraphData;
  sources: Source[];
}

export interface HistoryItem {
  id: string;
  topic: string;
  documentName?: string;
  imageQuery?: boolean;
  timestamp: string;
  depth: ResearchDepth;
  result: ResearchResult;
}

export type AiProvider = 'google' | 'ollama' | 'mistral' | 'cohere' | 'openrouter' | 'huggingface' | 'chutes';
export type AiProviderWithKeys = 'mistral' | 'cohere' | 'openrouter' | 'huggingface' | 'chutes';

export interface ApiKeyEntry {
  key: string;
  errorCount: number;
}

export interface Settings {
  provider: AiProvider;
  activeProvider: AiProvider;
  activeApiKeyIndex: Record<AiProviderWithKeys, number>;
  apiKeys: Record<AiProviderWithKeys, ApiKeyEntry[]>;
  models: Record<AiProvider, string>;
  ollama: {
    serverUrl: string;
    availableModels: string[];
  };
  theme: 'dark' | 'light';
  showTooltips: boolean;
}

export interface LocalDocument {
  id: string;
  name:string;
  content: string;
  embedding?: number[];
  createdAt: string;
}
