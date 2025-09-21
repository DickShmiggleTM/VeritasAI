import React from 'react';
// FIX: Added .ts extension to fix module resolution error.
// FIX: Added KnowledgeGraphNode to imports for use in the handler.
import type { HistoryItem, KnowledgeGraphNode } from '../types.ts';
// FIX: Added .tsx extension to fix module resolution error.
import { ResultDisplay } from './ResultDisplay.tsx';

interface HistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: HistoryItem | null;
  onNodeClick: (topic: string) => void;
}

export const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ isOpen, onClose, item, onNodeClick }) => {
  if (!isOpen || !item) return null;

  // FIX: Update handler to accept a KnowledgeGraphNode as expected by ResultDisplay's onNodeSelectForRabbitHole prop.
  const handleNodeClickAndClose = (node: KnowledgeGraphNode) => {
    onNodeClick(node.name);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-codex-dark border border-codex-teal/50 rounded-lg w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-codex-blue flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-serif font-bold text-codex-teal">Archived Inquiry</h2>
            <p className="text-sm text-gray-400 truncate">
              Topic: <span className="text-codex-gold">{item.topic}</span> ({item.depth})
            </p>
          </div>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-white">&times;</button>
        </header>
        <div className="overflow-y-auto p-4 flex-grow">
           {/* FIX: Pass handler to the correct prop `onNodeSelectForRabbitHole` instead of the non-existent `onNodeClick`. */}
           <ResultDisplay result={item.result} onNodeSelectForRabbitHole={handleNodeClickAndClose} />
        </div>
      </div>
    </div>
  );
};
