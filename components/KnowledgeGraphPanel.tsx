
import React, { Suspense, useMemo, useState } from 'react';
import type { KnowledgeGraphData, KnowledgeGraphNode } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

const KnowledgeGraph3D = React.lazy(() => import('./KnowledgeGraph3D'));

interface KnowledgeGraphPanelProps {
  graphData: KnowledgeGraphData;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onNodeClick: (node: KnowledgeGraphNode) => void;
}

export const KnowledgeGraphPanel: React.FC<KnowledgeGraphPanelProps> = ({ graphData, isVisible, onToggleVisibility, onNodeClick }) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const nodeTypes = useMemo<string[]>(() => {
    // FIX: Used a type guard in the filter to ensure TypeScript correctly infers the array type as string[], resolving the 'unknown[]' error.
    const types = new Set(graphData.nodes.map(n => n.type).filter((type): type is string => !!type));
    return ['All', ...Array.from(types)];
  }, [graphData.nodes]);

  const filteredData = useMemo(() => {
    if (!activeFilter || activeFilter === 'All') {
      return graphData;
    }
    const filteredNodes = graphData.nodes.filter(node => node.type === activeFilter);
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(link => nodeIds.has(link.source) && nodeIds.has(link.target));
    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, activeFilter]);

  return (
    <div className="bg-codex-blue/30 border border-codex-blue rounded-xl flex flex-col h-full">
      <div className="flex justify-between items-center p-3 border-b border-codex-blue">
        <h3 className="text-lg font-serif font-bold text-codex-teal">UMP Graph</h3>
        <button
          onClick={onToggleVisibility}
          className="p-1 text-gray-400 hover:text-white hover:bg-codex-blue rounded-full"
          title={isVisible ? 'Collapse Graph' : 'Expand Graph'}
        >
          {isVisible ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          )}
        </button>
      </div>
      {isVisible && (
        <>
        {nodeTypes.length > 1 && (
            <div className="p-2 border-b border-codex-blue">
              <p className="text-xs text-gray-400 mb-2 px-1">Lenses:</p>
              <div className="flex flex-wrap gap-1">
                {nodeTypes.map(type => (
                  <button 
                    key={type}
                    onClick={() => setActiveFilter(type)}
                    className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${activeFilter === type ? 'bg-codex-teal text-codex-dark border-codex-teal' : 'bg-transparent border-codex-blue hover:bg-codex-blue/50'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        <div className="flex-grow relative">
          <Suspense fallback={<LoadingSpinner />}>
            <KnowledgeGraph3D graphData={filteredData} onNodeClick={onNodeClick} />
          </Suspense>
        </div>
        </>
      )}
    </div>
  );
};
