import React from "react";
import { StyleSheet, Platform, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

function KeyboardRoot({ children }: { children: React.ReactNode }) {
  if (Platform.OS === "ios") {
    return <KeyboardProvider>{children}</KeyboardProvider>;
  }
  return <>{children}</>;
}

import MainTabNavigator from "@/navigation/MainTabNavigator";
import AuthNavigator from "@/navigation/AuthNavigator";
import PaywallScreen from "@/screens/PaywallScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider, useThemeContext } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { InspectionProvider } from "@/contexts/InspectionContext";
import { ITMProvider } from "@/contexts/ITMContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function AppContent() {
  const { isDark, fullTheme } = useThemeContext();
  const { user, isLoading, isConfigured } = useAuth();

  if (isLoading) {
    return (
      <View style={[styles.splash, { backgroundColor: fullTheme.colors.background }]}>
        <ActivityIndicator size="large" color={fullTheme.colors.primary} />
      </View>
    );
  }

  // If Supabase is configured and no user is logged in, show auth gate
  const showAuthGate = isConfigured && !user;

  return (
    <>
      <NavigationContainer>
        {showAuthGate ? <AuthNavigator /> : <MainTabNavigator />}
      </NavigationContainer>
      {!showAuthGate && <PaywallScreen />}
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.root}>
          <KeyboardRoot>
            <ThemeProvider>
              <LanguageProvider>
                <AuthProvider>
                  <SubscriptionProvider>
                    <InspectionProvider>
                      <ITMProvider>
                        <AppContent />
                      </ITMProvider>
                    </InspectionProvider>
                  </SubscriptionProvider>
                </AuthProvider>
              </LanguageProvider>
            </ThemeProvider>
          </KeyboardRoot>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
