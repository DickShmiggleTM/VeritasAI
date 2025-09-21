import React from 'react';
import type { HistoryItem } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect }) => {

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-6 border-t border-codex-blue/50">
      <h3 className="text-xl font-serif font-bold text-codex-teal mb-4">Session Archive</h3>
      <ul className="space-y-2 max-h-96 overflow-y-auto">
        {history.map(item => (
          <li key={item.id}>
            <button
              onClick={() => onSelect(item)}
              className="w-full text-left p-2 rounded-md hover:bg-codex-blue transition-colors border border-transparent hover:border-codex-teal/30"
            >
              <p className="font-semibold text-gray-300 truncate" title={item.topic}>
                {item.topic || "Image-based inquiry"}
              </p>
              <p className="text-xs text-gray-500">{item.timestamp}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
