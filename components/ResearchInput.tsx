import React, { useState, useRef } from 'react';
import { DepthSelector } from './DepthSelector.tsx';
import type { ResearchDepth } from '../types.ts';
import { GemSymbol } from './GemSymbol.tsx';
import { FileUploadIcon } from './FileUploadIcon.tsx';

interface ResearchInputProps {
  onResearch: (topic: string, depth: ResearchDepth) => void;
  isLoading: boolean;
  initialTopic?: string;
  onFileChange: (file: File | null) => void;
  uploadedFileName: string | null;
}

export const ResearchInput: React.FC<ResearchInputProps> = ({ 
    onResearch, 
    isLoading, 
    initialTopic = '',
    onFileChange,
    uploadedFileName
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [depth, setDepth] = useState<ResearchDepth>('moderate');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onResearch(topic, depth);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileChange(file);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };
  
  const clearFile = () => {
    onFileChange(null);
  }

  const isDocumentQuery = !!uploadedFileName;

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-codex-dark/50 rounded-lg border border-codex-blue">
      <textarea
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder={isDocumentQuery ? "Ask a question about the document..." : "Enter a topic for deep analysis..."}
        className="w-full h-24 p-3 bg-codex-blue/30 rounded-md focus:ring-2 focus:ring-codex-teal focus:outline-none border border-codex-blue/50 placeholder-gray-500"
        disabled={isLoading}
      />
      
      {uploadedFileName && (
        <div className="flex items-center justify-between p-2 bg-codex-blue/20 rounded-md text-sm">
            <p className="text-gray-300 truncate">
                <span className="font-semibold text-codex-teal">Context:</span> {uploadedFileName}
            </p>
            <button
                type="button"
                onClick={clearFile}
                disabled={isLoading}
                className="text-gray-400 hover:text-white text-lg font-bold disabled:opacity-50"
                aria-label="Clear uploaded file"
            >
                &times;
            </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-1/2">
            <DepthSelector selectedDepth={depth} onDepthChange={setDepth} disabled={isLoading} />
        </div>
        <div className="w-full md:w-auto flex items-center gap-2">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                className="hidden"
                accept=".pdf,.docx"
            />
            <button
                type="button"
                onClick={handleFileButtonClick}
                disabled={isLoading}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 font-bold text-white bg-codex-blue rounded-md hover:bg-codex-blue/80 disabled:bg-gray-600 transition-colors border border-codex-blue"
                title="Analyze a document"
            >
               <FileUploadIcon />
               {isDocumentQuery ? 'Change Document' : 'Upload Document'}
            </button>
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 font-bold text-white bg-codex-purple rounded-md hover:bg-codex-purple/80 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors border border-codex-purple"
            >
              <GemSymbol />
              {isLoading ? 'Analyzing...' : (isDocumentQuery ? 'Query Document' : 'Initiate Inquiry')}
            </button>
        </div>
      </div>
    </form>
  );
};
