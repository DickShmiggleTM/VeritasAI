import React, { useState } from 'react';
import type { Note } from '../types';

interface NotesPanelProps {
  notes: Note[];
  onAddNote: (content: string) => void;
  onUpdateNote: (id: string, content: string) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ notes, onAddNote, onUpdateNote, onDeleteNote }) => {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      onAddNote(newNoteContent);
      setNewNoteContent('');
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const handleSaveEdit = () => {
    if (editingNoteId && editingContent.trim()) {
      onUpdateNote(editingNoteId, editingContent);
      setEditingNoteId(null);
      setEditingContent('');
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-xl p-4 flex flex-col gap-4 h-full">
      <h2 className="text-xl font-bold text-slate-200">Notes</h2>
      <div className="flex gap-2">
        <textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="New note..."
          className="flex-grow w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          rows={3}
        />
        <button
          onClick={handleAddNote}
          className="px-4 py-2 text-white bg-violet-600 rounded-md hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-violet-400 transition-all duration-300"
        >
          Add
        </button>
      </div>
      <div className="flex-grow overflow-y-auto pr-2">
        {notes.map(note => (
          <div key={note.id} className="bg-slate-800/60 p-3 rounded-lg mb-3">
            {editingNoteId === note.id ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <button onClick={handleSaveEdit} className="text-sm text-violet-400 hover:text-violet-300">Save</button>
                  <button onClick={() => setEditingNoteId(null)} className="text-sm text-slate-400 hover:text-slate-300">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-slate-300 whitespace-pre-wrap">{note.content}</p>
                <div className="text-xs text-slate-500 mt-2">
                  {new Date(note.createdAt).toLocaleString()}
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button onClick={() => handleStartEdit(note)} className="text-sm text-slate-400 hover:text-violet-400">Edit</button>
                  <button onClick={() => onDeleteNote(note.id)} className="text-sm text-slate-400 hover:text-red-400">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {notes.length === 0 && (
          <p className="text-slate-500 text-center py-4">No notes yet.</p>
        )}
      </div>
    </div>
  );
};
