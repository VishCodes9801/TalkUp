import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { BarChart2, Clock, MessageSquare, Save } from "lucide-react-native";

import Colors from "@/constants/colors";
import { useSpeech } from "@/hooks/use-speech-store";
import Card from "@/components/Card";
import Button from "@/components/Button";
import ProgressBar from "@/components/ProgressBar";

export default function AnalysisScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { sessions, addReflection } = useSpeech();
  
  const session = sessions.find(s => s.id === id);
  const [reflection, setReflection] = useState(session?.reflection || "");
  
  if (!session) {
    return (
      <View style={styles.container}>
        <Text>Session not found</Text>
      </View>
    );
  }
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };
  
  const handleSaveReflection = () => {
    addReflection(session.id, reflection);
    router.back();
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: "Speech Analysis",
          headerBackTitle: "Back",
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.date}>
              {new Date(session.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
            <View style={styles.durationContainer}>
              <Clock size={14} color={Colors.light.textSecondary} />
              <Text style={styles.duration}>{formatDuration(session.duration)}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Overall</Text>
              <Text style={styles.scoreValue}>
                {Math.round((session.analysis.confidence + session.analysis.clarity) * 50)}%
              </Text>
            </View>
          </View>
        </View>
        
        <Card style={styles.transcriptCard}>
          <Text style={styles.sectionTitle}>Transcript</Text>
          <Text style={styles.transcript}>{session.transcript}</Text>
        </Card>
        
        <Card>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Speaking Speed</Text>
              <Text style={styles.metricValue}>{session.analysis.speakingSpeed} WPM</Text>
              <Text style={styles.metricNote}>
                {session.analysis.speakingSpeed < 120 
                  ? "Speak a bit faster for better engagement" 
                  : session.analysis.speakingSpeed > 160 
                    ? "Try slowing down for better clarity" 
                    : "Good pace for clear communication"}
              </Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Filler Words</Text>
              <Text style={styles.metricValue}>{session.analysis.fillerWords.count}</Text>
              <Text style={styles.metricNote}>
                {session.analysis.fillerWords.words.slice(0, 3).join(", ")}
                {session.analysis.fillerWords.words.length > 3 ? "..." : ""}
              </Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Emotional Tone</Text>
              <Text style={styles.metricValue}>{session.analysis.emotionalTone}</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={session.analysis.confidence} 
              label="Confidence" 
              color={Colors.light.primary}
            />
            <ProgressBar 
              progress={session.analysis.clarity} 
              label="Clarity" 
              color={Colors.light.secondary}
            />
          </View>
        </Card>
        
        <Card>
          <Text style={styles.sectionTitle}>AI Suggestions</Text>
          
          <View style={styles.suggestionsContainer}>
            {session.analysis.suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionNumber}>{index + 1}.</Text>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        </Card>
        
        <Card>
          <View style={styles.reflectionHeader}>
            <MessageSquare size={20} color={Colors.light.primary} />
            <Text style={styles.reflectionTitle}>Your Reflection</Text>
          </View>
          
          <TextInput
            style={styles.reflectionInput}
            multiline
            placeholder="Add your thoughts about this session..."
            value={reflection}
            onChangeText={setReflection}
            placeholderTextColor={Colors.light.textSecondary}
          />
          
          <Button
            title="Save Reflection"
            onPress={handleSaveReflection}
            variant="primary"
            size="medium"
            style={styles.saveButton}
            testID="save-reflection-button"
          />
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  date: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  duration: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 4,
  },
  scoreContainer: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    minWidth: 80,
  },
  scoreLabel: {
    fontSize: 12,
    color: "white",
    opacity: 0.8,
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  transcriptCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 12,
  },
  transcript: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  metricItem: {
    width: "48%",
    marginBottom: 16,
  },
  metricLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  metricNote: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  progressContainer: {
    marginTop: 8,
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  suggestionNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.primary,
    width: 24,
  },
  suggestionText: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
    lineHeight: 22,
  },
  reflectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reflectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginLeft: 8,
  },
  reflectionInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    fontSize: 16,
    color: Colors.light.text,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: 16,
  },
});
