import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Mic, TrendingUp, Award, Target, Zap, Calendar, Clock, BarChart3 } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "@/constants/colors";
import { useSpeech, useRecentSessions } from "@/hooks/use-speech-store";
import Card from "@/components/Card";
import Button from "@/components/Button";
import SessionCard from "@/components/SessionCard";
import ProgressBar from "@/components/ProgressBar";

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const { sessions } = useSpeech();
  const recentSessions = useRecentSessions(3);
  
  const calculateAverageConfidence = () => {
    if (recentSessions.length === 0) return 0;
    const sum = recentSessions.reduce((acc, session) => acc + session.analysis.confidence, 0);
    return sum / recentSessions.length;
  };
  
  const calculateAverageClarity = () => {
    if (recentSessions.length === 0) return 0;
    const sum = recentSessions.reduce((acc, session) => acc + session.analysis.clarity, 0);
    return sum / recentSessions.length;
  };
  
  const getTotalFillerWords = () => {
    if (recentSessions.length === 0) return 0;
    return recentSessions.reduce((acc, session) => acc + session.analysis.fillerWords.count, 0);
  };
  
  const getAverageWPM = () => {
    if (recentSessions.length === 0) return 0;
    const sum = recentSessions.reduce((acc, session) => acc + session.analysis.speakingSpeed, 0);
    return Math.round(sum / recentSessions.length);
  };

  const handleStartRecording = () => {
    router.push("/talk");
  };

  const getStreakDays = () => {
    if (sessions.length === 0) return 0;
    
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    while (streak < 30) { // Max 30 days to prevent infinite loop
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const hasSessionOnDay = sessions.some(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= dayStart && sessionDate <= dayEnd;
      });
      
      if (hasSessionOnDay) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getTotalPracticeTime = () => {
    return sessions.reduce((total, session) => total + session.duration, 0);
  };

  const getImprovementTrend = () => {
    if (sessions.length < 2) return 0;
    
    const recent = sessions.slice(0, Math.min(5, sessions.length));
    const older = sessions.slice(5, Math.min(10, sessions.length));
    
    if (older.length === 0) return 0;
    
    const recentAvg = recent.reduce((acc, s) => acc + s.analysis.confidence, 0) / recent.length;
    const olderAvg = older.reduce((acc, s) => acc + s.analysis.confidence, 0) / older.length;
    
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>TalkUp</Text>
        <Text style={styles.subtitle}>Your AI Speaking Coach</Text>
      </View>
      
      <Card style={styles.heroCard}>
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Ready to improve?</Text>
              <Text style={styles.heroSubtitle}>Start your next speaking session</Text>
            </View>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={handleStartRecording}
            >
              <View style={styles.heroButtonInner}>
                <Mic size={24} color={Colors.light.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Card>
      
      {recentSessions.length > 0 ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <LinearGradient
                colors={[Colors.light.primary + '20', Colors.light.primary + '10']}
                style={styles.statGradient}
              >
                <View style={styles.statIconContainer}>
                  <TrendingUp size={24} color={Colors.light.primary} />
                </View>
                <Text style={styles.statValue}>{getAverageWPM()}</Text>
                <Text style={styles.statLabel}>Words/Min</Text>
              </LinearGradient>
            </Card>
            
            <Card style={styles.statCard}>
              <LinearGradient
                colors={[Colors.light.secondary + '20', Colors.light.secondary + '10']}
                style={styles.statGradient}
              >
                <View style={styles.statIconContainer}>
                  <Award size={24} color={Colors.light.secondary} />
                </View>
                <Text style={styles.statValue}>{Math.round(calculateAverageConfidence() * 100)}%</Text>
                <Text style={styles.statLabel}>Confidence</Text>
              </LinearGradient>
            </Card>
          </View>
          
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <LinearGradient
                colors={[Colors.light.accent + '20', Colors.light.accent + '10']}
                style={styles.statGradient}
              >
                <View style={styles.statIconContainer}>
                  <Zap size={24} color={Colors.light.accent} />
                </View>
                <Text style={styles.statValue}>{getStreakDays()}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </LinearGradient>
            </Card>
            
            <Card style={styles.statCard}>
              <LinearGradient
                colors={[Colors.light.primary + '20', Colors.light.primary + '10']}
                style={styles.statGradient}
              >
                <View style={styles.statIconContainer}>
                  <Clock size={24} color={Colors.light.primary} />
                </View>
                <Text style={styles.statValue}>{Math.round(getTotalPracticeTime() / 60)}</Text>
                <Text style={styles.statLabel}>Total Minutes</Text>
              </LinearGradient>
            </Card>
          </View>
          
          <Card style={styles.progressCard}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <View style={styles.progressContainer}>
              <ProgressBar 
                progress={calculateAverageConfidence()} 
                label="Overall Confidence" 
                color={Colors.light.primary}
              />
              <ProgressBar 
                progress={calculateAverageClarity()} 
                label="Speech Clarity" 
                color={Colors.light.secondary}
              />
            </View>
            
            {getImprovementTrend() !== 0 && (
              <View style={styles.trendContainer}>
                <BarChart3 size={16} color={getImprovementTrend() > 0 ? Colors.light.primary : Colors.light.error} />
                <Text style={[styles.trendText, { color: getImprovementTrend() > 0 ? Colors.light.primary : Colors.light.error }]}>
                  {getImprovementTrend() > 0 ? '+' : ''}{getImprovementTrend().toFixed(1)}% vs last sessions
                </Text>
              </View>
            )}
          </Card>
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            <TouchableOpacity onPress={() => router.push("/journal")}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.recentSessionsContainer}>
            {recentSessions.map(session => (
              <SessionCard key={session.id} session={session} compact />
            ))}
          </View>
        </>
      ) : (
        <Card style={styles.emptyStateCard}>
          <LinearGradient
            colors={[Colors.light.primary + '10', Colors.light.secondary + '10']}
            style={styles.emptyStateGradient}
          >
            <View style={styles.emptyStateIconContainer}>
              <Mic size={64} color={Colors.light.primary} />
            </View>
            <Text style={styles.emptyStateTitle}>Welcome to TalkUp!</Text>
            <Text style={styles.emptyStateText}>
              Start your speaking journey with your first recording session. Get AI-powered feedback and track your progress.
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={handleStartRecording}
            >
              <LinearGradient
                colors={[Colors.light.primary, Colors.light.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyStateButtonGradient}
              >
                <Mic size={20} color="white" />
                <Text style={styles.emptyStateButtonText}>Start Your First Session</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Card>
      )}
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
    fontSize: 28,
    fontWeight: "700",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  heroCard: {
    marginBottom: 24,
    padding: 0,
    overflow: "hidden",
  },
  heroGradient: {
    padding: 24,
    borderRadius: 16,
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "white",
    opacity: 0.9,
  },
  heroButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heroButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 0,
    overflow: "hidden",
  },
  statGradient: {
    padding: 20,
    alignItems: "center",
    borderRadius: 12,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: "500",
    textAlign: "center",
  },
  progressCard: {
    marginTop: 12,
    padding: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 16,
  },
  progressContainer: {
    gap: 12,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  trendText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  recentSessionsContainer: {
    gap: 12,
  },
  emptyStateCard: {
    marginTop: 32,
    padding: 0,
    overflow: "hidden",
  },
  emptyStateGradient: {
    padding: 32,
    alignItems: "center",
    borderRadius: 16,
  },
  emptyStateIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyStateButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  emptyStateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
