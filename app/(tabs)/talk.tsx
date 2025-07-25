import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, ScrollView, Platform, Alert, TextInput, Modal, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import { Mic, Square, Loader, Play, Pause, Save, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "@/constants/colors";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { useSpeech } from "@/hooks/use-speech-store";
import { SessionData } from "@/types/speech";

export default function TalkScreen() {
  const router = useRouter();
  const { analyzeSpeech, saveSession, setCurrentSession } = useSpeech();
  
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [currentAudioUri, setCurrentAudioUri] = useState<string | null>(null);
  const [playbackObject, setPlaybackObject] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const waveformIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
      }
      if (playbackObject) {
        playbackObject.unloadAsync();
      }
    };
  }, [playbackObject]);
  
  const startTimer = () => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setRecordingDuration(elapsedSeconds);
    }, 1000);
  };

  const startWaveformAnimation = () => {
    waveformIntervalRef.current = setInterval(() => {
      const newData = Array.from({ length: 20 }, () => Math.random() * 100);
      setWaveformData(newData);
    }, 100);
  };
  
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopWaveformAnimation = () => {
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current);
      waveformIntervalRef.current = null;
    }
    setWaveformData([]);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      if (permissionResponse?.status !== "granted") {
        console.log("Requesting permission..");
        const permission = await requestPermission();
        if (!permission.granted) {
          Alert.alert(
            "Permission Required",
            "Please grant microphone permission to record audio.",
            [{ text: "OK" }]
          );
          return;
        }
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      console.log("Starting recording..");
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };
      
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      
      setRecording(recording);
      setIsRecording(true);
      startTimer();
      startWaveformAnimation();
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert(
        "Recording Error",
        "Failed to start recording. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const stopRecording = async () => {
    console.log("Stopping recording..");
    if (!recording) return;
    
    setIsRecording(false);
    stopTimer();
    stopWaveformAnimation();
    
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      const uri = recording.getURI();
      console.log("Recording stopped and stored at", uri);
      setCurrentAudioUri(uri);
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setIsTranscribing(true);
      
      // Send audio to speech-to-text API
      if (uri) {
        await transcribeAudio(uri);
      } else {
        setIsTranscribing(false);
        Alert.alert(
          'Recording Error',
          'Failed to get recording URI. Please try again.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error("Error stopping recording:", error);
      setIsTranscribing(false);
      Alert.alert(
        "Recording Error",
        "Failed to stop recording. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const transcribeAudio = async (audioUri: string) => {
    try {
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        // For web, we need to handle the blob differently
        const response = await fetch(audioUri);
        const blob = await response.blob();
        formData.append('audio', blob, 'recording.webm');
      } else {
        // For mobile platforms
        const uriParts = audioUri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        const audioFile = {
          uri: audioUri,
          name: "recording." + fileType,
          type: "audio/" + fileType
        } as any;
        
        formData.append('audio', audioFile);
      }
      
      const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setTranscript(result.text || 'No transcript available');
      setIsTranscribing(false);
      setShowSaveModal(true);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setIsTranscribing(false);
      Alert.alert(
        'Transcription Error',
        'Failed to transcribe your recording. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const processTranscript = async (text: string, name?: string) => {
    try {
      // Analyze the transcript using AI
      const analysis = await analyzeSpeech(text, recordingDuration);
      
      // Create a new session
      const newSession: SessionData = {
        id: Date.now().toString(),
        name: name || `Recording ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString(),
        duration: recordingDuration,
        transcript: text,
        analysis,
        audioUri: currentAudioUri || undefined,
      };
      
      // Save the session
      saveSession(newSession);
      setCurrentSession(newSession);
      
      // Reset state
      setShowSaveModal(false);
      setSessionName("");
      setCurrentAudioUri(null);
      setRecordingDuration(0);
      
      // Navigate to the analysis screen
      router.push(`/analysis/${newSession.id}`);
    } catch (error) {
      console.error("Error processing transcript:", error);
      Alert.alert(
        "Processing Error",
        "Failed to process your recording. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const playRecording = async () => {
    if (!currentAudioUri) return;
    
    try {
      if (playbackObject) {
        const status = await playbackObject.getStatusAsync();
        if (status.isLoaded) {
          if (isPlaying) {
            await playbackObject.pauseAsync();
            setIsPlaying(false);
          } else {
            await playbackObject.playAsync();
            setIsPlaying(true);
          }
          return;
        }
      }
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: currentAudioUri },
        { shouldPlay: true }
      );
      
      setPlaybackObject(sound);
      setIsPlaying(true);
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error("Error playing recording:", error);
    }
  };

  const discardRecording = () => {
    Alert.alert(
      "Discard Recording",
      "Are you sure you want to discard this recording?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            setShowSaveModal(false);
            setSessionName("");
            setCurrentAudioUri(null);
            setRecordingDuration(0);
            setTranscript("");
            if (playbackObject) {
              playbackObject.unloadAsync();
              setPlaybackObject(null);
            }
          },
        },
      ]
    );
  };

  const saveRecording = () => {
    if (!sessionName.trim()) {
      Alert.alert("Name Required", "Please enter a name for your recording.");
      return;
    }
    processTranscript(transcript, sessionName.trim());
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Record Your Speech</Text>
        <Text style={styles.subtitle}>
          Speak clearly into your microphone. TalkUp will analyze your speech patterns and provide feedback.
        </Text>
      </View>
      
      <Card style={styles.recordingCard}>
        <LinearGradient
          colors={isRecording ? [Colors.light.error + '20', Colors.light.error + '10'] : [Colors.light.primary + '20', Colors.light.primary + '10']}
          style={styles.gradientBackground}
        >
          <View style={styles.recordingVisual}>
            {isRecording ? (
              <View style={styles.recordingIndicator}>
                <View style={[styles.recordingDot, { backgroundColor: Colors.light.error }]} />
                <Text style={styles.recordingText}>Recording</Text>
                
                {/* Animated Waveform */}
                <View style={styles.waveformContainer}>
                  {waveformData.map((height, index) => (
                    <View
                      key={index}
                      style={[
                        styles.waveformBar,
                        {
                          height: Math.max(4, height * 0.6),
                          backgroundColor: Colors.light.error,
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.micContainer}>
                <View style={styles.micIconWrapper}>
                  <Mic size={48} color={Colors.light.primary} />
                </View>
              </View>
            )}
          </View>
          
          {isRecording && (
            <Text style={styles.timerText}>{formatTime(recordingDuration)}</Text>
          )}
          
          <View style={styles.buttonContainer}>
            {isRecording ? (
              <TouchableOpacity
                style={[styles.recordButton, styles.stopButton]}
                onPress={stopRecording}
                disabled={isTranscribing}
              >
                <Square size={24} color="white" fill="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.recordButton, styles.startButton]}
                onPress={startRecording}
                disabled={isTranscribing}
              >
                <Mic size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </Card>
      
      {isTranscribing && (
        <View style={styles.transcribingContainer}>
          <Loader size={24} color={Colors.light.primary} />
          <Text style={styles.transcribingText}>Transcribing your speech...</Text>
        </View>
      )}
      
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Tips for Better Results:</Text>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>1.</Text>
          <Text style={styles.tipText}>Speak clearly and at a moderate pace</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>2.</Text>
          <Text style={styles.tipText}>Find a quiet environment with minimal background noise</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>3.</Text>
          <Text style={styles.tipText}>Hold your device about 6-12 inches from your mouth</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>4.</Text>
          <Text style={styles.tipText}>Practice with guided prompts from the Guides tab</Text>
        </View>
      </View>

      {/* Save Recording Modal */}
      <Modal
        visible={showSaveModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={discardRecording}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Save Recording</Text>
            <TouchableOpacity onPress={saveRecording}>
              <Save size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Card style={styles.playbackCard}>
              <View style={styles.playbackHeader}>
                <Text style={styles.playbackDuration}>{formatTime(recordingDuration)}</Text>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={playRecording}
                  disabled={!currentAudioUri}
                >
                  {isPlaying ? (
                    <Pause size={20} color={Colors.light.primary} />
                  ) : (
                    <Play size={20} color={Colors.light.primary} />
                  )}
                </TouchableOpacity>
              </View>
              
              <View style={styles.waveformPreview}>
                {Array.from({ length: 40 }, (_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveformPreviewBar,
                      { height: Math.random() * 30 + 10 },
                    ]}
                  />
                ))}
              </View>
            </Card>
            
            <View style={styles.nameInputContainer}>
              <Text style={styles.inputLabel}>Recording Name</Text>
              <TextInput
                style={styles.nameInput}
                value={sessionName}
                onChangeText={setSessionName}
                placeholder="Enter a name for this recording"
                placeholderTextColor={Colors.light.textSecondary}
                autoFocus
              />
            </View>
            
            <View style={styles.transcriptContainer}>
              <Text style={styles.inputLabel}>Transcript Preview</Text>
              <Text style={styles.transcriptPreview}>{transcript}</Text>
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <Button
              title="Discard"
              onPress={discardRecording}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Save & Analyze"
              onPress={saveRecording}
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
  recordingCard: {
    padding: 0,
    overflow: "hidden",
  },
  gradientBackground: {
    padding: 32,
    alignItems: "center",
    borderRadius: 16,
  },
  recordingVisual: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  micContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  micIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordingIndicator: {
    alignItems: "center",
    justifyContent: "center",
  },
  recordingDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.error,
    marginBottom: 20,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    width: 200,
  },
  waveformBar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  timerText: {
    fontSize: 48,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 32,
    fontVariant: ["tabular-nums"],
  },
  buttonContainer: {
    alignItems: "center",
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButton: {
    backgroundColor: Colors.light.primary,
  },
  stopButton: {
    backgroundColor: Colors.light.error,
  },
  transcribingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.light.primary + "10",
    borderRadius: 8,
  },
  transcribingText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: "500",
    marginLeft: 8,
  },
  tipsContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
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
  playbackCard: {
    padding: 16,
    marginBottom: 24,
  },
  playbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  playbackDuration: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  waveformPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
  },
  waveformPreviewBar: {
    width: 2,
    backgroundColor: Colors.light.primary + "60",
    marginHorizontal: 1,
    borderRadius: 1,
  },
  nameInputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.surface,
  },
  transcriptContainer: {
    marginBottom: 24,
  },
  transcriptPreview: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    backgroundColor: Colors.light.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
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
