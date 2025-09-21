import React from 'react';
import type { KnowledgeGraphNode } from '../types';

interface RabbitHoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: KnowledgeGraphNode | null;
  onConfirmResearch: (topic: string) => void;
}

export const RabbitHoleModal: React.FC<RabbitHoleModalProps> = ({ isOpen, onClose, node, onConfirmResearch }) => {
  if (!isOpen || !node) return null;

  const handleConfirm = () => {
    onConfirmResearch(node.name);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-codex-dark border border-codex-teal/50 rounded-lg p-8 w-full max-w-md shadow-2xl shadow-codex-teal/20"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-serif font-bold text-codex-teal mb-4 animate-glow">Go Deeper?</h2>
        <p className="text-gray-300 mb-6">
          Initiate new inquiry based on the concept: <strong className="text-codex-gold">{node.name}</strong>?
        </p>
        <div className="flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="bg-codex-blue text-white font-bold py-2 px-4 rounded-md hover:bg-codex-blue/70 border border-codex-blue transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="bg-codex-purple text-white font-bold py-2 px-4 rounded-md hover:bg-codex-purple/80 border border-codex-purple transition-colors"
          >
            Begin Inquiry
          </button>
        </div>
      </div>
    </div>
  );
};
