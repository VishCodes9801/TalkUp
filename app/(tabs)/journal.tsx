import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from "react-native";
import { useRouter } from "expo-router";
import { Calendar, Clock, Search, Filter, Play, Pause, Edit3, Trash2, Tag, X, Check } from "lucide-react-native";
import { Audio } from "expo-av";

import Colors from "@/constants/colors";
import { useSpeech } from "@/hooks/use-speech-store";
import Card from "@/components/Card";
import SessionCard from "@/components/SessionCard";
import Button from "@/components/Button";
import { SessionData } from "@/types/speech";

export default function JournalScreen() {
  const router = useRouter();
  const { sessions, updateSessionName, deleteSession, addTagsToSession } = useSpeech();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "recent" | "favorites">("all");
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editTags, setEditTags] = useState("");
  const [playbackObject, setPlaybackObject] = useState<Audio.Sound | null>(null);
  const [playingSessionId, setPlayingSessionId] = useState<string | null>(null);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.transcript.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (filterBy) {
      case "recent":
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return matchesSearch && new Date(session.date) > weekAgo;
      case "favorites":
        return matchesSearch && session.tags?.includes("favorite");
      default:
        return matchesSearch;
    }
  });
  
  const groupSessionsByDate = () => {
    const grouped: { [key: string]: SessionData[] } = {};
    
    filteredSessions.forEach(session => {
      const date = new Date(session.date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });
    
    return grouped;
  };
  
  const groupedSessions = groupSessionsByDate();
  const sortedDates = Object.keys(groupedSessions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const handlePlayRecording = async (session: SessionData) => {
    if (!session.audioUri) return;
    
    try {
      if (playbackObject && playingSessionId === session.id) {
        const status = await playbackObject.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await playbackObject.pauseAsync();
          } else {
            await playbackObject.playAsync();
          }
          return;
        }
      }
      
      if (playbackObject) {
        await playbackObject.unloadAsync();
      }
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: session.audioUri },
        { shouldPlay: true }
      );
      
      setPlaybackObject(sound);
      setPlayingSessionId(session.id);
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingSessionId(null);
        }
      });
    } catch (error) {
      console.error("Error playing recording:", error);
    }
  };

  const handleEditSession = (session: SessionData) => {
    setSelectedSession(session);
    setEditName(session.name || "");
    setEditTags(session.tags?.join(", ") || "");
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!selectedSession) return;
    
    if (editName.trim()) {
      updateSessionName(selectedSession.id, editName.trim());
    }
    
    if (editTags.trim()) {
      const tags = editTags.split(",").map(tag => tag.trim()).filter(tag => tag);
      addTagsToSession(selectedSession.id, tags);
    }
    
    setShowEditModal(false);
    setSelectedSession(null);
    setEditName("");
    setEditTags("");
  };

  const handleDeleteSession = (session: SessionData) => {
    Alert.alert(
      "Delete Recording",
      `Are you sure you want to delete "${session.name || 'this recording'}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteSession(session.id),
        },
      ]
    );
  };

  const renderSessionActions = (session: SessionData) => (
    <View style={styles.sessionActions}>
      {session.audioUri && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handlePlayRecording(session)}
        >
          {playingSessionId === session.id ? (
            <Pause size={16} color={Colors.light.primary} />
          ) : (
            <Play size={16} color={Colors.light.primary} />
          )}
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleEditSession(session)}
      >
        <Edit3 size={16} color={Colors.light.secondary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleDeleteSession(session)}
      >
        <Trash2 size={16} color={Colors.light.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Speaking Journal</Text>
        <Text style={styles.subtitle}>
          Track your progress and manage your recordings.
        </Text>
      </View>
      
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.light.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recordings..."
            placeholderTextColor={Colors.light.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filterBy === "all" && styles.filterButtonActive]}
            onPress={() => setFilterBy("all")}
          >
            <Text style={[styles.filterText, filterBy === "all" && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterBy === "recent" && styles.filterButtonActive]}
            onPress={() => setFilterBy("recent")}
          >
            <Text style={[styles.filterText, filterBy === "recent" && styles.filterTextActive]}>Recent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterBy === "favorites" && styles.filterButtonActive]}
            onPress={() => setFilterBy("favorites")}
          >
            <Text style={[styles.filterText, filterBy === "favorites" && styles.filterTextActive]}>Favorites</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {sessions.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateIconContainer}>
            <Calendar size={48} color={Colors.light.primary} />
          </View>
          <Text style={styles.emptyStateTitle}>No sessions yet</Text>
          <Text style={styles.emptyStateText}>
            Start recording your first speech to begin tracking your progress.
          </Text>
        </View>
      ) : filteredSessions.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>No matching recordings</Text>
          <Text style={styles.emptyStateText}>
            Try adjusting your search or filter criteria.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{sessions.length}</Text>
              <Text style={styles.statLabel}>Total Sessions</Text>
            </Card>
            
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>
                {Math.round(sessions.reduce((acc, session) => acc + session.duration, 0) / 60)}
              </Text>
              <Text style={styles.statLabel}>Minutes Practiced</Text>
            </Card>
            
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>
                {Math.round(
                  sessions.reduce((acc, session) => acc + session.analysis.confidence, 0) / sessions.length * 100
                )}
              </Text>
              <Text style={styles.statLabel}>Avg. Confidence</Text>
            </Card>
          </View>
          
          {sortedDates.map(date => (
            <View key={date} style={styles.dateSection}>
              <View style={styles.dateSectionHeader}>
                <Text style={styles.dateTitle}>{formatDate(date)}</Text>
                <Text style={styles.sessionCount}>
                  {groupedSessions[date].length} session{groupedSessions[date].length !== 1 ? 's' : ''}
                </Text>
              </View>
              
              {groupedSessions[date].map(session => (
                <View key={session.id} style={styles.sessionContainer}>
                  <SessionCard session={session} />
                  {renderSessionActions(session)}
                </View>
              ))}
            </View>
          ))}
        </>
      )}
      
      {/* Edit Session Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Recording</Text>
            <TouchableOpacity onPress={handleSaveEdit}>
              <Check size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Recording Name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter recording name"
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tags (comma separated)</Text>
              <TextInput
                style={styles.textInput}
                value={editTags}
                onChangeText={setEditTags}
                placeholder="favorite, presentation, practice"
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>
            
            {selectedSession && (
              <View style={styles.sessionPreview}>
                <Text style={styles.inputLabel}>Session Info</Text>
                <Text style={styles.sessionInfo}>Duration: {Math.round(selectedSession.duration / 60)} minutes</Text>
                <Text style={styles.sessionInfo}>Date: {formatDate(selectedSession.date)}</Text>
                <Text style={styles.sessionInfo}>Confidence: {Math.round(selectedSession.analysis.confidence * 100)}%</Text>
              </View>
            )}
          </View>
          
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={() => setShowEditModal(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Save Changes"
              onPress={handleSaveEdit}
              variant="primary"
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.textSecondary,
  },
  filterTextActive: {
    color: "white",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginTop: 64,
  },
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  dateSection: {
    marginBottom: 24,
  },
  dateSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  sessionCount: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  sessionContainer: {
    position: "relative",
    marginBottom: 12,
  },
  sessionActions: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
    backgroundColor: Colors.light.surface + "F0",
    borderRadius: 8,
    padding: 4,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.surface,
  },
  sessionPreview: {
    backgroundColor: Colors.light.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sessionInfo: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  modalButton: {
    flex: 1,
  },
});
