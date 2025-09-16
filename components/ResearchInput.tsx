
import React from 'react';

interface ResearchInputProps {
  topic: string;
  setTopic: (topic: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const ResearchInput: React.FC<ResearchInputProps> = ({ topic, setTopic, onSubmit, isLoading }) => {

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };
  
  return (
    <form
      className="flex items-center w-full gap-3 p-2 border border-slate-700 rounded-full bg-slate-900/80 shadow-lg animate-pulse-glow focus-within:animate-none"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter a concept to unravel..."
        className="flex-grow w-full px-4 py-2 text-lg bg-transparent border-none rounded-full text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !topic.trim()}
        className="flex-shrink-0 px-6 py-2.5 text-lg font-semibold text-white bg-violet-600 rounded-full hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-violet-400 transition-all duration-300 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
      >
        {isLoading ? 'Researching...' : 'Inquire'}
      </button>
    </form>
  );
};
