import type { GroundingChunk } from "@google/genai";

export type Source = GroundingChunk;

export interface GraphNode {
  id: string; // The name of the concept/entity
  group: 'Concept' | 'Figure' | 'Text' | 'Practice' | 'Location' | 'Organization' | 'Other'; // Type of node
  connections: number; // Number of edges connected to this node
}

export interface GraphEdge {
  source: string; // ID of the source node
  target: string; // ID of the target node
  label: string; // Description of the relationship
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface HistoryItem {
  id: string;
  topic: string;
  result: string;
  sources: Source[];
  tags?: string[];
  graph?: KnowledgeGraph;
  bookmarked?: boolean;
}

export type ResearchDepth = 'surface' | 'moderate' | 'deep';
export type SearchType = 'web' | 'deep';
export type ModelProvider = 'gemini' | 'ollama';

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  content: string;
}