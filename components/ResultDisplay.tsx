import React from 'react';
// FIX: Added .ts extension to fix module resolution error.
import type { ResearchResult, KnowledgeGraphNode } from '../types.ts';
// FIX: Added .tsx extension to fix module resolution error.
import { KnowledgeGraphPanel } from './KnowledgeGraphPanel.tsx';
// FIX: Added .tsx extension to fix module resolution error.
import { SourceList } from './SourceList.tsx';

interface ResultDisplayProps {
  result: ResearchResult;
  onNodeSelectForRabbitHole: (node: KnowledgeGraphNode) => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onNodeSelectForRabbitHole }) => {
  if (!result) return null;

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xl font-serif font-bold text-codex-teal mb-4">Synthesis & Summary</h3>
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
      </section>

      {result.graphData && result.graphData.nodes.length > 0 && (
        <KnowledgeGraphPanel graphData={result.graphData} onNodeSelect={onNodeSelectForRabbitHole} />
      )}
      
      {result.sources && result.sources.length > 0 && (
        <SourceList sources={result.sources} />
      )}
    </div>
  );
};
