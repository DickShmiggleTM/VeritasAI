import React, { useState, useRef } from 'react';
import { DepthSelector } from './DepthSelector';
import type { ResearchDepth } from '../types';

interface ResearchInputProps {
  onResearch: (topic: string, depth: ResearchDepth, imageBase64?: string, mimeType?: string, imageName?: string) => void;
  disabled: boolean;
}

export const ResearchInput: React.FC<ResearchInputProps> = ({ onResearch, disabled }) => {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState<ResearchDepth>('moderate');
  const [image, setImage] = useState<{ base64: string; mimeType: string, name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() && !image) {
      alert('Please provide a topic or upload an image for inquiry.');
      return;
    }
    onResearch(topic, depth, image?.base64, image?.mimeType, image?.name);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = (event.target?.result as string).split(',')[1];
        setImage({ base64: base64String, mimeType: file.type, name: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-400 mb-1">
          Inquiry Topic
        </label>
        <textarea
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., The Unified Nature of Reality"
          rows={3}
          className="w-full bg-codex-blue/50 border border-codex-blue rounded-md p-2 focus:ring-2 focus:ring-codex-teal focus:border-codex-teal transition"
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Visual Input Matrix
        </label>
        {image ? (
          <div className="flex items-center justify-between bg-codex-blue p-2 rounded-md">
            <span className="text-sm text-gray-300 truncate">{image.name}</span>
            <button type="button" onClick={removeImage} disabled={disabled} className="text-codex-red hover:text-red-400 text-xs">Remove</button>
          </div>
        ) : (
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="w-full text-center text-sm py-2 px-3 bg-codex-blue hover:bg-codex-blue/70 rounded-md border border-codex-blue/80"
          >
            Upload Artifact...
          </button>
        )}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleImageUpload} 
          className="hidden" 
          accept="image/*"
          disabled={disabled}
        />
      </div>

      <DepthSelector selectedDepth={depth} onDepthChange={setDepth} disabled={disabled} />

      <button
        type="submit"
        disabled={disabled || (!topic.trim() && !image)}
        className="w-full bg-codex-purple text-white font-bold py-2 px-4 rounded-md hover:bg-codex-purple/80 disabled:bg-codex-blue disabled:cursor-not-allowed transition-colors border border-codex-purple"
      >
        {disabled ? 'Analyzing...' : 'Initiate Inquiry'}
      </button>
    </form>
  );
};
