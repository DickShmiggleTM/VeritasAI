import React, { useState, useEffect } from 'react';
// FIX: Added .ts extension to fix module resolution error.
import type { Settings, AiProvider, AiProviderWithKeys } from '../types.ts';

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

const providersWithKeys: AiProviderWithKeys[] = ['mistral', 'cohere', 'openrouter', 'huggingface', 'chutes'];
const testableProviders: AiProviderWithKeys[] = ['mistral', 'cohere', 'openrouter'];


type StatusType = 'idle' | 'loading' | 'success' | 'error';
interface StatusState {
    message: string;
    type: StatusType;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [ollamaStatus, setOllamaStatus] = useState<StatusState>({ message: '', type: 'idle' });
  const [keyTestStatus, setKeyTestStatus] = useState<{ [key: string]: StatusState }>({});

  useEffect(() => {
    // Reset local state if settings prop changes from outside (e.g., failover)
    setLocalSettings(settings);
  }, [settings]);
  
  // Reset statuses when modal is opened or provider changes
  useEffect(() => {
    if (isOpen) {
        setOllamaStatus({ message: '', type: 'idle' });
        setKeyTestStatus({});
    }
  }, [isOpen, localSettings.provider]);


  if (!isOpen) return null;

  const handleProviderChange = (provider: AiProvider) => {
    setLocalSettings(s => ({ ...s, provider }));
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const provider = name.split('.')[1] as keyof Settings['models'];
    setLocalSettings(s => ({ ...s, models: { ...s.models, [provider]: value } }));
  };
  
