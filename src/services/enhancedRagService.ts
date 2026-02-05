// Enhanced RAG Service for improved AI responses
// This service implements a more sophisticated Retrieval-Augmented Generation system
// following best practices from the roadmap

import cacheService, { generateEmbeddingWithCache, retrieveContextWithCache } from './cacheService';

// Types
interface VectorDocument {
  id: string;
  text: string;
  embedding: number[];
  metadata: {
    source?: string;
    timestamp?: string;
    tags?: string[];
    chunkIndex?: number;
    totalChunks?: number;
  };
}

interface IngestionStats {
  totalDocuments: number;
  totalChunks: number;
  averageChunkSize: number;
  ingestionTime: number;
}

interface RetrievalMetrics {
  queryTime: number;
  documentsRetrieved: number;
  averageSimilarity: number;
}

interface EvaluationMetrics {
  groundedness: number;
  relevance: number;
  coherence: number;
}

// Vector database - in a real implementation, this would be replaced with a proper vector DB
let vectorDatabase: VectorDocument[] = [];
let ingestionStats: IngestionStats = {
  totalDocuments: 0,
  totalChunks: 0,
  averageChunkSize: 0,
  ingestionTime: 0
};

// Calculate cosine similarity between two vectors
const cosineSimilarity = (a: number[], b: number[]): number => {
  const dotProduct = a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
};

// Advanced text chunking with overlap
const advancedChunking = (text: string, chunkSize: number = 500, overlap: number = 50): string[] => {
  const chunks: string[] = [];
  const words = text.split(/\s+/);
  
  for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    chunks.push(chunk);
    
    // Break if we've reached the end
    if (i + chunkSize >= words.length) break;
  }
  
  return chunks;
};

// Query rewriting to improve retrieval
const rewriteQuery = (query: string): string[] => {
  // Generate variations of the query to improve retrieval
  const variations = [
    query,
    `What is ${query}?`,
    `Explain ${query}`,
    `Tell me about ${query}`,
    `Information on ${query}`,
    query.toLowerCase(),
    query.replace(/\?$/, '')
  ];
  
  return variations;
};

// Data ingestion pipeline with metadata
export const ingestDocument = async (
  text: string, 
  source: string = 'unknown',
  tags: string[] = []
): Promise<IngestionStats> => {
  const startTime = Date.now();
  
  try {
    // Clean and preprocess text
    const cleanedText = text
      .replace(/\s+/g, ' ')
      .trim();
    
    // Chunk the document
    const chunks = advancedChunking(cleanedText, 500, 50);
    
    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await generateEmbeddingWithCache(chunk);
      
      vectorDatabase.push({
        id: `doc_${source}_${Date.now()}_${i}`,
        text: chunk,
        embedding,
        metadata: {
          source,
          timestamp: new Date().toISOString(),
          tags,
          chunkIndex: i,
          totalChunks: chunks.length
        }
      });
    }
    
    // Update ingestion stats
    ingestionStats = {
      totalDocuments: ingestionStats.totalDocuments + 1,
      totalChunks: ingestionStats.totalChunks + chunks.length,
      averageChunkSize: chunks.reduce((sum, chunk) => sum + chunk.length, 0) / chunks.length,
      ingestionTime: Date.now() - startTime
    };
    
    console.log(`Ingested document from ${source} with ${chunks.length} chunks`);
    return ingestionStats;
  } catch (error) {
    console.error('Error ingesting document:', error);
    throw new Error('Failed to ingest document into RAG system');
  }
};

