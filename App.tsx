import React, { useState, useCallback } from 'react';
import { ResearchInput } from './components/ResearchInput';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { HistoryPanel } from './components/HistoryPanel';
import { RabbitHoleModal } from './components/RabbitHoleModal';
import { CodexVeritasSymbol } from './components/CodexVeritasSymbol';
import { SettingsIcon } from './components/SettingsIcon';
import { SettingsModal } from './components/SettingsModal';
import { conductResearch } from './services/aiService';
import { useSettings } from './hooks/useSettings';
import type { ResearchResult, ResearchDepth, HistoryItem, KnowledgeGraphNode } from './types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<ResearchResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isRabbitHoleModalOpen, setIsRabbitHoleModalOpen] = useState(false);
  const [rabbitHoleNode, setRabbitHoleNode] = useState<KnowledgeGraphNode | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { settings, setSettings } = useSettings();

  const handleResearch = useCallback(async (topic: string, depth: ResearchDepth, imageBase64?: string, mimeType?: string, imageName?: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentResult(null);
    try {
      const result = await conductResearch(topic, depth, settings, imageBase64, mimeType);
      setCurrentResult(result);
      const newHistoryItem: HistoryItem = {
        id: new Date().toISOString(),
        topic: topic || `Image Inquiry: ${imageName}`,
        timestamp: new Date().toLocaleString(),
        result,
        imageName
      };
      setHistory(prev => [newHistoryItem, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  const handleHistorySelect = (item: HistoryItem) => {
    setCurrentResult(item.result);
  };

  const handleNodeClick = (node: KnowledgeGraphNode) => {
    setRabbitHoleNode(node);
    setIsRabbitHoleModalOpen(true);
  };
  
  const handleConfirmRabbitHole = (topic: string) => {
    // Start a new research with moderate depth by default for rabbit hole inquiries
    handleResearch(topic, 'moderate');
  };

  return (
    <div className="min-h-screen bg-codex-dark font-sans text-gray-200">
      <main className="container mx-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <CodexVeritasSymbol size={40} />
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-codex-gold animate-glow">Codex Veritas</h1>
              <p className="text-sm text-gray-400">Quantum-Archaeological Inquiry Engine</p>
            </div>
          </div>
          <button onClick={() => setIsSettingsOpen(true)} className="text-gray-400 hover:text-codex-teal transition-colors">
            <SettingsIcon />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <div className="p-6 bg-codex-dark-blue rounded-xl border border-codex-blue/50 sticky top-8">
              <ResearchInput onResearch={handleResearch} disabled={isLoading} />
              <HistoryPanel history={history} onSelect={handleHistorySelect} />
            </div>
          </aside>

          <div className="lg:col-span-9">
            {isLoading && <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>}
            {error && <div className="text-codex-red p-4 bg-red-900/20 border border-red-500/50 rounded-md">{error}</div>}
            {currentResult && <ResultDisplay result={currentResult} onNodeClick={handleNodeClick} />}
            {!isLoading && !error && !currentResult && (
              <div className="flex flex-col items-center justify-center h-96 text-center text-gray-500 border-2 border-dashed border-codex-blue/50 rounded-xl">
                <CodexVeritasSymbol size={60} />
                <p className="mt-4 text-lg">Awaiting Inquiry</p>
                <p className="text-sm">Enter a topic or upload an artifact to begin analysis.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <RabbitHoleModal
        isOpen={isRabbitHoleModalOpen}
        onClose={() => setIsRabbitHoleModalOpen(false)}
        node={rabbitHoleNode}
        onConfirmResearch={handleConfirmRabbitHole}
      />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  );
};

export default App;