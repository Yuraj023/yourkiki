export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Mood {
  type: "happy" | "sad" | "stressed" | "neutral";
  confidence: number;
}
