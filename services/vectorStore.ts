import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { getEmbedding } from './geminiService';

interface VectorDocument {
    id: string;
    text: string;
    embedding: number[];
    metadata: Record<string, any>;
    timestamp: number;
}

interface VectorDB extends DBSchema {
    vectors: {
        key: string;
        value: VectorDocument;
    };
}

const DB_NAME = 'synapse_tier1_memory';
const STORE_NAME = 'vectors';

class VectorStore {
    private dbPromise: Promise<IDBPDatabase<VectorDB>>;
    private cache: Map<string, VectorDocument> = new Map();
    private isCacheHydrated: boolean = false;

    constructor() {
        this.dbPromise = openDB<VectorDB>(DB_NAME, 1, {
            upgrade(db) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            },
        });
    }

    private async ensureCache() {
        if (this.isCacheHydrated) return;
        try {
            const db = await this.dbPromise;
            const allDocs = await db.getAll(STORE_NAME);
            this.cache.clear();
            allDocs.forEach(doc => this.cache.set(doc.id, doc));
            this.isCacheHydrated = true;
            console.log(`[Memory] Cache hydrated with ${allDocs.length} documents.`);
        } catch (error) {
            console.error("[Memory] Failed to hydrate cache:", error);
        }
    }

    /**
     * Ingests a document: Generates embedding -> Stores in IDB.
     */
    async storeDocument(id: string, text: string, metadata: Record<string, any> = {}) {
        try {
            const embedding = await getEmbedding(text);
            const doc: VectorDocument = {
                id,
                text,
                embedding,
                metadata,
                timestamp: Date.now(),
            };
            const db = await this.dbPromise;
            await db.put(STORE_NAME, doc);

            // Update cache
            this.cache.set(id, doc);

            console.log(`[Memory] Stored document: ${id}`);
        } catch (error) {
            console.error(`[Memory] Failed to store document ${id}:`, error);
        }
    }

    /**
     * Performs a semantic search using Cosine Similarity.
     * Note: For larger datasets, we would use a specialized vector index (e.g. HNSW),
     * but for <5000 papers, brute-force IDB scan is <50ms.
     */
    async search(query: string, k: number = 5) {
        try {
            const queryEmbedding = await getEmbedding(query);
            await this.ensureCache();
            const allDocs = Array.from(this.cache.values());

            // Calculate Cosine Similarity
            const scoredDocs = allDocs.map(doc => {
                const score = this.cosineSimilarity(queryEmbedding, doc.embedding);
                return { ...doc, score };
            });

            // Sort by Score (Desc) and slice top K
            return scoredDocs
                .sort((a, b) => b.score - a.score)
                .slice(0, k);

        } catch (error) {
            console.error("[Memory] Search failed:", error);
            return [];
        }
    }

    /**
     * Retrieves the most recent documents for optimization analysis.
     */
    async getRecentDocuments(limit: number = 50): Promise<VectorDocument[]> {
        try {
            await this.ensureCache();
            const allDocs = Array.from(this.cache.values());

            // Sort by Timestamp (Desc)
            return allDocs
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, limit);
        } catch (error) {
            console.error("[Memory] Failed to fetch recent docs:", error);
            return [];
        }
    }

    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    async getStats() {
        const db = await this.dbPromise;
        const count = await db.count(STORE_NAME);
        return { totalDocuments: count };
    }
}

export const vectorStore = new VectorStore();
