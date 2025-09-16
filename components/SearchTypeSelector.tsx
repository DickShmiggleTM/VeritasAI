import React from 'react';
import type { SearchType } from '../types';

interface SearchTypeSelectorProps {
  searchType: SearchType;
  onSearchTypeChange: (searchType: SearchType) => void;
  isLoading: boolean;
}

export const SearchTypeSelector: React.FC<SearchTypeSelectorProps> = ({ searchType, onSearchTypeChange, isLoading }) => {
  const searchTypes: { id: SearchType; label: string; description: string }[] = [
    { id: 'web', label: 'Web Search', description: 'A general web search.' },
    { id: 'deep', label: 'Deep Search', description: 'A focused search on academic and historical sites.' },
  ];

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold text-slate-300">Search Type</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {searchTypes.map(type => (
          <button
            key={type.id}
            onClick={() => onSearchTypeChange(type.id)}
            disabled={isLoading}
            className={`p-4 border rounded-lg text-left transition-all duration-200 ${
              searchType === type.id
                ? 'bg-violet-600 border-violet-500 shadow-lg'
                : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <p className="font-semibold text-base text-white">{type.label}</p>
            <p className="text-sm text-slate-400">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
