import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { KnowledgeGraph, GraphNode } from '../types';

interface SimulationNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number;
  fy: number;
}

const NODE_COLORS: Record<GraphNode['group'], string> = {
  Concept: '#a78bfa', // violet-400
  Figure: '#7dd3fc', // sky-300
  Text: '#fde047',   // yellow-300
  Practice: '#6ee7b7',// emerald-300
  Location: '#f9a8d4',// pink-300
  Organization: '#fdba74',// orange-300
  Other: '#d1d5db',  // gray-300
};
const ALL_GROUPS = Object.keys(NODE_COLORS);

const getNodeRadius = (node: SimulationNode) => 4 + Math.sqrt(node.connections) * 3;

// Custom hook for running the force simulation
const useForceSimulation = (graph: KnowledgeGraph | null, width: number, height: number) => {
  const [nodes, setNodes] = useState<SimulationNode[]>([]);
  
  useEffect(() => {
    if (!graph || !width || !height || graph.nodes.length === 0) {
      setNodes([]);
      return;
    }

    let simNodes: SimulationNode[] = graph.nodes.map(n => ({ ...n, x: width / 2 + (Math.random() - 0.5) * 5, y: height / 2 + (Math.random() - 0.5) * 5, vx: 0, vy: 0, fx: 0, fy: 0 }));
    let simEdges = graph.edges.map(e => ({ ...e }));

    const numNodes = graph.nodes.length;
    const REPULSION = -1500 - numNodes * 10;
    const ATTRACTION = 0.08;
    const LINK_DISTANCE = Math.max(80, 200 - numNodes * 1.5);
    const DAMPING = 0.95;
    const CENTER_FORCE = 0.02;
    
    let animationFrameId: number;

    const tick = () => {
      for(const node of simNodes) {
        node.fx = 0;
        node.fy = 0;
      }
      
      for (const nodeA of simNodes) {
        nodeA.fx += (width / 2 - nodeA.x) * CENTER_FORCE;
        nodeA.fy += (height / 2 - nodeA.y) * CENTER_FORCE;

        for (const nodeB of simNodes) {
          if (nodeA === nodeB) continue;
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          let distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          const force = REPULSION / (distance * distance);
          nodeA.fx += (dx / distance) * force;
          nodeA.fy += (dy / distance) * force;

          const radiusA = getNodeRadius(nodeA);
          const radiusB = getNodeRadius(nodeB);
          const minDistance = radiusA + radiusB + 5;

          if (distance < minDistance) {
            const overlap = minDistance - distance;
            const adjustX = (overlap / 2) * (dx / distance);
            const adjustY = (overlap / 2) * (dy / distance);
            nodeA.fx -= adjustX;
            nodeA.fy -= adjustY;
            nodeB.fx += adjustX;
            nodeB.fy += adjustY;
          }
        }
      }

      for (const edge of simEdges) {
        const source = simNodes.find(n => n.id === edge.source);
        const target = simNodes.find(n => n.id === edge.target);
        if (!source || !target) continue;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        let distance = Math.sqrt(dx * dx + dy * dy) || 1;
        
        const displacement = distance - LINK_DISTANCE;
        const force = displacement * ATTRACTION;

        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        source.fx += fx;
        source.fy += fy;
        target.fx -= fx;
        target.fy -= fy;
      }
      
      for (const node of simNodes) {
        node.vx = (node.vx + node.fx) * DAMPING;
        node.vy = (node.vy + node.fy) * DAMPING;
        node.x += node.vx;
        node.y += node.vy;

        const radius = getNodeRadius(node);
        node.x = Math.max(radius, Math.min(width - radius, node.x));
        node.y = Math.max(radius, Math.min(height - radius, node.y));
      }

      setNodes([...simNodes]);
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };

  }, [graph, width, height]);

  return nodes;
};

