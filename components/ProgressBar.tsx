import React from "react";
import { StyleSheet, View, Text } from "react-native";
import Colors from "@/constants/colors";

interface ProgressBarProps {
  progress: number; // 0 to 1
  label?: string;
  color?: string;
  height?: number;
  showPercentage?: boolean;
  testID?: string;
}

export default function ProgressBar({
  progress,
  label,
  color = Colors.light.primary,
  height = 8,
  showPercentage = true,
  testID,
}: ProgressBarProps) {
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const percentage = Math.round(clampedProgress * 100);

  return (
    <View style={styles.container} testID={testID}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.progressContainer, { height }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
      {showPercentage && <Text style={styles.percentage}>{percentage}%</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: Colors.light.text,
  },
  progressContainer: {
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    flex: 1,
  },
  progressFill: {
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
    textAlign: "right",
  },
});
