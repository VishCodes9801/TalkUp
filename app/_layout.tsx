import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, ActivityIndicator } from "react-native";

import { SpeechContext } from "@/hooks/use-speech-store";
import { GuidesContext } from "@/hooks/use-guides-store";
import { AuthContext, useAuth } from "@/hooks/use-auth-store";
import AuthScreen from "./auth";
import Colors from "@/constants/colors";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="analysis/[id]" options={{ headerShown: true }} />
      <Stack.Screen name="guide/[id]" options={{ headerShown: true }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
    </Stack>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.light.background }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <RootLayoutNav />;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthContext>
          <SpeechContext>
            <GuidesContext>
              <AppContent />
            </GuidesContext>
          </SpeechContext>
        </AuthContext>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
