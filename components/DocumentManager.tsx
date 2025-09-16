import React, { useCallback } from 'react';
import type { Document } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up the worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;


interface DocumentManagerProps {
  documents: Document[];
  onAddDocument: (doc: Document) => void;
  onRemoveDocument: (id: string) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ documents, onAddDocument, onRemoveDocument }) => {
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      let content = '';
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          if (e.target?.result) {
            const typedArray = new Uint8Array(e.target.result as ArrayBuffer);
            const pdf = await pdfjsLib.getDocument(typedArray).promise;
            let textContent = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const text = await page.getTextContent();
              textContent += text.items.map(item => item.str).join(' ');
            }
            onAddDocument({ id: Date.now().toString() + file.name, name: file.name, content: textContent });
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (file.name.endsWith('.docx')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          if (e.target?.result) {
            const result = await mammoth.extractRawText({ arrayBuffer: e.target.result as ArrayBuffer });
            onAddDocument({ id: Date.now().toString() + file.name, name: file.name, content: result.value });
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        // For plain text files
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onAddDocument({ id: Date.now().toString() + file.name, name: file.name, content: e.target.result as string });
          }
        };
        reader.readAsText(file);
      }
    }
    // Reset file input
    event.target.value = '';
  }, [onAddDocument]);

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-xl p-4 flex flex-col gap-4">
      <h2 className="text-xl font-bold text-slate-200">Documents</h2>
      <div>
        <label htmlFor="file-upload" className="cursor-pointer w-full text-center px-4 py-2 text-white bg-violet-600 rounded-md hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-violet-400 transition-all duration-300 block">
          Upload Documents
        </label>
        <input id="file-upload" type="file" multiple onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.txt" />
      </div>
      <div className="flex-grow overflow-y-auto pr-2 space-y-2">
        {documents.map(doc => (
          <div key={doc.id} className="bg-slate-800/60 p-3 rounded-lg flex justify-between items-center">
            <p className="text-slate-300 truncate">{doc.name}</p>
            <button onClick={() => onRemoveDocument(doc.id)} className="text-sm text-slate-400 hover:text-red-400">
              Remove
            </button>
          </div>
        ))}
        {documents.length === 0 && (
          <p className="text-slate-500 text-center py-4">No documents uploaded.</p>
        )}
      </div>
    </div>
  );
};
