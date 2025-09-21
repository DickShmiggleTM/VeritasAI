import { useState, useEffect } from 'react';
import type { Settings } from '../types';

const SETTINGS_KEY = 'codexVeritasAiSettings_v1';

const defaultSettings: Settings = {
  provider: 'google',
  apiKeys: {
    mistral: '',
    cohere: '',
    openrouter: '',
    huggingface: '',
    chutes: '',
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

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Basic migration: ensure all keys from default settings are present
        const migratedSettings = { ...defaultSettings, ...parsed };
        migratedSettings.apiKeys = { ...defaultSettings.apiKeys, ...parsed.apiKeys };
        migratedSettings.models = { ...defaultSettings.models, ...parsed.models };
        return migratedSettings;
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