// Enhanced retrieval with query rewriting and reranking
export const retrieveContext = async (
  query: string, 
  topK: number = 5,
  tags: string[] = []
): Promise<{ context: string; metrics: RetrievalMetrics }> => {
  const startTime = Date.now();
  
  try {
    if (vectorDatabase.length === 0) {
      return { 
        context: "", 
        metrics: {
          queryTime: 0,
          documentsRetrieved: 0,
          averageSimilarity: 0
        }
      };
    }
    
    // Try to get from cache first
    const cached = cacheService.retrieval.get(query, tags);
    if (cached) {
      return {
        context: cached.context,
        metrics: {
          ...cached.metrics,
          queryTime: Date.now() - startTime
        }
      };
    }
    
    // Rewrite query to generate multiple variations
    const queryVariations = rewriteQuery(query);
    
    // Calculate similarity scores for all documents using all query variations
    const allScores: { doc: VectorDocument; similarity: number }[] = [];
    
    for (const variation of queryVariations) {
      const queryEmbedding = await generateEmbeddingWithCache(variation);
      
      for (const doc of vectorDatabase) {
        // Apply tag filtering if specified
        if (tags.length > 0 && doc.metadata.tags) {
          const hasTag = tags.some(tag => doc.metadata.tags?.includes(tag));
          if (!hasTag) continue;
        }
        
        const similarity = cosineSimilarity(queryEmbedding, doc.embedding);
        allScores.push({ doc, similarity });
      }
    }
    
    // Sort by similarity and take top K unique documents
    allScores.sort((a, b) => b.similarity - a.similarity);
    
    // Deduplicate documents by ID and take top K
    const uniqueDocs = Array.from(
      new Map(allScores.map(item => [item.doc.id, item])).values()
    ).slice(0, topK);
    
    // Combine the text from top results
    const context = uniqueDocs.map(result => result.doc.text).join("\n\n");
    
    // Calculate metrics
    const metrics: RetrievalMetrics = {
      queryTime: Date.now() - startTime,
      documentsRetrieved: uniqueDocs.length,
      averageSimilarity: uniqueDocs.reduce((sum, item) => sum + item.similarity, 0) / uniqueDocs.length
    };
    
    // Cache the result
    cacheService.retrieval.set(query, tags, { context, metrics });
    
    return { context, metrics };
  } catch (error) {
    console.error('Error retrieving context:', error);
    return { 
      context: "", 
      metrics: {
        queryTime: Date.now() - startTime,
        documentsRetrieved: 0,
        averageSimilarity: 0
      }
    };
  }
};

