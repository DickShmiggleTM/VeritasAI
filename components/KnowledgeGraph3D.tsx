import React, { useEffect, useState } from 'react';
import type { KnowledgeGraphData, KnowledgeGraphNode } from '../types';

// This component assumes a library like 'react-force-graph-3d' is available.

interface KnowledgeGraph3DProps {
  graphData: KnowledgeGraphData;
  onNodeClick: (node: KnowledgeGraphNode) => void;
}

const KnowledgeGraph3D: React.FC<KnowledgeGraph3DProps> = ({ graphData, onNodeClick }) => {
  const [ForceGraph3D, setForceGraph3D] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    import('react-force-graph-3d')
      .then(module => {
        setForceGraph3D(() => module.default);
      })
      .catch(err => console.error("Failed to load ForceGraph3D component. Make sure 'react-force-graph-3d' is installed.", err));
  }, []);

  if (!ForceGraph3D) {
    return <div className="flex items-center justify-center h-full text-gray-400">Initializing UMP Graph...</div>;
  }

  return (
    <ForceGraph3D
      graphData={graphData}
      nodeLabel="name"
      nodeAutoColorBy="type"
      onNodeClick={onNodeClick}
      linkDirectionalParticles={1}
      linkDirectionalParticleSpeed={0.006}
      linkDirectionalParticleWidth={1.5}
      linkWidth={0.5}
      backgroundColor="rgba(0,0,0,0)"
      showNavInfo={false}
    />
  );
};

export default React.memo(KnowledgeGraph3D);
