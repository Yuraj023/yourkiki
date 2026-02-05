// Simple test for RAG service functionality
import { ingestData, retrieveContext, generateAnswerWithRAG, clearDatabase, getDatabaseStats } from "./ragService";

// Test the RAG functionality
async function testRAG() {
  console.log("Testing RAG functionality...");
  
  // Clear any existing data
  clearDatabase();
  
  // Test data ingestion
  const testData = "Kiki is an AI companion designed to provide emotional support. RAG stands for Retrieval-Augmented Generation.";
  await ingestData(testData);
  
  console.log("Database stats:", getDatabaseStats());
  
  // Test context retrieval
  const context = await retrieveContext("What is Kiki?");
  console.log("Retrieved context:", context);
  
  // Test answer generation
  const answer = await generateAnswerWithRAG("What is RAG?");
  console.log("Generated answer:", answer);
  
  console.log("RAG test completed successfully!");
}

// Run the test
testRAG().catch(console.error);