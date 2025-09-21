import React from 'react';
// FIX: Added .ts extension to fix module resolution error.
import type { Source } from '../types.ts';

interface SourceChunkModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: Source | null;
}

export const SourceChunkModal: React.FC<SourceChunkModalProps> = ({ isOpen, onClose, source }) => {
  if (!isOpen || !source) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-codex-dark border border-codex-teal/50 rounded-lg w-full max-w-2xl shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-codex-blue flex justify-between items-center">
          <div>
            <h2 className="text-lg font-serif font-bold text-codex-teal">Source Justification</h2>
            <p className="text-sm text-codex-gold truncate" title={source.title}>{source.title}</p>
          </div>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-white">&times;</button>
        </header>
        <div className="p-6">
            <p className="text-gray-300 italic">{source.justification}</p>
            <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-codex-teal/70 mt-4 block hover:underline truncate"
            >
              {source.url}
            </a>
        </div>
      </div>
    </div>
  );
};
