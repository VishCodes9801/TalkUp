import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react-native";

import Colors from "@/constants/colors";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { useAuth } from "@/hooks/use-auth-store";

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (isSignUp && !formData.name) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    // Basic validation
    if (!formData.email.includes('@')) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      console.log(`Attempting to ${isSignUp ? 'sign up' : 'sign in'} with email:`, formData.email);
      
      if (isSignUp) {
        await signUp(formData.email, formData.password, formData.name);
        Alert.alert("Success", "Account created successfully! You can now sign in.");
        setIsSignUp(false);
        setFormData({ email: formData.email, password: "", name: "" });
      } else {
        await signIn(formData.email, formData.password);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const errorMessage = error?.message || "Authentication failed. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ email: "", password: "", name: "" });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>TalkUp</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? "Create your account" : "Welcome back"}
          </Text>
        </View>

        <Card style={styles.formCard}>
          {isSignUp && (
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <User size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  autoCapitalize="words"
                  testID="name-input"
                />
              </View>
            </View>
          )}

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Mail size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                testID="email-input"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Lock size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                testID="password-input"
              />
              <Button
                onPress={() => setShowPassword(!showPassword)}
                variant="ghost"
                size="small"
                style={styles.eyeButton}
                testID="toggle-password-visibility"
              >
                {showPassword ? (
                  <EyeOff size={20} color={Colors.light.textSecondary} />
                ) : (
                  <Eye size={20} color={Colors.light.textSecondary} />
                )}
              </Button>
            </View>
          </View>

          <Button
            title={isSignUp ? "Sign Up" : "Sign In"}
            onPress={handleSubmit}
            variant="primary"
            size="large"
            style={styles.submitButton}
            loading={isLoading}
            testID="submit-button"
          />

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isSignUp ? "Already have an account?" : "Don&apos;t have an account?"}
            </Text>
            <Button
              title={isSignUp ? "Sign In" : "Sign Up"}
              onPress={toggleMode}
              variant="ghost"
              size="small"
              testID="switch-mode-button"
            />
          </View>

          {!isSignUp && (
            <View style={styles.testAccountContainer}>
              <Text style={styles.testAccountText}>For testing:</Text>
              <Button
                title="Create Test Account"
                onPress={async () => {
                  setFormData({
                    email: "test@example.com",
                    password: "password123",
                    name: "Test User"
                  });
                  setIsSignUp(true);
                }}
                variant="ghost"
                size="small"
                testID="create-test-account"
              />
            </View>
          )}
        </Card>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What you&apos;ll get:</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>AI-powered speech analysis</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>Personalized feedback and tips</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>Progress tracking over time</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>Guided practice sessions</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.light.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  formCard: {
    padding: 24,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  eyeButton: {
    padding: 4,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  switchText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginRight: 8,
  },
  featuresContainer: {
    padding: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 16,
    textAlign: "center",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureBullet: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.primary,
    marginRight: 12,
    width: 16,
  },
  featureText: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  testAccountContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 8,
    alignItems: "center",
  },
  testAccountText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
});
