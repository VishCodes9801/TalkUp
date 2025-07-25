export interface SpeechAnalysis {
  confidence: number;
  fillerWords: {
    count: number;
    words: string[];
  };
  speakingSpeed: number; // words per minute
  clarity: number;
  emotionalTone: string;
  suggestions: string[];
}

export interface SessionData {
  id: string;
  name?: string;
  date: string;
  duration: number; // in seconds
  transcript: string;
  analysis: SpeechAnalysis;
  reflection?: string;
  audioUri?: string;
  tags?: string[];
}

export interface Guide {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  prompt: string;
}
