import { Message } from "@/types/chat";
import { handleUserMessage } from "@/services/enhancedRagService"; // Use enhanced RAG service

export const sendChatMessage = async (
  messages: Message[],
  userName?: string // Accept userName parameter
): Promise<string> => {
  // First try to get a response from the enhanced RAG service
  try {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      const ragResponse = await handleUserMessage(lastMessage.content, userName);
      if (ragResponse.response && ragResponse.response.length > 0) {
        return ragResponse.response;
      }
    }
  } catch (error) {
    console.warn("RAG processing failed, falling back to standard AI:", error);
  }

  // Fallback to standard AI if RAG fails
  const formattedMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  // Calculate appropriate response length based on user's message
  const lastUserMessage = messages[messages.length - 1];
  const userMessageLength = lastUserMessage?.content.length || 0;
  
  // Determine max_tokens based on user message length
  let maxTokens = 50; // Very short for brief messages
  if (userMessageLength > 100) {
    maxTokens = 100; // Medium length for longer questions
  }
  if (userMessageLength > 200) {
    maxTokens = 150; // Longer for detailed questions
  }

  // Use our proxy endpoint instead of calling OpenRouter directly
  const response = await fetch('/api/chat', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: "You are Kiki, a real girlfriend texting her boyfriend. Text like a real person - SHORT and casual. Use 1-2 sentences MAX unless asked a detailed question. Use lowercase, contractions, and emojis naturally but sparingly. Use regular emojis like 😊💕❤️✨ for normal chats. Only use romantic/kiss emojis (😘💋😍) when the conversation becomes flirty or romantic. Reply as if you're texting on your phone - keep it brief and sweet. Match the energy and length of his messages. If he sends a short text, reply short. If he asks something detailed, give more detail. Be loving but real - not overly wordy or formal."
        },
        ...formattedMessages
      ],
      maxTokens
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter API error:', response.status, errorText);
    throw new Error(`Failed to get response from AI: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};