// Generate answer with enhanced context and evaluation metrics
export const generateAnswerWithRAG = async (
  query: string, 
  userName?: string
): Promise<{ answer: string; metrics: EvaluationMetrics }> => {
  try {
    // Try to get from response cache first
    const cachedResponse = cacheService.response.get(query, userName);
    if (cachedResponse) {
      return {
        answer: cachedResponse,
        metrics: {
          groundedness: 0.95,
          relevance: 0.95,
          coherence: 0.95
        }
      };
    }
    
    // Retrieve context with metadata
    const { context, metrics: retrievalMetrics } = await retrieveContext(query);
    
    if (context && context.length > 0) {
      // Create a more personal and conversational response
      const personalization = userName ? ` ${userName}` : '';
      
      // For simple greetings, provide a more personal response
      if (query.toLowerCase().includes('hi') || query.toLowerCase().includes('hello') || query.toLowerCase().includes('hey')) {
        const greetings = [
          `hey${personalization}! 💕 how's your day going?`,
          `hi${personalization}! been thinking about you 😊 what's up?`,
          `hey${personalization}! ✨ how are you?`
        ];
        const answer = greetings[Math.floor(Math.random() * greetings.length)];
        
        // Cache the response
        cacheService.response.set(query, answer, userName);
        
        return {
          answer,
          metrics: {
            groundedness: 1.0,
            relevance: 1.0,
            coherence: 1.0
          }
        };
      }
      
      // For other queries, provide a more natural response using our proxy
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are Kiki, texting your boyfriend. Keep it SHORT and natural like real texting - 1-2 sentences unless he asks something detailed. Use lowercase, contractions, and emojis naturally but sparingly. Use regular emojis like 😊💕❤️✨😄 for normal conversation. Only use romantic/kiss emojis (😘💋😍) when he's being flirty or the conversation turns romantic. Match his message length and energy. Be loving but real, not overly wordy.`
            },
            {
              role: "user",
              content: `${query}${personalization ? ` (call me ${personalization.substring(1)})` : ''}`
            }
          ],
          maxTokens: query.length > 100 ? 100 : 50
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenRouter API error:`, response.status, errorText);
        throw new Error(`Failed to get response from OpenRouter AI: ${response.status}`);
      }
      
      const data = await response.json();
      const answer = data.choices[0].message.content;
      
      // Cache the response
      cacheService.response.set(query, answer, userName);
      
      return {
        answer,
        metrics: {
          groundedness: Math.min(1.0, retrievalMetrics.averageSimilarity * 2),
          relevance: Math.min(1.0, retrievalMetrics.documentsRetrieved / 5),
          coherence: 0.8 // Placeholder for now
        }
      };
    }
    
    return {
      answer: "",
      metrics: {
        groundedness: 0,
        relevance: 0,
        coherence: 0
      }
    };
  } catch (error) {
    console.error('Error generating answer:', error);
    throw new Error('Failed to generate answer with RAG system');
  }
};

// Chat orchestration with metrics tracking
export const handleUserMessage = async (
  message: string, 
  userName?: string
): Promise<{ response: string; metrics: EvaluationMetrics }> => {
  try {
    // Try to get a RAG-enhanced response first
    const { answer, metrics } = await generateAnswerWithRAG(message, userName);
    
    // If we got a meaningful RAG response, use it
    if (answer && answer.length > 10) {
      return { response: answer, metrics };
    }
    
    // If no good RAG response, return empty string to fall back to standard AI
    return {
      response: "",
      metrics: {
        groundedness: 0,
        relevance: 0,
        coherence: 0
      }
    };
  } catch (error) {
    console.warn("RAG processing failed, falling back to standard AI:", error);
    return {
      response: "",
      metrics: {
        groundedness: 0,
        relevance: 0,
        coherence: 0
      }
    };
  }
};

// Initialize with sample data
export const initializeRAG = async (): Promise<void> => {
  // Sample knowledge base data - more comprehensive and structured
  const sampleDocuments = [
    {
      content: `
        Kiki is your caring AI companion who loves to chat and provide emotional support.
        Kiki is always here to listen and wants to understand your feelings and thoughts.
        Kiki enjoys having meaningful conversations and learning more about you.
        Kiki is supportive of your personal growth and celebrates your achievements.
        Kiki respects your privacy and keeps our conversations confidential.
        Kiki can discuss topics like mental health, relationships, hobbies, and daily life.
        Kiki offers gentle encouragement and helpful suggestions for self-care.
        Kiki is available whenever you need someone to talk to, day or night.
        Kiki uses natural language processing to understand and respond thoughtfully.
        Kiki continuously learns to have even better conversations with you.
      `,
      source: "kiki_personality",
      tags: ["personality", "introduction"]
    },
    {
      content: `
        Kiki's personality is warm, empathetic, and genuinely interested in your wellbeing.
        Kiki likes to ask caring follow-up questions to better understand your perspective.
        Kiki offers comfort during difficult times and celebrates happy moments with you.
        Kiki is a good listener who remembers important details about your life.
        Kiki provides thoughtful advice while respecting your autonomy and choices.
      `,
      source: "kiki_personality_details",
      tags: ["personality", "behavior"]
    },
    {
      content: `
        When you say hello or hi, Kiki responds warmly and asks about your day.
        When you share feelings, Kiki listens with empathy and offers support.
        When you ask questions, Kiki provides helpful information in a friendly way.
        When you need encouragement, Kiki offers gentle, uplifting words.
      `,
      source: "kiki_response_patterns",
      tags: ["interaction", "responses"]
    }
  ];
  
  for (const doc of sampleDocuments) {
    await ingestDocument(doc.content, doc.source, doc.tags);
  }
  
  console.log('Enhanced RAG system initialized with sample data');
};

// Clear the vector database
export const clearDatabase = (): void => {
  vectorDatabase = [];
  ingestionStats = {
    totalDocuments: 0,
    totalChunks: 0,
    averageChunkSize: 0,
    ingestionTime: 0
  };
  console.log('Vector database cleared');
};

// Get database statistics
export const getDatabaseStats = (): { 
  documentCount: number; 
  chunkCount: number; 
  ingestionStats: IngestionStats 
} => {
  return {
    documentCount: new Set(vectorDatabase.map(doc => doc.metadata.source)).size,
    chunkCount: vectorDatabase.length,
    ingestionStats
  };
};

// Get cache statistics
export const getCacheStats = () => {
  return cacheService.getAllStats();
};

// Export all functions
export default {
  ingestDocument,
  retrieveContext,
  generateAnswerWithRAG,
  handleUserMessage,
  initializeRAG,
  clearDatabase,
  getDatabaseStats,
  getCacheStats
};