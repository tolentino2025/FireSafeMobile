import React from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import LicenseScreen from "@/screens/LicenseScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider, useThemeContext } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { InspectionProvider } from "@/contexts/InspectionContext";
import { LicenseProvider, useLicense } from "@/contexts/LicenseContext";
import { Colors } from "@/constants/theme";

function LicenseGate({ children }: { children: React.ReactNode }) {
  const { licenseData, licenseStatus, isLoading } = useLicense();
  const { isDark } = useThemeContext();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? Colors.dark.backgroundRoot : Colors.light.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!licenseData || !licenseStatus) {
    return <LicenseScreen isExpired={false} />;
  }

  if (licenseStatus.isExpired) {
    return <LicenseScreen isExpired={true} expirationDate={licenseStatus.expirationDate || undefined} />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { isDark } = useThemeContext();
  
  return (
    <>
      <LicenseGate>
        <NavigationContainer>
          <MainTabNavigator />
        </NavigationContainer>
      </LicenseGate>
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.root}>
          <KeyboardProvider>
            <ThemeProvider>
              <LanguageProvider>
                <LicenseProvider>
                  <InspectionProvider>
                    <AppContent />
                  </InspectionProvider>
                </LicenseProvider>
              </LanguageProvider>
            </ThemeProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
