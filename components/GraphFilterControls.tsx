import React from 'react';

interface GraphFilterControlsProps {
  nodeTypes: string[];
  filters: Record<string, boolean>;
  onFilterChange: (type: string, isEnabled: boolean) => void;
}

export const GraphFilterControls: React.FC<GraphFilterControlsProps> = ({ nodeTypes, filters, onFilterChange }) => {
  return (
    <div className="p-2 mb-2 bg-codex-blue/20 rounded-md border border-codex-blue/30">
      <p className="text-xs font-semibold text-gray-400 mb-2">Filter Nodes by Type:</p>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {nodeTypes.map(type => (
          <label key={type} className="flex items-center space-x-2 text-sm cursor-pointer group">
            <input
              type="checkbox"
              checked={filters[type] ?? false}
              onChange={e => onFilterChange(type, e.target.checked)}
              className="form-checkbox h-4 w-4 rounded bg-codex-dark border-codex-blue text-codex-teal focus:ring-codex-teal focus:ring-offset-codex-dark"
            />
            <span className="text-gray-300 group-hover:text-codex-teal transition-colors">{type}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
