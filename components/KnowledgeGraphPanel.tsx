import React, { Suspense, lazy, useState, useMemo, useEffect } from 'react';
import type { KnowledgeGraphData, KnowledgeGraphNode } from '../types.ts';
import { GraphFilterControls } from './GraphFilterControls.tsx';

const KnowledgeGraph3D = lazy(() => import('./KnowledgeGraph3D.tsx'));

interface KnowledgeGraphPanelProps {
  graphData: KnowledgeGraphData;
  onNodeSelect: (node: KnowledgeGraphNode) => void;
}

export const KnowledgeGraphPanel: React.FC<KnowledgeGraphPanelProps> = ({ graphData, onNodeSelect }) => {
  const [nodeTypeFilters, setNodeTypeFilters] = useState<Record<string, boolean>>({});
  const [collapsedNodes, setCollapsedNodes] = useState(new Set<string>());

  const nodeTypes = useMemo(() => {
    const types = new Set(graphData.nodes.map(n => n.type));
    return Array.from(types).sort();
  }, [graphData.nodes]);

  useEffect(() => {
    setNodeTypeFilters(
      nodeTypes.reduce((acc, type) => ({ ...acc, [type]: true }), {})
    );
    setCollapsedNodes(new Set());
  }, [nodeTypes]);

  const handleFilterChange = (type: string, isEnabled: boolean) => {
    setNodeTypeFilters(prev => ({ ...prev, [type]: isEnabled }));
  };

  const handleNodeToggleCollapse = (node: KnowledgeGraphNode) => {
    const newCollapsedNodes = new Set(collapsedNodes);
    if (newCollapsedNodes.has(node.id)) {
      newCollapsedNodes.delete(node.id);
    } else {
      newCollapsedNodes.add(node.id);
    }
    setCollapsedNodes(newCollapsedNodes);
  };

  const displayedGraph = useMemo(() => {
    const initialVisibleNodes = graphData.nodes.filter(node => nodeTypeFilters[node.type]);

    if (collapsedNodes.size === 0) {
      const initialVisibleNodeIds = new Set(initialVisibleNodes.map(n => n.id));
      // FIX: Add null checks for link.source and link.target as they can be null.
      const links = graphData.links.filter(link =>
        initialVisibleNodeIds.has(typeof link.source === 'object' && link.source ? link.source.id : link.source) &&
        initialVisibleNodeIds.has(typeof link.target === 'object' && link.target ? link.target.id : link.target)
      );
      return { nodes: initialVisibleNodes, links };
    }

    const adjList = new Map<string, string[]>();
    // FIX: Add null checks for source and target before processing.
    graphData.links.forEach(({ source, target }) => {
      const sourceId = typeof source === 'object' && source ? source.id : source;
      const targetId = typeof target === 'object' && target ? target.id : target;
      if (sourceId && targetId) {
        adjList.set(sourceId, [...(adjList.get(sourceId) || []), targetId]);
        adjList.set(targetId, [...(adjList.get(targetId) || []), sourceId]);
      }
    });

    const nodesToHide = new Set<string>();
    let changed = true;
    while (changed) {
      changed = false;
      for (const node of initialVisibleNodes) {
        if (nodesToHide.has(node.id) || collapsedNodes.has(node.id)) continue;

        const neighbors = adjList.get(node.id) || [];
        const shouldHide = neighbors.length > 0 && neighbors.every(neighborId =>
          collapsedNodes.has(neighborId) || nodesToHide.has(neighborId)
        );

        if (shouldHide) {
          if (!nodesToHide.has(node.id)) {
            nodesToHide.add(node.id);
            changed = true;
          }
        }
      }
    }
    
    const finalNodes = initialVisibleNodes.filter(node =>
      !collapsedNodes.has(node.id) && !nodesToHide.has(node.id)
    );
    const finalNodeIds = new Set(finalNodes.map(n => n.id));
    
    // FIX: Add null checks for link.source and link.target.
    const finalLinks = graphData.links.filter(link => {
       const sourceId = typeof link.source === 'object' && link.source ? link.source.id : link.source;
       const targetId = typeof link.target === 'object' && link.target ? link.target.id : link.target;
       return sourceId && targetId && finalNodeIds.has(sourceId) && finalNodeIds.has(targetId);
    });

    return { nodes: finalNodes, links: finalLinks };
  }, [graphData, nodeTypeFilters, collapsedNodes]);

  return (
    <section className="mt-8 pt-6 border-t border-codex-blue">
      <h3 className="text-xl font-serif font-bold text-codex-teal mb-4">Unified Metaphysics Pattern (UMP)</h3>
      <GraphFilterControls
        nodeTypes={nodeTypes}
        filters={nodeTypeFilters}
        onFilterChange={handleFilterChange}
      />
      <div className="h-96 w-full bg-codex-dark rounded-lg border border-codex-blue/50 relative overflow-hidden">
        <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400">Loading UMP Graph...</div>}>
          <KnowledgeGraph3D
            graphData={displayedGraph}
            onNodeClick={handleNodeToggleCollapse}
            onNodeRightClick={onNodeSelect}
            collapsedNodes={collapsedNodes}
          />
        </Suspense>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">Left-click a node to expand/collapse its branch. Right-click to open the Rabbit Hole inquiry.</p>
    </section>
  );
};
