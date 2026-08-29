import React from "react";
import { StyleSheet, Platform, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

// KeyboardProvider precisa envolver o app em TODAS as plataformas nativas.
// No Android sem o provider, o KeyboardAwareScrollView não recebe a altura do
// teclado e a tela de login fica coberta ao digitar. Na web não há teclado
// virtual, então evitamos o provider (que depende de APIs nativas).
function KeyboardRoot({ children }: { children: React.ReactNode }) {
  if (Platform.OS === "web") {
    return <>{children}</>;
  }
  return <KeyboardProvider>{children}</KeyboardProvider>;
}

import MainTabNavigator from "@/navigation/MainTabNavigator";
import AuthNavigator from "@/navigation/AuthNavigator";
import AccessKeyScreen from "@/screens/AccessKeyScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider, useThemeContext } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { InspectionProvider } from "@/contexts/InspectionContext";
import { ITMProvider } from "@/contexts/ITMContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { ensureInstrumentFonts } from "@/utils/fonts";

// Injeta as fontes do padrao Instrument no web (Archivo + IBM Plex Mono).
ensureInstrumentFonts();

function AppContent() {
  const { isDark, fullTheme } = useThemeContext();
  const { user, isLoading, isConfigured, isPasswordRecovery } = useAuth();

  if (isLoading) {
    return (
      <View style={[styles.splash, { backgroundColor: fullTheme.colors.background }]}>
        <ActivityIndicator size="large" color={fullTheme.colors.primary} />
      </View>
    );
  }

  // Auth gate: obrigatória por padrão quando Supabase está configurado.
  // Desative com EXPO_PUBLIC_AUTH_REQUIRED="0" (ex: testes E2E em guest mode).
  const authDisabled = process.env.EXPO_PUBLIC_AUTH_REQUIRED === "0";
  // isPasswordRecovery: usuário chegou via link de recuperação de senha.
  // Forçamos o auth gate mesmo com sessão ativa para mostrar o form de nova senha.
  const showAuthGate = (!authDisabled && isConfigured && !user) || isPasswordRecovery;

  return (
    <>
      <NavigationContainer>
        {showAuthGate ? <AuthNavigator /> : <MainTabNavigator />}
      </NavigationContainer>
      {!showAuthGate && <AccessKeyScreen />}
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
                    <CompanyProvider>
                      <InspectionProvider>
                        <ITMProvider>
                          <AppContent />
                        </ITMProvider>
                      </InspectionProvider>
                    </CompanyProvider>
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
