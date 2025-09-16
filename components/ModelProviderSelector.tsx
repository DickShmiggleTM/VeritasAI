import React from 'react';
import type { ModelProvider } from '../types';

interface ModelProviderSelectorProps {
  provider: ModelProvider;
  onProviderChange: (provider: ModelProvider) => void;
  ollamaModel: string;
  onOllamaModelChange: (model: string) => void;
  isLoading: boolean;
}

export const ModelProviderSelector: React.FC<ModelProviderSelectorProps> = ({
  provider,
  onProviderChange,
  ollamaModel,
  onOllamaModelChange,
  isLoading,
}) => {
  const providers: { id: ModelProvider; label: string }[] = [
    { id: 'gemini', label: 'Gemini' },
    { id: 'ollama', label: 'Ollama (Local)' },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {providers.map(p => (
          <button
            key={p.id}
            onClick={() => onProviderChange(p.id)}
            disabled={isLoading}
            className={`p-3 border rounded-lg text-center transition-all duration-200 ${
              provider === p.id
                ? 'bg-violet-600 border-violet-500 shadow-lg text-white font-semibold'
                : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-slate-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {provider === 'ollama' && (
        <div className="flex flex-col gap-2">
          <label htmlFor="ollama-model" className="text-sm font-medium text-slate-400">
            Ollama Model Name
          </label>
          <input
            id="ollama-model"
            type="text"
            value={ollamaModel}
            onChange={(e) => onOllamaModelChange(e.target.value)}
            placeholder="e.g., 'llama2' or 'mistral'"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
};
