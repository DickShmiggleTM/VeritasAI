import React from 'react';
import type { Source } from '../types';

interface SourceListProps {
  sources: Source[];
}

const getConfidenceColor = (score: number) => {
  if (score < 40) return 'bg-red-500';
  if (score < 75) return 'bg-yellow-500';
  return 'bg-green-500';
};

export const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 pt-6 border-t border-codex-blue">
      <h3 className="text-xl font-serif font-bold text-codex-teal mb-4">Data Provenance & Sources</h3>
      <ul className="space-y-4">
        {sources.map((source, index) => (
          <li key={index} className="bg-codex-blue/30 p-4 rounded-lg border border-codex-blue/50">
            <h4 className="font-semibold text-codex-gold">
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline"
              >
                {source.title}
              </a>
            </h4>
            
            <div className="mt-2 group relative">
              <div className="flex items-center">
                <p className="text-xs text-gray-400 mr-2">Contextual Confidence:</p>
                <div className="w-full bg-codex-dark rounded-full h-2.5 border border-codex-blue">
                  <div 
                    className={`${getConfidenceColor(source.confidenceScore)} h-2.5 rounded-full`} 
                    style={{ width: `${source.confidenceScore}%` }}
                  ></div>
                </div>
                 <p className="text-xs text-gray-300 ml-2">{source.confidenceScore}/100</p>
              </div>
              <div className="absolute bottom-full left-0 mb-2 w-full max-w-md p-2 text-xs text-white bg-codex-dark rounded-md border border-codex-teal/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <strong>Justification:</strong> {source.justification}
              </div>
            </div>

            <p className="text-xs text-codex-teal/70 mt-3 truncate">
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{source.url}</a>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};
