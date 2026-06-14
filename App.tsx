import React from "react";
import { StyleSheet, Platform } from "react-native";
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
import PaywallScreen from "@/screens/PaywallScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider, useThemeContext } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { InspectionProvider } from "@/contexts/InspectionContext";
import { ITMProvider } from "@/contexts/ITMContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

function AppContent() {
  const { isDark } = useThemeContext();

  return (
    <>
      <NavigationContainer>
        <MainTabNavigator />
      </NavigationContainer>
      <PaywallScreen />
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
                <SubscriptionProvider>
                  <InspectionProvider>
                    <ITMProvider>
                      <AppContent />
                    </ITMProvider>
                  </InspectionProvider>
                </SubscriptionProvider>
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
});
