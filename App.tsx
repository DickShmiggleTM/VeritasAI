import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { ResearchInput } from './components/ResearchInput.tsx';
import { ResultDisplay } from './components/ResultDisplay.tsx';
import { LoadingSpinner } from './components/LoadingSpinner.tsx';
import { HistoryPanel } from './components/HistoryPanel.tsx';
import { LocalKnowledgePanel } from './components/LocalKnowledgePanel.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { HistoryDetailModal } from './components/HistoryDetailModal.tsx';
import { RabbitHoleModal } from './components/RabbitHoleModal.tsx';
import { CodexVeritasSymbol } from './components/CodexVeritasSymbol.tsx';
import { SettingsIcon } from './components/SettingsIcon.tsx';

import { performResearch } from './services/aiService.ts';
import { parseFile } from './services/documentParser.ts';
import { useSettings } from './hooks/useSettings.ts';
import type { ResearchDepth, ResearchResult, HistoryItem, KnowledgeGraphNode } from './types.ts';

const App: React.FC = () => {
  const { settings, setSettings } = useSettings();
  const [currentTopic, setCurrentTopic] = useState<string>('The future of decentralized identity');
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const [documentContent, setDocumentContent] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryDetailOpen, setIsHistoryDetailOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [isRabbitHoleOpen, setIsRabbitHoleOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<KnowledgeGraphNode | null>(null);

  const handleFileChange = useCallback(async (file: File | null) => {
    if (!file) {
      setDocumentContent(null);
      setUploadedFileName(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const content = await parseFile(file);
      setDocumentContent(content);
      setUploadedFileName(file.name);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to parse document.';
      setError(errorMessage);
      setDocumentContent(null);
      setUploadedFileName(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleResearch = useCallback(async (topic: string, depth: ResearchDepth) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCurrentTopic(topic);

    try {
      const researchResult = await performResearch(topic, depth, settings, documentContent);
      setResult(researchResult);

      const newHistoryItem: HistoryItem = {
        id: uuidv4(),
        topic,
        depth,
        timestamp: new Date().toLocaleString(),
        result: researchResult,
        documentName: uploadedFileName ?? undefined,
      };
      setHistory(prev => [newHistoryItem, ...prev]);

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [settings, documentContent, uploadedFileName]);

  const handleNodeSelectForRabbitHole = (node: KnowledgeGraphNode) => {
    if (node) {
        setSelectedNode(node);
        setIsRabbitHoleOpen(true);
    }
  };
  
  const handleConfirmRabbitHole = (topic: string) => {
    setCurrentTopic(topic);
    handleResearch(topic, 'moderate'); // Default to moderate for rabbit hole dives
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setIsHistoryDetailOpen(true);
  };
  
  const handleHistoryNodeClick = (topic: string) => {
    setCurrentTopic(topic);
    handleResearch(topic, 'moderate');
  };

  return (
    <div className="min-h-screen bg-codex-dark text-gray-300 font-sans">
      <div className="container mx-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
                <CodexVeritasSymbol size={48} animated />
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-codex-gold tracking-wider">Codex Veritas</h1>
                    <p className="text-sm text-codex-teal/80">The Technomancer's Research Companion</p>
                </div>
            </div>
            <button onClick={() => setIsSettingsOpen(true)} className="text-gray-400 hover:text-white transition-colors">
                <SettingsIcon />
            </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ResearchInput 
              onResearch={handleResearch} 
              isLoading={isLoading} 
              initialTopic={currentTopic}
              onFileChange={handleFileChange}
              uploadedFileName={uploadedFileName}
            />
            {isLoading && <LoadingSpinner />}
            {error && <div className="p-4 bg-red-900/50 border border-codex-red text-red-300 rounded-md">{error}</div>}
            {result && !isLoading && <ResultDisplay result={result} onNodeSelectForRabbitHole={handleNodeSelectForRabbitHole} />}
          </div>

          <aside>
            <div className="sticky top-8 p-4 bg-codex-dark/50 rounded-lg border border-codex-blue space-y-4">
              <HistoryPanel history={history} onSelect={handleSelectHistory} />
              <LocalKnowledgePanel />
            </div>
          </aside>
        </main>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
      
      <HistoryDetailModal 
        isOpen={isHistoryDetailOpen}
        onClose={() => setIsHistoryDetailOpen(false)}
        item={selectedHistoryItem}
        onNodeClick={handleHistoryNodeClick}
      />
      
      <RabbitHoleModal
        isOpen={isRabbitHoleOpen}
        onClose={() => setIsRabbitHoleOpen(false)}
        node={selectedNode}
        onConfirmResearch={handleConfirmRabbitHole}
      />
    </div>
  );
};

export default App;