  const handleOllamaUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setLocalSettings(s => ({ ...s, ollama: { ...s.ollama, serverUrl: value } }));
  };

  const handleApiKeyChange = (provider: AiProviderWithKeys, index: number, value: string) => {
    setLocalSettings(s => {
      const newApiKeys = [...s.apiKeys[provider]];
      newApiKeys[index] = { ...newApiKeys[index], key: value, errorCount: 0 };
      return { ...s, apiKeys: { ...s.apiKeys, [provider]: newApiKeys } };
    });
  };

  const handleAddApiKey = (provider: AiProviderWithKeys) => {
    setLocalSettings(s => {
      const newApiKeys = [...s.apiKeys[provider], { key: '', errorCount: 0 }];
      return { ...s, apiKeys: { ...s.apiKeys, [provider]: newApiKeys } };
    });
  };
  
  const handleRemoveApiKey = (provider: AiProviderWithKeys, index: number) => {
    setLocalSettings(s => {
      const newApiKeys = s.apiKeys[provider].filter((_, i) => i !== index);
      return { ...s, apiKeys: { ...s.apiKeys, [provider]: newApiKeys } };
    });
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleFetchOllamaModels = async () => {
    setOllamaStatus({ message: 'Fetching...', type: 'loading' });
    try {
      const response = await fetch(`${localSettings.ollama.serverUrl}/api/tags`);
      if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
      const data = await response.json();
      const modelNames = data.models.map((m: any) => m.name);
      setLocalSettings(s => ({ ...s, ollama: { ...s.ollama, availableModels: modelNames }, models: {...s.models, ollama: modelNames[0] || ''} }));
      setOllamaStatus({ message: `Success! Found ${modelNames.length} models.`, type: 'success' });
    } catch (error) {
      setOllamaStatus({ message: `Connection failed: ${error instanceof Error ? error.message : String(error)}`, type: 'error' });
    }
  };

  const handleTestApiKey = async (provider: AiProviderWithKeys, index: number) => {
    const keyId = `${provider}-${index}`;
    const apiKey = localSettings.apiKeys[provider][index].key;
    if (!apiKey) {
        setKeyTestStatus(s => ({ ...s, [keyId]: { message: 'API key is empty.', type: 'error' } }));
        return;
    }
    setKeyTestStatus(s => ({ ...s, [keyId]: { message: 'Testing...', type: 'loading' } }));

    const testEndpoints: Record<AiProviderWithKeys, string | null> = {
        mistral: 'https://api.mistral.ai/v1/models',
        cohere: 'https://api.cohere.com/v1/models', // Uses GET
        openrouter: 'https://openrouter.ai/api/v1/models',
        huggingface: null, // No simple validation endpoint
        chutes: null, // Assume no simple validation endpoint
    };
    
    const url = testEndpoints[provider];
    if (!url) return;

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        if (!response.ok) throw new Error(`Failed with status ${response.status}`);
        setKeyTestStatus(s => ({ ...s, [keyId]: { message: 'Connection successful!', type: 'success' } }));
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        setKeyTestStatus(s => ({ ...s, [keyId]: { message: `Test failed: ${message}`, type: 'error' } }));
    }
  };
  
  const getStatusColor = (type: StatusType) => {
    switch(type) {
        case 'success': return 'text-codex-teal';
        case 'error': return 'text-codex-red';
        case 'loading': return 'text-gray-400';
        default: return 'text-gray-500';
    }
  }


  const renderProviderSettings = () => {
    const selectedProvider = localSettings.provider;
    if (selectedProvider === 'google') {
      return <p className="text-sm text-gray-400">Google Gemini is configured using environment variables. No client-side configuration is needed.</p>;
    }
    
    if (selectedProvider === 'ollama') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Server URL</label>
            <input type="text" name="ollama.serverUrl" value={localSettings.ollama.serverUrl} onChange={handleOllamaUrlChange} className="w-full mt-1 bg-codex-blue/50 border border-codex-blue rounded-md p-2 focus:ring-2 focus:ring-codex-teal"/>
          </div>
          <div>
            <button onClick={handleFetchOllamaModels} className="text-sm bg-codex-blue hover:bg-codex-blue/70 p-2 rounded-md">Fetch Models</button>
            {ollamaStatus.message && <p className={`text-xs mt-2 ${getStatusColor(ollamaStatus.type)}`}>{ollamaStatus.message}</p>}
          </div>
          {localSettings.ollama.availableModels.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-400">Model</label>
              <select name="models.ollama" value={localSettings.models.ollama} onChange={handleModelChange} className="w-full mt-1 bg-codex-blue/50 border border-codex-blue rounded-md p-2 focus:ring-2 focus:ring-codex-teal">
                {localSettings.ollama.availableModels.map(model => <option key={model} value={model}>{model}</option>)}
              </select>
            </div>
          )}
        </div>
      );
    }

    if (providersWithKeys.includes(selectedProvider as AiProviderWithKeys)) {
      const providerKey = selectedProvider as AiProviderWithKeys;
      const canTest = testableProviders.includes(providerKey);
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">API Keys ({localSettings.apiKeys[providerKey].length})</label>
            <div className="space-y-3 mt-1 max-h-40 overflow-y-auto pr-2">
            {localSettings.apiKeys[providerKey].map((entry, index) => {
                const keyId = `${providerKey}-${index}`;
                const status = keyTestStatus[keyId];
                return (
                    <div key={index}>
                        <div className="flex items-center space-x-2">
                            <input type="password" placeholder="Enter API Key" value={entry.key} onChange={(e) => handleApiKeyChange(providerKey, index, e.target.value)} className="flex-grow w-full bg-codex-blue/50 border border-codex-blue rounded-md p-2 focus:ring-2 focus:ring-codex-teal"/>
                            {canTest && <button type="button" onClick={() => handleTestApiKey(providerKey, index)} className="text-xs bg-codex-blue/80 hover:bg-codex-blue/60 p-2 rounded-md">Test</button>}
                            <button onClick={() => handleRemoveApiKey(providerKey, index)} className="text-codex-red hover:text-red-400 p-1 text-xs">Remove</button>
                        </div>
                        {status && status.message && <p className={`text-xs mt-1 ml-1 ${getStatusColor(status.type)}`}>{status.message}</p>}
                    </div>
                )
            })}
            </div>
            <button onClick={() => handleAddApiKey(providerKey)} className="text-sm mt-2 bg-codex-blue hover:bg-codex-blue/70 p-2 rounded-md">Add Key</button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Model Name</label>
            <input type="text" name={`models.${providerKey}`} value={localSettings.models[providerKey]} onChange={handleModelChange} className="w-full mt-1 bg-codex-blue/50 border border-codex-blue rounded-md p-2 focus:ring-2 focus:ring-codex-teal"/>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-codex-dark border border-codex-teal/50 rounded-lg w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-serif font-bold text-codex-teal p-6 border-b border-codex-blue">AI Configuration</h2>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-codex-blue p-4 space-y-1">
            {(Object.keys(providerNames) as AiProvider[]).map(p => (
              <button key={p} onClick={() => handleProviderChange(p)} className={`w-full text-left text-sm p-2 rounded ${localSettings.provider === p ? 'bg-codex-teal/20 text-codex-teal' : 'hover:bg-codex-blue/50'}`}>
                {providerNames[p]}
              </button>
            ))}
          </div>
          <div className="w-full md:w-2/3 p-6">
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