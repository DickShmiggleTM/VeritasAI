import React from 'react';
import type { ResearchDepth } from '../types';

interface DepthSelectorProps {
  selectedDepth: ResearchDepth;
  onDepthChange: (depth: ResearchDepth) => void;
  disabled: boolean;
}

const depthOptions: { id: ResearchDepth; label: string; description: string }[] = [
  { id: 'surface', label: 'Surface', description: 'Quick overview' },
  { id: 'moderate', label: 'Moderate', description: 'Detailed exploration' },
  { id: 'deep', label: 'Deep Dive', description: 'Comprehensive analysis' },
];

export const DepthSelector: React.FC<DepthSelectorProps> = ({ selectedDepth, onDepthChange, disabled }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">Inquiry Depth</label>
      <div className="grid grid-cols-3 gap-2">
        {depthOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onDepthChange(option.id)}
            disabled={disabled}
            className={`
              px-2 py-2 text-center text-sm rounded-md transition-colors duration-200 border
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-codex-dark focus:ring-codex-teal
              ${disabled ? 'cursor-not-allowed bg-codex-blue/50 text-gray-500 border-codex-blue' : ''}
              ${selectedDepth === option.id 
                ? 'bg-codex-teal text-codex-dark font-semibold shadow-lg border-codex-teal' 
                : 'bg-codex-blue hover:bg-codex-blue/70 text-gray-300 border-codex-blue'
              }
            `}
            title={option.description}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
