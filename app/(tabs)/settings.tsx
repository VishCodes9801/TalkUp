import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Switch, Modal, TextInput } from "react-native";
import { User, Settings as SettingsIcon, LogOut, HelpCircle, Shield, Bell, Palette, Download, Edit3, Trash2, BarChart3, X, Check } from "lucide-react-native";

import Colors from "@/constants/colors";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useAuth } from "@/hooks/use-auth-store";
import { useSpeech } from "@/hooks/use-speech-store";

export default function SettingsScreen() {
  const { user, signOut, updateProfile } = useAuth();
  const { sessions } = useSpeech();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => signOut(),
        },
      ]
    );
  };

  const handleExportData = () => {
    if (sessions.length === 0) {
      Alert.alert("No Data", "You don't have any sessions to export yet.");
      return;
    }
    
    const exportData = {
      user: user,
      sessions: sessions,
      exportDate: new Date().toISOString(),
      totalSessions: sessions.length,
      totalPracticeTime: sessions.reduce((acc, s) => acc + s.duration, 0),
      averageConfidence: sessions.reduce((acc, s) => acc + s.analysis.confidence, 0) / sessions.length
    };
    
    Alert.alert(
      "Export Data",
      `Ready to export ${sessions.length} sessions. In a real app, this would download a JSON file with your data.`,
      [{ text: "OK" }]
    );
    
    console.log('Export data:', JSON.stringify(exportData, null, 2));
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your sessions and progress. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => {
            Alert.alert("Data Cleared", "All your data has been deleted.");
          },
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    
    try {
      await updateProfile({ name: editName.trim(), email: editEmail.trim() });
      setShowEditProfile(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleHelp = () => {
    Alert.alert(
      "Help & Support",
      "TalkUp Help:\n\n• Record your speech and get AI feedback\n• Track your progress over time\n• Practice with guided exercises\n• Export your data anytime\n\nFor support: support@talkup.app",
      [{ text: "OK" }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      "Privacy Policy",
      "Your Privacy Matters:\n\n• Recordings are processed securely\n• Data is stored locally on your device\n• AI analysis is done via secure APIs\n• We never share your personal data\n• You can export or delete your data anytime",
      [{ text: "OK" }]
    );
  };

  const SettingItem = ({ icon: Icon, title, subtitle, onPress, color = Colors.light.text, rightElement }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    color?: string;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={styles.settingItem}>
        <View style={styles.settingContent}>
          <View style={[styles.settingIcon, { backgroundColor: color + '20' }]}>
            <Icon size={20} color={color} />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
          </View>
          {rightElement && <View style={styles.settingRight}>{rightElement}</View>}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const getTotalPracticeTime = () => {
    return Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / 60);
  };

  const getAverageConfidence = () => {
    if (sessions.length === 0) return 0;
    return Math.round(sessions.reduce((acc, s) => acc + s.analysis.confidence, 0) / sessions.length * 100);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
      </View>

      {/* Profile Section */}
      <Card style={styles.profileCard}>
        <View style={styles.profileContent}>
          <View style={styles.profileIcon}>
            <User size={32} color={Colors.light.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
            <Text style={styles.profileStats}>
              {sessions.length} sessions • {getTotalPracticeTime()} minutes • {getAverageConfidence()}% avg confidence
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              setEditName(user?.name || '');
              setEditEmail(user?.email || '');
              setShowEditProfile(true);
            }}
          >
            <Edit3 size={16} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Settings Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <SettingItem
          icon={Bell}
          title="Practice Reminders"
          subtitle={notificationsEnabled ? "Daily reminders enabled" : "Reminders disabled"}
          color={Colors.light.primary}
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.light.border, true: Colors.light.primary + '40' }}
              thumbColor={notificationsEnabled ? Colors.light.primary : Colors.light.textSecondary}
            />
          }
        />
        
        <SettingItem
          icon={Palette}
          title="Appearance"
          subtitle="Light theme (Dark theme coming soon)"
          onPress={() => Alert.alert('Appearance', 'Dark theme and customization options coming in a future update!')}
          color={Colors.light.secondary}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Analytics</Text>
        
        <SettingItem
          icon={BarChart3}
          title="Progress Analytics"
          subtitle="View detailed progress insights"
          onPress={() => Alert.alert('Analytics', 'Detailed analytics dashboard coming soon!')}
          color={Colors.light.accent}
        />
        
        <SettingItem
          icon={Download}
          title="Export Data"
          subtitle={`Export ${sessions.length} sessions`}
          onPress={handleExportData}
          color={Colors.light.primary}
        />
        
        <SettingItem
          icon={Trash2}
          title="Clear All Data"
          subtitle="Permanently delete all sessions"
          onPress={handleClearAllData}
          color={Colors.light.error}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <SettingItem
          icon={HelpCircle}
          title="Help & Support"
          subtitle="Get help and contact support"
          onPress={handleHelp}
          color={Colors.light.primary}
        />
        
        <SettingItem
          icon={Shield}
          title="Privacy Policy"
          subtitle="Learn about your data privacy"
          onPress={handlePrivacy}
          color={Colors.light.secondary}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <SettingItem
          icon={LogOut}
          title="Sign Out"
          subtitle="Sign out of your account"
          onPress={handleSignOut}
          color={Colors.light.error}
        />
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditProfile(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Check size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Enter your email"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
          
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={() => setShowEditProfile(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Save Changes"
              onPress={handleSaveProfile}
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
  profileCard: {
    padding: 20,
    marginBottom: 24,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  profileStats: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: "500",
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    padding: 16,
    marginBottom: 8,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  settingRight: {
    marginLeft: 12,
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
