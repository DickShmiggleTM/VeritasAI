import React, { useEffect, useState, useCallback } from 'react';
import type { KnowledgeGraphData, KnowledgeGraphNode } from '../types.ts';

interface KnowledgeGraph3DProps {
  graphData: KnowledgeGraphData;
  onNodeClick: (node: KnowledgeGraphNode) => void;
  onNodeRightClick: (node: KnowledgeGraphNode) => void;
  collapsedNodes: Set<string>;
}

const typeColors: Record<string, string> = {
  'Concept': '#d4af37',
  'Entity': '#4a3b8e',
  'Source': '#28a745',
  'Practice': '#a42a2a',
  'Phenomena': '#00d1b2',
  'Location': '#6b7280',
  'Symbol': '#c026d3',
  'Default': '#0ea5e9'
};

const KnowledgeGraph3D: React.FC<KnowledgeGraph3DProps> = ({ graphData, onNodeClick, onNodeRightClick, collapsedNodes }) => {
  const [ForceGraph3D, setForceGraph3D] = useState<React.ComponentType<any> | null>(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<any>());

  useEffect(() => {
    import('react-force-graph-3d')
      .then(module => {
        setForceGraph3D(() => module.default);
      })
      .catch(err => console.error("Failed to load ForceGraph3D component.", err));
  }, []);

  const handleNodeHover = (node: KnowledgeGraphNode | null) => {
    setHighlightLinks(new Set());
    setHighlightNodes(new Set());

    if (node) {
      const newNodes = new Set([node.id]);
      const newLinks = new Set();
      graphData.links.forEach(link => {
        // FIX: Add null checks for link.source and link.target to prevent runtime errors.
        const sourceId = typeof link.source === 'object' && link.source ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' && link.target ? link.target.id : link.target;

        if (!sourceId || !targetId) return;

        if (sourceId === node.id || targetId === node.id) {
          newLinks.add(link);
          newNodes.add(sourceId === node.id ? targetId : sourceId);
        }
      });
      setHighlightNodes(newNodes);
      setHighlightLinks(newLinks);
    }
  };

  const getNodeColor = useCallback((node: KnowledgeGraphNode) => {
    if (highlightNodes.size > 0) {
      return highlightNodes.has(node.id) ? (typeColors[node.type] || typeColors['Default']) : 'rgba(100, 100, 120, 0.3)';
    }
    return typeColors[node.type] || typeColors['Default'];
  }, [highlightNodes]);

  const getLinkColor = useCallback((link: any) => {
    return highlightLinks.has(link) ? 'rgba(212, 175, 55, 0.8)' : 'rgba(255, 255, 255, 0.2)';
  }, [highlightLinks]);

  const getLinkWidth = useCallback((link: any) => {
    return highlightLinks.has(link) ? 1.2 : 0.5;
  }, [highlightLinks]);

  if (!ForceGraph3D) {
    return <div className="flex items-center justify-center h-full text-gray-400">Initializing UMP Graph...</div>;
  }

  return (
    <ForceGraph3D
      graphData={graphData}
      nodeLabel="name"
      nodeVal={node => collapsedNodes.has(node.id) ? 10 : 5}
      onNodeClick={onNodeClick}
      onNodeRightClick={onNodeRightClick}
      onNodeHover={handleNodeHover}
      nodeColor={getNodeColor}
      linkColor={getLinkColor}
      linkWidth={getLinkWidth}
      linkDirectionalParticles={1}
      linkDirectionalParticleSpeed={0.006}
      linkDirectionalParticleWidth={useCallback((link: any) => highlightLinks.has(link) ? 2 : 0, [highlightLinks])}
      linkDirectionalParticleColor={useCallback(() => '#d4af37', [])}
      backgroundColor="rgba(0,0,0,0)"
      showNavInfo={false}
    />
  );
};

export default React.memo(KnowledgeGraph3D);
