import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Clock, ChevronRight, BarChart } from "lucide-react-native";

import { Guide } from "@/types/speech";
import Card from "./Card";
import Colors from "@/constants/colors";

interface GuideCardProps {
  guide: Guide;
  testID?: string;
}

export default function GuideCard({ guide, testID }: GuideCardProps) {
  const router = useRouter();
  
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

  const handlePress = () => {
    router.push(`/guide/${guide.id}`);
  };

  return (
    <TouchableOpacity onPress={handlePress} testID={testID}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{guide.title}</Text>
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
        </View>
        
        <Text style={styles.description}>{guide.description}</Text>
        
        <View style={styles.footer}>
          <View style={styles.durationContainer}>
            <Clock size={14} color={Colors.light.textSecondary} />
            <Text style={styles.duration}>{guide.duration}</Text>
          </View>
          
          <View style={styles.startContainer}>
            <Text style={styles.startText}>Start Practice</Text>
            <ChevronRight size={16} color={Colors.light.primary} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  startContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  startText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "600",
    marginRight: 4,
  },
});
