import React, { useState } from 'react';
import type { Settings, AiProvider } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

const providerNames: Record<AiProvider, string> = {
  google: 'Google Gemini',
  ollama: 'Ollama (Local)',
  mistral: 'Mistral AI',
  cohere: 'Cohere',
  openrouter: 'OpenRouter',
  huggingface: 'HuggingFace',
  chutes: 'Chutes AI',
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [ollamaStatus, setOllamaStatus] = useState('');

  if (!isOpen) return null;

  const handleProviderChange = (provider: AiProvider) => {
    setLocalSettings(s => ({ ...s, provider }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    
    setLocalSettings(s => {
      const newSettings = JSON.parse(JSON.stringify(s));
      let current = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleFetchOllamaModels = async () => {
    setOllamaStatus('Fetching...');
    try {
      const response = await fetch(`${localSettings.ollama.serverUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const data = await response.json();
      const modelNames = data.models.map((m: any) => m.name);
      setLocalSettings(s => ({ ...s, ollama: { ...s.ollama, availableModels: modelNames }, models: {...s.models, ollama: modelNames[0] || ''} }));
      setOllamaStatus(`Found ${modelNames.length} models.`);
    } catch (error) {
      setOllamaStatus(`Connection failed: ${error.message}`);
    }
  };

  const renderProviderSettings = () => {
    switch (localSettings.provider) {
      case 'google':
        return <p className="text-sm text-gray-400">Google Gemini is configured using environment variables on the server. No client-side configuration is needed.</p>;
      case 'ollama':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Server URL</label>
              <input type="text" name="ollama.serverUrl" value={localSettings.ollama.serverUrl} onChange={handleInputChange} className="w-full mt-1 bg-codex-blue/50 border border-codex-blue rounded-md p-2 focus:ring-2 focus:ring-codex-teal"/>
            </div>
            <div>
              <button onClick={handleFetchOllamaModels} className="text-sm bg-codex-blue hover:bg-codex-blue/70 p-2 rounded-md">Fetch Models</button>
              {ollamaStatus && <p className="text-xs text-gray-500 mt-1">{ollamaStatus}</p>}
            </div>
            {localSettings.ollama.availableModels.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-400">Model</label>
                <select name="models.ollama" value={localSettings.models.ollama} onChange={handleInputChange} className="w-full mt-1 bg-codex-blue/50 border border-codex-blue rounded-md p-2 focus:ring-2 focus:ring-codex-teal">
                  {localSettings.ollama.availableModels.map(model => <option key={model} value={model}>{model}</option>)}
                </select>
              </div>
            )}
          </div>
        );
      case 'mistral':
      case 'cohere':
      case 'openrouter':
      case 'huggingface':
      case 'chutes':
        const keyName = localSettings.provider as 'mistral' | 'cohere' | 'openrouter' | 'huggingface' | 'chutes';
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">API Key</label>
              <input type="password" name={`apiKeys.${keyName}`} value={localSettings.apiKeys[keyName]} onChange={handleInputChange} className="w-full mt-1 bg-codex-blue/50 border border-codex-blue rounded-md p-2 focus:ring-2 focus:ring-codex-teal"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Model Name</label>
              <input type="text" name={`models.${keyName}`} value={localSettings.models[keyName]} onChange={handleInputChange} className="w-full mt-1 bg-codex-blue/50 border border-codex-blue rounded-md p-2 focus:ring-2 focus:ring-codex-teal"/>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-codex-dark border border-codex-teal/50 rounded-lg w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-serif font-bold text-codex-teal p-6 border-b border-codex-blue">AI Configuration</h2>
        <div className="flex">
          <div className="w-1/3 border-r border-codex-blue p-4 space-y-1">
            {Object.keys(providerNames).map(p => (
              <button key={p} onClick={() => handleProviderChange(p as AiProvider)} className={`w-full text-left text-sm p-2 rounded ${localSettings.provider === p ? 'bg-codex-teal/20 text-codex-teal' : 'hover:bg-codex-blue/50'}`}>
                {providerNames[p as AiProvider]}
              </button>
            ))}
          </div>
          <div className="w-2/3 p-6">
            <h3 className="text-lg font-bold text-gray-200 mb-4">{providerNames[localSettings.provider]} Settings</h3>
            {renderProviderSettings()}
          </div>
        </div>
        <div className="p-6 border-t border-codex-blue flex justify-end">
          <button onClick={handleSave} className="bg-codex-purple text-white font-bold py-2 px-4 rounded-md hover:bg-codex-purple/80 border border-codex-purple">
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
