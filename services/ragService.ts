// FIX: Added .ts extension to fix module resolution error.
import type { LocalDocument } from '../types.ts';

// In-memory store for demonstration purposes.
// A real application would use a database like IndexedDB.
let documents: LocalDocument[] = [];

export const addDocument = async (name: string, content: string): Promise<LocalDocument> => {
    const newDoc: LocalDocument = {
        id: Date.now().toString(),
        name,
        content,
        createdAt: new Date().toISOString(),
    };
    documents.push(newDoc);
    // In a real implementation, you would generate and store embeddings here.
    return newDoc;
};

export const listDocuments = async (): Promise<LocalDocument[]> => {
    return [...documents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const deleteDocument = async (id: string): Promise<void> => {
    documents = documents.filter(doc => doc.id !== id);
};

export const getDocument = async (id: string): Promise<LocalDocument | undefined> => {
    return documents.find(doc => doc.id === id);
};

export const searchDocuments = async (query: string): Promise<LocalDocument[]> => {
    // This is a very basic keyword search. A real RAG system would use
    // vector similarity search on embeddings.
    const lowerQuery = query.toLowerCase();
    return documents.filter(doc => 
        doc.name.toLowerCase().includes(lowerQuery) ||
        doc.content.toLowerCase().includes(lowerQuery)
    );
};
