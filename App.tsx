import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { conductResearch } from './services/geminiService';
import type { HistoryItem, ResearchDepth, Source, KnowledgeGraph } from './types';

import { ResearchInput } from './components/ResearchInput';
import { ResultDisplay } from './components/ResultDisplay';
import { HistoryPanel } from './components/HistoryPanel';
import { DepthSelector } from './components/DepthSelector';
import { LoadingSpinner } from './components/LoadingSpinner';
import { GemSymbol } from './components/GemSymbol';
import { KnowledgeGraphPanel } from './components/KnowledgeGraphPanel';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [depth, setDepth] = useState<ResearchDepth>('moderate');
  const [result, setResult] = useState<string>('');
  const [sources, setSources] = useState<Source[]>([]);
  const [graph, setGraph] = useState<KnowledgeGraph | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Load history from local storage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('researchHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from local storage:", error);
    }
  }, []);

  // Save history to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem('researchHistory', JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to local storage:", error);
    }
  }, [history]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    history.forEach(item => {
      item.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [history]);

  const filteredHistory = useMemo(() => {
    if (activeFilter === '__BOOKMARKS__') {
      return history.filter(item => item.bookmarked);
    }
    if (!activeFilter) return history;
    return history.filter(item => item.tags?.includes(activeFilter));
  }, [history, activeFilter]);

  const handleSubmit = useCallback(async () => {
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setResult('');
    setSources([]);
    setGraph(null);

    try {
      const { result, sources, graph } = await conductResearch(topic, depth);
      
      setResult(result);
      setSources(sources);
      setGraph(graph);

      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        topic,
        result,
        sources,
        graph,
        tags: [],
        bookmarked: false,
      };
      setHistory(prev => [newHistoryItem, ...prev.filter(h => h.topic.toLowerCase() !== topic.toLowerCase())]);

    } catch (error) {
      console.error("Research failed:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      setResult(`An error occurred during the research: ${message}\nPlease try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [topic, depth, isLoading]);

  const handleSelectHistory = useCallback((item: HistoryItem) => {
    setTopic(item.topic);
    setResult(item.result);
    setSources(item.sources);
    setGraph(item.graph || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  const handleUpdateTags = useCallback((itemId: string, newTags: string[]) => {
    setHistory(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, tags: newTags } : item
      )
    );
  }, []);

  const handleToggleBookmark = useCallback((itemId: string) => {
    setHistory(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, bookmarked: !item.bookmarked } : item
      )
    );
  }, []);
  
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `veritas_research_export_${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const importedHistory: HistoryItem[] = JSON.parse(text);
          if (Array.isArray(importedHistory) && importedHistory.every(item => item.id && item.topic && typeof item.result === 'string')) {
            const existingIds = new Set(history.map(h => h.id));
            const newHistory = importedHistory.filter(i => !existingIds.has(i.id));
            setHistory(prev => [...newHistory, ...prev]);
          } else {
            alert("Invalid history file format.");
          }
        }
      } catch (error) {
        console.error("Failed to import history:", error);
        alert("Failed to import history. The file may be corrupted or in the wrong format.");
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };
  
  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen font-sans bg-[radial-gradient(circle_at_1px_1px,_#334155_1px,_transparent_0)] [background-size:24px_24px]">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-1 lg:sticky top-6">
            <HistoryPanel
              history={filteredHistory}
              allTags={allTags}
              activeFilter={activeFilter}
              isLoading={isLoading}
              onSelectHistory={handleSelectHistory}
              onExport={handleExport}
              onImport={handleImport}
              onFilterSelect={setActiveFilter}
              onUpdateTags={handleUpdateTags}
              onToggleBookmark={handleToggleBookmark}
            />
          </div>
          <main className="lg:col-span-2 flex flex-col gap-6">
            <header className="flex flex-col items-center text-center gap-2">
              <GemSymbol className="w-16 h-16" />
              <h1 className="text-4xl sm:text-5xl font-bold font-serif bg-gradient-to-r from-violet-400 to-sky-400 text-transparent bg-clip-text">
                Veritas AI
              </h1>
              <p className="text-slate-400 max-w-2xl">
                An AI research agent for deep analysis of esoteric, occult, and metaphysical subjects.
              </p>
            </header>
            <div className="p-4 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-xl flex flex-col gap-4 sticky top-6 z-10">
              <ResearchInput
                topic={topic}
                setTopic={setTopic}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
              <DepthSelector
                depth={depth}
                onDepthChange={setDepth}
                isLoading={isLoading}
              />
            </div>

            {isLoading && <LoadingSpinner />}
            
            {result && !isLoading && (
              <ResultDisplay
                result={result}
                sources={sources}
                isLoading={isLoading}
              />
            )}
          </main>
          <div className="lg:col-span-1 lg:sticky top-6">
            <KnowledgeGraphPanel graph={graph} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;