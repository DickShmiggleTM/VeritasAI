import React from 'react';
import type { ResearchDepth } from '../types';

interface DepthSelectorProps {
  depth: ResearchDepth;
  onDepthChange: (depth: ResearchDepth) => void;
  isLoading: boolean;
}

const options: { value: ResearchDepth; label: string }[] = [
  { value: 'surface', label: 'Surface' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'deep', label: 'Deep' },
];

export const DepthSelector: React.FC<DepthSelectorProps> = ({ depth, onDepthChange, isLoading }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 px-2">
      <label className="text-sm font-medium text-slate-400 flex-shrink-0">Research Depth:</label>
      <div className="flex items-center p-1 rounded-full bg-slate-800/70 border border-slate-700/50 w-full sm:w-auto">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onDepthChange(option.value)}
            disabled={isLoading}
            className={`w-full sm:w-auto px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-violet-400 ${
              depth === option.value
                ? 'bg-violet-600 text-white shadow'
                : 'text-slate-300 hover:bg-slate-700/50'
            } ${isLoading ? 'cursor-not-allowed opacity-60' : ''}`}
            aria-pressed={depth === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
