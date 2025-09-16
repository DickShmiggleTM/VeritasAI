import React from 'react';
import type { Source } from '../types';
import { SourceList } from './SourceList';
import { Marked } from 'marked';
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);

interface ResultDisplayProps {
  result: string;
  sources: Source[];
  isLoading: boolean;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, sources, isLoading }) => {
  const renderResult = () => {
    const html = marked.parse(result) as string;
    return <div className="prose prose-invert prose-lg max-w-none prose-p:text-slate-300 prose-headings:font-serif prose-headings:text-transparent prose-headings:bg-clip-text prose-headings:bg-gradient-to-r prose-headings:from-violet-300 prose-headings:to-sky-300 prose-strong:text-violet-300 prose-a:text-sky-400 hover:prose-a:text-sky-300" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="p-6 sm:p-8 bg-slate-900/70 border border-slate-800 rounded-2xl shadow-2xl animate-fade-in w-full min-h-[300px]">
      {renderResult()}
      {!isLoading && sources.length > 0 && <SourceList sources={sources} />}
    </div>
  );
};