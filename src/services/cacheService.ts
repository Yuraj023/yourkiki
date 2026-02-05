// Cache Service for RAG system optimization
// Implements caching strategies to improve performance and reduce API calls

// Types
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
}

// Cache implementation
class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number;
  private defaultTTL: number;
  private stats: CacheStats = { hits: 0, misses: 0, evictions: 0 };

  constructor(maxSize: number = 100, defaultTTL: number = 300000) { // 5 minutes default
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  // Get item from cache
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      return null;
    }

    // Move to front (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    this.stats.hits++;
    return entry.data;
  }

  // Set item in cache
  set(key: string, data: T, ttl?: number): void {
    // Remove oldest item if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.stats.evictions++;
      }
    }

    // Add new entry
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  // Clear cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Reset statistics
  resetStats(): void {
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }
}

// Create caches for different types of data
const embeddingCache = new LRUCache<number[]>(500, 1800000); // 30 minutes TTL
const retrievalCache = new LRUCache<{ context: string; metrics: any }>(100, 300000); // 5 minutes TTL
const responseCache = new LRUCache<string>(50, 600000); // 10 minutes TTL

// Cache service
export const cacheService = {
  // Cache for embeddings
  embedding: {
    get: (text: string): number[] | null => {
      return embeddingCache.get(text);
    },
    
    set: (text: string, embedding: number[], ttl?: number): void => {
      embeddingCache.set(text, embedding, ttl);
    },
    
    clear: (): void => {
      embeddingCache.clear();
    },
    
    stats: (): CacheStats => {
      return embeddingCache.getStats();
    }
  },

  // Cache for retrieval results
  retrieval: {
    get: (query: string, tags: string[] = []): { context: string; metrics: any } | null => {
      const key = `${query}_${tags.join(',')}`;
      return retrievalCache.get(key);
    },
    
    set: (query: string, tags: string[], result: { context: string; metrics: any }, ttl?: number): void => {
      const key = `${query}_${tags.join(',')}`;
      retrievalCache.set(key, result, ttl);
    },
    
    clear: (): void => {
      retrievalCache.clear();
    },
    
    stats: (): CacheStats => {
      return retrievalCache.getStats();
    }
  },

  // Cache for final responses
  response: {
    get: (query: string, userId?: string): string | null => {
      const key = userId ? `${query}_${userId}` : query;
      return responseCache.get(key);
    },
    
    set: (query: string, response: string, userId?: string, ttl?: number): void => {
      const key = userId ? `${query}_${userId}` : query;
      responseCache.set(key, response, ttl);
    },
    
    clear: (): void => {
      responseCache.clear();
    },
    
    stats: (): CacheStats => {
      return responseCache.getStats();
    }
  },

  // Clear all caches
  clearAll: (): void => {
    embeddingCache.clear();
    retrievalCache.clear();
    responseCache.clear();
  },

  // Get all cache statistics
  getAllStats: (): { 
    embedding: CacheStats; 
    retrieval: CacheStats; 
    response: CacheStats;
    totalSize: number;
  } => {
    return {
      embedding: embeddingCache.getStats(),
      retrieval: retrievalCache.getStats(),
      response: responseCache.getStats(),
      totalSize: embeddingCache.size() + retrievalCache.size() + responseCache.size()
    };
  },

  // Reset all statistics
  resetAllStats: (): void => {
    embeddingCache.resetStats();
    retrievalCache.resetStats();
    responseCache.resetStats();
  }
};

// Enhanced embedding function with caching
export const generateEmbeddingWithCache = async (text: string): Promise<number[]> => {
  // Check cache first
  const cached = cacheService.embedding.get(text);
  if (cached) {
    return cached;
  }

  // Generate embedding (mock implementation)
  const vector = new Array(128).fill(0);
  for (let i = 0; i < text.length && i < 1000; i++) {
    const charCode = text.charCodeAt(i);
    vector[charCode % 128] += 1;
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  const embedding = vector.map(val => magnitude > 0 ? val / magnitude : 0);
  
  // Cache the result
  cacheService.embedding.set(text, embedding);
  
  return embedding;
};

// Enhanced retrieval function with caching
export const retrieveContextWithCache = async (
  query: string, 
  topK: number = 5,
  tags: string[] = []
): Promise<{ context: string; metrics: any }> => {
  // Check cache first
  const cached = cacheService.retrieval.get(query, tags);
  if (cached) {
    return cached;
  }

  // Mock retrieval implementation
  // In a real implementation, this would search the vector database
  const context = `This is retrieved context for query: "${query}" with tags: [${tags.join(', ')}]`;
  const metrics = {
    queryTime: 45,
    documentsRetrieved: 3,
    averageSimilarity: 0.85
  };
  
  const result = { context, metrics };
  
  // Cache the result
  cacheService.retrieval.set(query, tags, result);
  
  return result;
};

export default cacheService;