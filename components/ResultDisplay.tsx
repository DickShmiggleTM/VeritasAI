import React, { useState } from 'react';
import type { KnowledgeGraphNode, ResearchResult } from '../types';
import { SourceList } from './SourceList';
import { KnowledgeGraphPanel } from './KnowledgeGraphPanel';

interface ResultDisplayProps {
  result: ResearchResult;
  onNodeClick: (node: KnowledgeGraphNode) => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onNodeClick }) => {
  const { phenomenologicalSummary, metaphysicalFrameworkAnalysis, symbolicResonanceMapping, archetypeFrequencyAnalysis, technologyDeconstruction, firstPrinciplesHypothesis, experimentalProtocols, sources, knowledgeGraph } = result;
  const [showGraph, setShowGraph] = useState(true);

  return (
    <div className="animate-fade-in space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={` ${showGraph && knowledgeGraph.nodes.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'} transition-all duration-300`}>
          <section>
            <h2 className="text-3xl font-serif font-bold text-codex-teal mb-4">Phenomenological Summary</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{phenomenologicalSummary}</p>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-serif font-bold text-codex-teal mb-4">Metaphysical Framework Analysis</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{metaphysicalFrameworkAnalysis}</p>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-serif font-bold text-codex-teal mb-4">Symbolic Resonance Mapping</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{symbolicResonanceMapping}</p>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-serif font-bold text-codex-teal mb-4">Archetype Frequency Analysis</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{archetypeFrequencyAnalysis}</p>
          </section>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <section>
              <h3 className="text-xl font-serif font-bold text-codex-teal mb-4">'Technology' Deconstruction</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {technologyDeconstruction.map((tech, i) => <li key={i}>{tech}</li>)}
              </ul>
            </section>
            <section>
              <h3 className="text-xl font-serif font-bold text-codex-teal mb-4">First Principles Hypothesis</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {firstPrinciplesHypothesis.map((hypo, i) => <li key={i}>{hypo}</li>)}
              </ul>
            </section>
          </div>
          
          <section className="mt-8">
            <h3 className="text-xl font-serif font-bold text-codex-teal mb-4">Experimental Protocols</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              {experimentalProtocols.map((protocol, i) => <li key={i}>{protocol}</li>)}
            </ul>
          </section>
          
          <SourceList sources={sources} />
        </div>
        
        {knowledgeGraph.nodes.length > 0 && (
          <div className="lg:col-span-1 min-h-[400px] lg:min-h-0">
             <KnowledgeGraphPanel graphData={knowledgeGraph} isVisible={showGraph} onToggleVisibility={() => setShowGraph(!showGraph)} onNodeClick={onNodeClick} />
          </div>
        )}
      </div>
    </div>
  );
};