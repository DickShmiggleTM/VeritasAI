import { useState, useEffect } from 'react';
// FIX: Added .ts extension to fix module resolution error.
import type { Settings, ApiKeyEntry, AiProviderWithKeys } from '../types.ts';

const SETTINGS_KEY = 'codexVeritasAiSettings_v1';

const defaultSettings: Settings = {
  provider: 'google',
  activeProvider: 'google',
  activeApiKeyIndex: {
    mistral: 0,
    cohere: 0,
    openrouter: 0,
    huggingface: 0,
    chutes: 0,
  },
  apiKeys: {
    mistral: [],
    cohere: [],
    openrouter: [],
    huggingface: [],
    chutes: [],
  },
  models: {
    google: 'gemini-2.5-flash',
    ollama: '',
    mistral: 'mistral-large-latest',
    cohere: 'command-r-plus',
    openrouter: 'google/gemini-flash-1.5',
    huggingface: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    chutes: 'chutes-64k',
  },
  ollama: {
    serverUrl: 'http://localhost:11434',
    availableModels: [],
  },
  theme: 'dark',
  showTooltips: true,
};

const providersWithKeys: AiProviderWithKeys[] = ['mistral', 'cohere', 'openrouter', 'huggingface', 'chutes'];

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        let parsed = JSON.parse(stored);

        // --- MIGRATION LOGIC from single key string to ApiKeyEntry[] ---
        if (parsed.apiKeys && typeof parsed.apiKeys.mistral === 'string') {
          console.log("Migrating old settings format...");
          const migratedApiKeys: { [key in AiProviderWithKeys]: ApiKeyEntry[] } = {
            mistral: [], cohere: [], openrouter: [], huggingface: [], chutes: []
          };
          for (const provider of providersWithKeys) {
              if (parsed.apiKeys[provider] && typeof parsed.apiKeys[provider] === 'string') {
                  migratedApiKeys[provider] = [{ key: parsed.apiKeys[provider], errorCount: 0 }];
              }
          }
          parsed.apiKeys = migratedApiKeys;
        }
        
        // Merge with defaults to ensure all new keys/structures are present
        const mergedSettings = { ...defaultSettings, ...parsed };
        mergedSettings.apiKeys = { ...defaultSettings.apiKeys, ...parsed.apiKeys };
        mergedSettings.models = { ...defaultSettings.models, ...parsed.models };
        mergedSettings.activeApiKeyIndex = { ...defaultSettings.activeApiKeyIndex, ...parsed.activeApiKeyIndex };
        mergedSettings.ollama = { ...defaultSettings.ollama, ...parsed.ollama };
        
        return mergedSettings;
      }
      return defaultSettings;
    } catch (error) {
      console.error("Error reading settings from localStorage", error);
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      if (typeof window !== "undefined") {
        document.body.className = settings.theme === 'dark' ? 'bg-codex-dark text-gray-200' : 'bg-white text-black';
      }
    } catch (error) {
      console.error("Error writing settings to localStorage", error);
    }
  }, [settings]);

  return { settings, setSettings };
};