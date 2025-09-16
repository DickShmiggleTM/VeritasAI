
import React from 'react';
import type { Source } from '../types';

interface SourceListProps {
  sources: Source[];
}

export const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  const validSources = sources.filter(s => s.web && s.web.uri && s.web.title);

  if (validSources.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-slate-700/50">
      <h3 className="text-xl font-serif font-bold text-violet-300 mb-4">Sources</h3>
      <ul className="space-y-3">
        {validSources.map((source, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="text-violet-400 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </span>
            <a
              href={source.web!.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 hover:underline transition-colors duration-200"
            >
              {source.web!.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