export const KnowledgeGraphPanel: React.FC<{ graph: KnowledgeGraph | null }> = ({ graph }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [visibleGroups, setVisibleGroups] = useState<Set<string>>(new Set(ALL_GROUPS));
  const [searchTerm, setSearchTerm] = useState('');
  
  const [viewTransform, setViewTransform] = useState({ k: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  const filteredGraph = useMemo(() => {
    if (!graph) return null;
    if (visibleGroups.size === ALL_GROUPS.length) return graph;

    const visibleNodes = graph.nodes.filter(node => visibleGroups.has(node.group));
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

    const visibleEdges = graph.edges.filter(
      edge => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );

    return { nodes: visibleNodes, edges: visibleEdges };
  }, [graph, visibleGroups]);

  const nodes = useForceSimulation(filteredGraph, size.width, size.height);
  
  const searchedNodeId = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const found = nodes.find(n => n.id.toLowerCase().includes(searchTerm.toLowerCase()));
    return found ? found.id : null;
  }, [searchTerm, nodes]);

  const highlightedNodeId = hoveredNode || searchedNodeId;

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setSize({ width, height });
      }
    });
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (searchedNodeId) {
      const node = nodes.find(n => n.id === searchedNodeId);
      if (node && size.width && size.height) {
        setViewTransform(prev => ({
          k: prev.k > 1.5 ? prev.k : 1.5, // Zoom in a bit if not already zoomed
          x: size.width / 2 - node.x * (prev.k > 1.5 ? prev.k : 1.5),
          y: size.height / 2 - node.y * (prev.k > 1.5 ? prev.k : 1.5),
        }));
      }
    }
  }, [searchedNodeId, nodes, size.height, size.width]);

  const handleToggleGroup = (group: string) => {
    setVisibleGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const handleToggleAllGroups = () => {
    if (visibleGroups.size === ALL_GROUPS.length) {
      setVisibleGroups(new Set());
    } else {
      setVisibleGroups(new Set(ALL_GROUPS));
    }
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;

    const { k, x, y } = viewTransform;
    const zoomFactor = 0.001;
    const newK = k * (1 - e.deltaY * zoomFactor);
    const clampedK = Math.max(0.1, Math.min(newK, 10));

    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - (mouseX - x) * (clampedK / k);
    const newY = mouseY - (mouseY - y) * (clampedK / k);

    setViewTransform({ k: clampedK, x: newX, y: newY });
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== svgRef.current) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX - viewTransform.x, y: e.clientY - viewTransform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setViewTransform({
      ...viewTransform,
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };

  const connectedNodeIds = useMemo(() => {
    if (!highlightedNodeId || !filteredGraph) return new Set();
    const connected = new Set([highlightedNodeId]);
    filteredGraph.edges.forEach(edge => {
      if (edge.source === highlightedNodeId) connected.add(edge.target);
      if (edge.target === highlightedNodeId) connected.add(edge.source);
    });
    return connected;
  }, [highlightedNodeId, filteredGraph]);

  const renderContent = () => {
    if (!graph || nodes.length === 0) {
      const message = !graph ? "The knowledge web will appear here." : "No nodes match the current filter.";
      return (
        <div className="flex items-center justify-center h-full text-center text-slate-500">
          <p>{message}</p>
        </div>
      );
    }
    
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    return (
      <svg
        ref={svgRef}
        width={size.width}
        height={size.height}
        className={`font-sans ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        <g transform={`translate(${viewTransform.x}, ${viewTransform.y}) scale(${viewTransform.k})`}>
          {filteredGraph?.edges.map((edge, i) => {
            const source = nodeMap.get(edge.source);
            const target = nodeMap.get(edge.target);
            if (!source || !target) return null;
            
            const isHighlighted = highlightedNodeId && (connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target));

            return (
              <line
                key={`${edge.source}-${edge.target}-${i}`}
                x1={source.x} y1={source.y} x2={target.x} y2={target.y}
                stroke="#64748b" strokeWidth={isHighlighted ? 1.5 / viewTransform.k : 1 / viewTransform.k}
                opacity={highlightedNodeId ? (isHighlighted ? 0.9 : 0.1) : 0.4}
                className="transition-opacity duration-300"
              />
            );
          })}

          {nodes.map(node => {
            const radius = getNodeRadius(node);
            const isHighlighted = highlightedNodeId && connectedNodeIds.has(node.id);
            const isDimmed = highlightedNodeId && !connectedNodeIds.has(node.id);

            return (
              <g 
                key={node.id} transform={`translate(${node.x},${node.y})`}
                onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <circle
                  r={radius} fill={NODE_COLORS[node.group as GraphNode['group']] || NODE_COLORS.Other}
                  stroke={isHighlighted ? '#fff' : NODE_COLORS[node.group as GraphNode['group']] || NODE_COLORS.Other}
                  strokeWidth={isHighlighted ? 2 / viewTransform.k : 1 / viewTransform.k}
                  opacity={isDimmed ? 0.2 : 1}
                  className="transition-all duration-300"
                />
                {(isHighlighted || viewTransform.k > 2) && (
                   <text
                      textAnchor="middle" y={-radius - 5}
                      fill="#e2e8f0" fontSize={12 / viewTransform.k}
                      paintOrder="stroke" stroke="#1e293b" strokeWidth={`${4 / viewTransform.k}px`}
                      strokeLinecap="round" strokeLinejoin="round"
                      className="pointer-events-none"
                    >
                     {node.id}
                   </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    );
  };
  
  return (
    <div className="sticky top-6 p-4 bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl animate-fade-in aspect-square flex flex-col">
      <h2 className="text-xl font-serif font-bold text-violet-300 mb-2 flex-shrink-0 px-2">Knowledge Graph</h2>
      
      <div className="flex-shrink-0 px-2 pb-2 space-y-2">
        <input
          type="search"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-400"
        />
        <div className="flex flex-wrap gap-1.5">
          <button onClick={handleToggleAllGroups} className={`px-2 py-0.5 text-xs font-semibold rounded-full transition-colors duration-200 ${visibleGroups.size === ALL_GROUPS.length ? 'bg-violet-600 text-white' : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'}`}>All</button>
          {ALL_GROUPS.map(group => (
            <button key={group} onClick={() => handleToggleGroup(group)} className={`px-2 py-0.5 text-xs font-semibold rounded-full transition-colors duration-200 ${visibleGroups.has(group) ? 'bg-violet-600 text-white' : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'}`}>
              {group}
            </button>
          ))}
        </div>
      </div>

      <div ref={containerRef} className="w-full h-full flex-grow relative bg-[radial-gradient(circle_at_1px_1px,_#334155_1px,_transparent_0)] [background-size:16px_16px] rounded-b-lg">
        {renderContent()}
      </div>
    </div>
  );
};