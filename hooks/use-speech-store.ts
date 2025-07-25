import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation } from "@tanstack/react-query";
import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";

import { SessionData, SpeechAnalysis } from "@/types/speech";

const STORAGE_KEY = "talkup-sessions";

export const [SpeechContext, useSpeech] = createContextHook(() => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Fetch sessions from storage
  const sessionsQuery = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      try {
        const storedSessions = await AsyncStorage.getItem(STORAGE_KEY);
        return storedSessions ? JSON.parse(storedSessions) as SessionData[] : [];
      } catch (error) {
        console.error("Error loading sessions:", error);
        return [];
      }
    },
  });

  // Save sessions to storage
  const syncMutation = useMutation({
    mutationFn: async (updatedSessions: SessionData[]) => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
        return updatedSessions;
      } catch (error) {
        console.error("Error saving sessions:", error);
        throw error;
      }
    },
  });

  useEffect(() => {
    if (sessionsQuery.data) {
      setSessions(sessionsQuery.data);
    }
  }, [sessionsQuery.data]);

  // Analyze speech transcript
  const analyzeSpeech = async (transcript: string, duration: number): Promise<SpeechAnalysis> => {
    setIsAnalyzing(true);
    
    try {
      const words = transcript.split(" ").filter(word => word.trim());
      const fillerWords = ["um", "uh", "like", "you know", "actually", "so", "well", "basically"];
      const foundFillerWords = words.filter(word => 
        fillerWords.some(filler => word.toLowerCase().includes(filler.toLowerCase()))
      );
      
      const speakingSpeed = Math.floor((words.length / duration) * 60); // words per minute
      
      // Create AI analysis prompt
      const analysisPrompt = `Analyze this speech transcript for public speaking quality:

"${transcript}"

Speech duration: ${duration} seconds
Word count: ${words.length}
Speaking speed: ${speakingSpeed} WPM
Filler words found: ${foundFillerWords.length}

Provide analysis in this exact JSON format:
{
  "confidence": 0.85,
  "clarity": 0.90,
  "emotionalTone": "confident",
  "suggestions": [
    "Specific suggestion 1",
    "Specific suggestion 2",
    "Specific suggestion 3"
  ]
}

Base confidence (0-1) on speech flow, coherence, and lack of hesitation.
Base clarity (0-1) on word choice, sentence structure, and articulation.
Emotional tone should be one of: confident, enthusiastic, neutral, hesitant, nervous.
Provide 3-4 specific, actionable suggestions for improvement.`;

      // Call AI API for analysis
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: analysisPrompt
            }
          ]
        })
      });
      
      if (!response.ok) {
        throw new Error(`AI analysis failed: ${response.status}`);
      }
      
      const aiResult = await response.json();
      let aiAnalysis;
      
      try {
        aiAnalysis = JSON.parse(aiResult.completion);
      } catch {
        // Fallback if AI doesn't return valid JSON
        aiAnalysis = {
          confidence: 0.75,
          clarity: 0.80,
          emotionalTone: "neutral",
          suggestions: [
            "Practice speaking at a steady pace",
            "Work on reducing filler words",
            "Focus on clear articulation"
          ]
        };
      }
      
      const analysis: SpeechAnalysis = {
        confidence: Math.max(0, Math.min(1, aiAnalysis.confidence || 0.75)),
        fillerWords: {
          count: foundFillerWords.length,
          words: foundFillerWords,
        },
        speakingSpeed,
        clarity: Math.max(0, Math.min(1, aiAnalysis.clarity || 0.80)),
        emotionalTone: aiAnalysis.emotionalTone || "neutral",
        suggestions: aiAnalysis.suggestions || [
          "Practice speaking at a steady pace",
          "Work on reducing filler words",
          "Focus on clear articulation"
        ],
      };
      
      return analysis;
    } catch (error) {
      console.error("Error analyzing speech:", error);
      
      // Fallback analysis if AI fails
      const words = transcript.split(" ").filter(word => word.trim());
      const fillerWords = ["um", "uh", "like", "you know", "actually"];
      const foundFillerWords = words.filter(word => 
        fillerWords.some(filler => word.toLowerCase().includes(filler.toLowerCase()))
      );
      
      return {
        confidence: 0.75,
        fillerWords: {
          count: foundFillerWords.length,
          words: foundFillerWords,
        },
        speakingSpeed: Math.floor((words.length / duration) * 60),
        clarity: 0.80,
        emotionalTone: "neutral",
        suggestions: [
          "Practice speaking at a steady pace",
          "Work on reducing filler words",
          "Focus on clear articulation",
          "Record yourself regularly to track progress"
        ],
      };
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save a new session
  const saveSession = (session: SessionData) => {
    const updatedSessions = [session, ...sessions];
    setSessions(updatedSessions);
    syncMutation.mutate(updatedSessions);
    return session;
  };

  // Add reflection to a session
  const addReflection = (sessionId: string, reflection: string) => {
    const updatedSessions = sessions.map(session => 
      session.id === sessionId ? { ...session, reflection } : session
    );
    setSessions(updatedSessions);
    syncMutation.mutate(updatedSessions);
  };

  // Update session name
  const updateSessionName = (sessionId: string, name: string) => {
    const updatedSessions = sessions.map(session => 
      session.id === sessionId ? { ...session, name } : session
    );
    setSessions(updatedSessions);
    syncMutation.mutate(updatedSessions);
  };

  // Delete a session
  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    setSessions(updatedSessions);
    syncMutation.mutate(updatedSessions);
  };

  // Add tags to a session
  const addTagsToSession = (sessionId: string, tags: string[]) => {
    const updatedSessions = sessions.map(session => 
      session.id === sessionId ? { ...session, tags } : session
    );
    setSessions(updatedSessions);
    syncMutation.mutate(updatedSessions);
  };

  return {
    sessions,
    currentSession,
    setCurrentSession,
    isAnalyzing,
    analyzeSpeech,
    saveSession,
    addReflection,
    updateSessionName,
    deleteSession,
    addTagsToSession,
    isLoading: sessionsQuery.isLoading,
  };
});

export function useRecentSessions(limit: number = 5) {
  const { sessions } = useSpeech();
  return sessions.slice(0, limit);
}
