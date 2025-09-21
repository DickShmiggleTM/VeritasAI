import React, { useState, useEffect, useRef } from 'react';
import { listDocuments, addDocument, deleteDocument } from '../services/ragService.ts';
import { parseFile } from '../services/documentParser.ts';
import type { LocalDocument } from '../types.ts';
import { FileUploadIcon } from './FileUploadIcon.tsx';

export const LocalKnowledgePanel: React.FC = () => {
    const [docs, setDocs] = useState<LocalDocument[]>([]);
    const [newDocContent, setNewDocContent] = useState('');
    const [newDocName, setNewDocName] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDocs = async () => {
        const documents = await listDocuments();
        setDocs(documents);
    };

    useEffect(() => {
        fetchDocs();
    }, []);

    const handleAddDoc = async () => {
        if (newDocName.trim() && (newDocContent.trim() || isParsing)) {
            await addDocument(newDocName, newDocContent);
            setNewDocName('');
            setNewDocContent('');
            fetchDocs();
        }
    };
    
    const handleDeleteDoc = async (id: string) => {
        await deleteDocument(id);
        fetchDocs();
    }

    const handleFileButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        setNewDocName(file.name.replace(/\.[^/.]+$/, "")); 
        setNewDocContent('Parsing document...');

        try {
            const content = await parseFile(file);
            setNewDocContent(content);
        } catch (error) {
            setNewDocName('');
            setNewDocContent(`Error: ${error instanceof Error ? error.message : 'Failed to parse.'}`);
        } finally {
            setIsParsing(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="mt-8 technomancer-section">
            <h3 className="text-xl font-serif font-bold text-codex-teal mb-4">Local Knowledge Base</h3>
            <div className="space-y-4">
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                    className="hidden"
                    accept=".pdf,.docx"
                />
                <button 
                    onClick={handleFileButtonClick}
                    disabled={isParsing}
                    className="w-full p-2 flex items-center justify-center gap-2 bg-codex-blue rounded-md hover:bg-codex-blue/80 disabled:opacity-50"
                >
                    <FileUploadIcon />
                    {isParsing ? 'Parsing...' : 'Upload Document'}
                </button>
                <input 
                    type="text" 
                    placeholder="Document Name" 
                    value={newDocName}
                    onChange={e => setNewDocName(e.target.value)}
                    className="w-full p-2 bg-codex-blue/30 rounded-md border border-codex-blue/50"
                    disabled={isParsing}
                />
                <textarea 
                    placeholder="Paste text content here, or upload a document."
                    value={newDocContent}
                    onChange={e => setNewDocContent(e.target.value)}
                    className="w-full h-24 p-2 bg-codex-blue/30 rounded-md border border-codex-blue/50"
                    disabled={isParsing}
                />
                <button 
                    onClick={handleAddDoc}
                    disabled={isParsing || !newDocName.trim() || !newDocContent.trim()}
                    className="w-full p-2 bg-codex-purple rounded-md hover:bg-codex-purple/80 disabled:bg-gray-600"
                >
                    Add to Knowledge Base
                </button>
            </div>
            <div className="mt-4 max-h-48 overflow-y-auto pr-2">
                {docs.length > 0 ? (
                    <ul className="space-y-2">
                        {docs.map(doc => (
                            <li key={doc.id} className="flex justify-between items-center p-2 bg-codex-blue/30 rounded">
                                <p className="truncate text-sm" title={doc.name}>{doc.name}</p>
                                <button onClick={() => handleDeleteDoc(doc.id)} className="text-xs text-codex-red hover:text-red-400">
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500 text-center italic py-4">No local documents.</p>
                )}
            </div>
        </div>
    );
};
