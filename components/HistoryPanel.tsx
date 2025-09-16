import React, { useRef, useState } from 'react';
import type { HistoryItem } from '../types';

const BookmarkIcon: React.FC<{ bookmarked: boolean; className?: string }> = ({ bookmarked, className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={bookmarked ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.5}
    className={className}
  >
    {bookmarked ? (
      <path
        fillRule="evenodd"
        d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.082 5.215 21.67A.75.75 0 014 21V5.507c0-1.47 1.073-2.756 2.57-2.93z"
        clipRule="evenodd"
      />
    ) : (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
      />
    )}
  </svg>
);


interface HistoryItemProps {
  item: HistoryItem;
  isLoading: boolean;
  onSelectHistory: (item: HistoryItem) => void;
  onUpdateTags: (itemId: string, newTags: string[]) => void;
  onToggleBookmark: (itemId: string) => void;
}

const HistoryListItem: React.FC<HistoryItemProps> = ({ item, isLoading, onSelectHistory, onUpdateTags, onToggleBookmark }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tagInput, setTagInput] = useState(item.tags?.join(', ') || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSaveTags = () => {
    const newTags = tagInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    onUpdateTags(item.id, newTags);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTags();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setTagInput(item.tags?.join(', ') || '');
    }
  };

  return (
    <li className="p-3 rounded-lg hover:bg-slate-800/60 transition-colors duration-200">
       <div className="flex justify-between items-center gap-2">
        <button
          onClick={() => onSelectHistory(item)}
          disabled={isLoading}
          className="flex-grow text-left focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <p className="font-medium truncate block text-slate-300">{item.topic}</p>
        </button>
        <button
            onClick={() => onToggleBookmark(item.id)}
            disabled={isLoading}
            className={`flex-shrink-0 p-1 rounded-full transition-colors duration-200 ${item.bookmarked ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-500 hover:text-slate-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={item.bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            title={item.bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
            <BookmarkIcon bookmarked={!!item.bookmarked} />
        </button>
      </div>

      <div className="mt-2 text-sm">
        {isEditing ? (
           <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveTags}
              placeholder="Add tags, comma separated"
              className="flex-grow w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
              autoFocus
            />
           </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap cursor-pointer" onClick={() => !isLoading && setIsEditing(true)} title="Edit tags">
            {(item.tags && item.tags.length > 0) ? (
              item.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-sky-800/70 text-sky-200 rounded-full">{tag}</span>
              ))
            ) : (
              <span className="text-slate-500 italic px-2 py-0.5 text-xs">No tags. Click to add.</span>
            )}
          </div>
        )}
      </div>
    </li>
  );
};


interface HistoryPanelProps {
  history: HistoryItem[];
  allTags: string[];
  activeFilter: string | null;
  isLoading: boolean;
  onSelectHistory: (item: HistoryItem) => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterSelect: (filter: string | null) => void;
  onUpdateTags: (itemId: string, newTags: string[]) => void;
  onToggleBookmark: (itemId: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  allTags,
  activeFilter,
  isLoading,
  onSelectHistory,
  onExport,
  onImport,
  onFilterSelect,
  onUpdateTags,
  onToggleBookmark,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="sticky top-6 p-6 bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl animate-fade-in flex flex-col max-h-[calc(100vh-48px)]">
      <h2 className="text-2xl font-serif font-bold text-violet-300 mb-4 flex-shrink-0">Research History</h2>
      
      <div className="flex-shrink-0 mb-4 pb-4 border-b border-slate-800">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterSelect(null)}
            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${
              activeFilter === null
                ? 'bg-violet-600 text-white'
                : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
            }`}
          >
            All
          </button>
           <button
            onClick={() => onFilterSelect('__BOOKMARKS__')}
            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200 flex items-center gap-1.5 ${
              activeFilter === '__BOOKMARKS__'
                ? 'bg-yellow-500 text-slate-900'
                : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <BookmarkIcon bookmarked={activeFilter === '__BOOKMARKS__'} className="h-4 w-4" />
            Bookmarks
          </button>
          {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => onFilterSelect(tag)}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${
                  activeFilter === tag
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {tag}
              </button>
          ))}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto pr-2">
        {history.length === 0 ? (
          <p className="text-slate-500 italic text-center mt-8">
            {activeFilter === '__BOOKMARKS__' ? 'No bookmarked inquiries found.' : activeFilter ? `No inquiries found with the tag "${activeFilter}".` : "No inquiries made yet."}
          </p>
        ) : (
          <ul className="space-y-2">
            {history.map((item) => (
              <HistoryListItem
                key={item.id}
                item={item}
                isLoading={isLoading}
                onSelectHistory={onSelectHistory}
                onUpdateTags={onUpdateTags}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800 flex-shrink-0">
        <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleImportClick}
              disabled={isLoading}
              className="w-full text-center p-2 rounded-lg text-sm font-semibold text-white bg-sky-700/80 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import
            </button>
            <button
              onClick={onExport}
              disabled={isLoading || history.length === 0}
              className="w-full text-center p-2 rounded-lg text-sm font-semibold text-white bg-violet-700/80 hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-violet-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export
            </button>
        </div>
        <input
            type="file"
            ref={fileInputRef}
            onChange={onImport}
            accept=".json,application/json"
            className="hidden"
            aria-hidden="true"
        />
      </div>
    </div>
  );
};