import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Clock, BookOpen, ArrowRight } from "lucide-react-native";

import Colors from "@/constants/colors";
import { useGuides } from "@/hooks/use-guides-store";
import Card from "@/components/Card";
import Button from "@/components/Button";

export default function GuideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { guides } = useGuides();
  
  const guide = guides.find(g => g.id === id);
  
  if (!guide) {
    return (
      <View style={styles.container}>
        <Text>Guide not found</Text>
      </View>
    );
  }
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "#10B981"; // green
      case "intermediate":
        return "#F59E0B"; // amber
      case "advanced":
        return "#EF4444"; // red
      default:
        return Colors.light.textSecondary;
    }
  };
  
  const handleStartPractice = () => {
    router.push({
      pathname: "/talk",
      params: { guideId: guide.id }
    });
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: guide.title,
          headerBackTitle: "Guides",
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View 
              style={[
                styles.difficultyBadge, 
                { backgroundColor: getDifficultyColor(guide.difficulty) + "20" }
              ]}
            >
              <Text 
                style={[
                  styles.difficultyText, 
                  { color: getDifficultyColor(guide.difficulty) }
                ]}
              >
                {guide.difficulty.charAt(0).toUpperCase() + guide.difficulty.slice(1)}
              </Text>
            </View>
            
            <View style={styles.durationContainer}>
              <Clock size={14} color={Colors.light.textSecondary} />
              <Text style={styles.duration}>{guide.duration}</Text>
            </View>
          </View>
          
          <Text style={styles.title}>{guide.title}</Text>
          <Text style={styles.description}>{guide.description}</Text>
        </View>
        
        <Card style={styles.promptCard}>
          <View style={styles.promptHeader}>
            <BookOpen size={20} color={Colors.light.primary} />
            <Text style={styles.promptTitle}>Practice Prompt</Text>
          </View>
          
          <Text style={styles.promptText}>{guide.prompt}</Text>
        </Card>
        
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips for this exercise:</Text>
          
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>1.</Text>
            <Text style={styles.tipText}>Take a moment to organize your thoughts before starting</Text>
          </View>
          
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>2.</Text>
            <Text style={styles.tipText}>Focus on clear articulation and maintaining a steady pace</Text>
          </View>
          
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>3.</Text>
            <Text style={styles.tipText}>Use natural gestures and body language (even when practicing alone)</Text>
          </View>
          
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>4.</Text>
            <Text style={styles.tipText}>Record yourself multiple times to see improvement</Text>
          </View>
        </Card>
        
        <Button
          title="Start Practice"
          onPress={handleStartPractice}
          variant="primary"
          size="large"
          style={styles.startButton}
          testID="start-practice-button"
        />
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
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: "600",
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  promptCard: {
    marginBottom: 16,
    backgroundColor: Colors.light.primary + "08",
  },
  promptHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginLeft: 8,
  },
  promptText: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    fontStyle: "italic",
  },
  tipsCard: {
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  tipNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.primary,
    width: 24,
  },
  tipText: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
    lineHeight: 22,
  },
  startButton: {
    marginTop: 8,
  },
});
