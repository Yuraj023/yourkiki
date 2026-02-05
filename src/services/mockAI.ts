import { Message, Mood } from "@/types/chat";

// Mock AI service that simulates intelligent responses
export const generateAIResponse = async (
  userMessage: string,
  conversationHistory: Message[]
): Promise<string> => {
  const mood = detectMood(userMessage);
  
  // Simulate thinking time
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  // Context-aware responses based on mood and content
  if (mood.type === "sad") {
    return generateSupportiveResponse(userMessage);
  } else if (mood.type === "stressed") {
    return generateCalmingResponse(userMessage);
  } else if (mood.type === "happy") {
    return generatePositiveResponse(userMessage);
  }

  return generateNeutralResponse(userMessage, conversationHistory);
};

const detectMood = (message: string): Mood => {
  const lowerMsg = message.toLowerCase();
  
  const sadWords = ["sad", "lonely", "depressed", "upset", "down", "cry", "hurt"];
  const stressedWords = ["stressed", "overwhelmed", "anxious", "worried", "busy", "tired"];
  const happyWords = ["happy", "great", "excited", "wonderful", "amazing", "joy"];

  if (sadWords.some(word => lowerMsg.includes(word))) {
    return { type: "sad", confidence: 0.8 };
  }
  if (stressedWords.some(word => lowerMsg.includes(word))) {
    return { type: "stressed", confidence: 0.8 };
  }
  if (happyWords.some(word => lowerMsg.includes(word))) {
    return { type: "happy", confidence: 0.8 };
  }

  return { type: "neutral", confidence: 0.5 };
};

const generateSupportiveResponse = (message: string): string => {
  const responses = [
    "I'm really sorry you're feeling this way. I'm here to listen. Would you like to talk more about what's bothering you?",
    "That sounds really tough. Remember that it's okay to feel sad sometimes. What usually helps you feel a bit better?",
    "I hear you, and your feelings are valid. Sometimes just talking about things can help. I'm here for you.",
    "I'm here with you. It's okay to not be okay. Would you like to share what's on your mind?",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

const generateCalmingResponse = (message: string): string => {
  const responses = [
    "It sounds like you have a lot on your plate. Let's take it one step at a time. What's the most pressing thing right now?",
    "Feeling overwhelmed is tough. Have you tried taking a short break? Even 5 minutes of deep breathing can help.",
    "I can sense you're under pressure. Remember, you don't have to do everything at once. What's one small thing you could tackle first?",
    "That's a lot to handle. Would it help to talk through your priorities? Sometimes organizing thoughts out loud makes things clearer.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

const generatePositiveResponse = (message: string): string => {
  const responses = [
    "That's wonderful to hear! I'm so glad you're feeling good. What's making your day special?",
    "Your positive energy is contagious! Tell me more about what's making you happy.",
    "I love hearing this! It's great that you're in such a good mood. What are you most excited about?",
    "That's fantastic! Moments like these are worth celebrating. What happened?",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

const generateNeutralResponse = (
  message: string,
  history: Message[]
): string => {
  const questions = [
    "That's interesting! Tell me more about that.",
    "I'd love to hear more. How do you feel about it?",
    "Thanks for sharing that with me. What's been on your mind lately?",
    "I'm listening. Is there anything specific you'd like to talk about?",
    "How has your day been going so far?",
  ];

  const encouragements = [
    "I appreciate you opening up to me. What else would you like to discuss?",
    "It's nice chatting with you. What are you thinking about today?",
    "I'm here whenever you need to talk. What's going through your mind?",
  ];

  const allResponses = [...questions, ...encouragements];
  return allResponses[Math.floor(Math.random() * allResponses.length)];
};
