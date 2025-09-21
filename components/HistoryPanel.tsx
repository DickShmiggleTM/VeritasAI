import React from 'react';
// FIX: Added .ts extension to fix module resolution error.
import type { HistoryItem } from '../types.ts';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect }) => {

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 technomancer-section">
      <h3 className="text-xl font-serif font-bold text-codex-teal mb-4">Session Archive</h3>
      <div className="max-h-60 overflow-y-auto pr-2">
        <ul className="space-y-2">
          {history.map(item => (
            <li key={item.id}>
              <button
                onClick={() => onSelect(item)}
                className="w-full text-left p-3 rounded-md hover:bg-codex-blue transition-colors border border-codex-blue/50 hover:border-codex-teal/30"
              >
                <p className="font-semibold text-gray-300 truncate" title={item.topic}>
                  {item.topic || "Image-based inquiry"}
                </p>
                {item.documentName && (
                  <p className="text-xs text-codex-teal/70 truncate" title={item.documentName}>
                      Context: {item.documentName}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
