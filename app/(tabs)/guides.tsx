import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { Search } from "lucide-react-native";

import Colors from "@/constants/colors";
import { useGuides } from "@/hooks/use-guides-store";
import GuideCard from "@/components/GuideCard";

export default function GuidesScreen() {
  const { guides } = useGuides();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  
  const filteredGuides = () => {
    if (activeFilter === "all") return guides;
    return guides.filter(guide => guide.difficulty === activeFilter);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Practice Guides</Text>
        <Text style={styles.subtitle}>
          Select a guide to practice specific speaking skills with structured prompts.
        </Text>
      </View>
      
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === "all" && styles.activeFilterButton,
          ]}
          onPress={() => setActiveFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "all" && styles.activeFilterText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === "beginner" && styles.activeFilterButton,
          ]}
          onPress={() => setActiveFilter("beginner")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "beginner" && styles.activeFilterText,
            ]}
          >
            Beginner
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === "intermediate" && styles.activeFilterButton,
          ]}
          onPress={() => setActiveFilter("intermediate")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "intermediate" && styles.activeFilterText,
            ]}
          >
            Intermediate
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === "advanced" && styles.activeFilterButton,
          ]}
          onPress={() => setActiveFilter("advanced")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "advanced" && styles.activeFilterText,
            ]}
          >
            Advanced
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.guidesContainer}>
        {filteredGuides().map(guide => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </View>
    </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  filtersContainer: {
    flexDirection: "row",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterButton: {
    backgroundColor: Colors.light.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: "500",
  },
  activeFilterText: {
    color: "white",
  },
  guidesContainer: {
    marginTop: 8,
  },
});
