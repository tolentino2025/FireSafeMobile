import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { BorderRadius, Spacing } from "@/constants/theme";

export default function LoginScreen() {
  const { fullTheme } = useTheme();
  const { signIn, signUp, isConfigured } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // If Supabase is not configured, show unconfigured state with local mode button
  // The parent (AppContent) will handle navigation once user/session changes,
  // but we expose a "continue without account" path via isConfigured guard in AppContent.
  // This screen is only rendered when isConfigured === true.

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Informe o e-mail.");
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setErrorMessage("Informe o nome completo.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result =
        mode === "login"
          ? await signIn(email.trim(), password)
          : await signUp(email.trim(), password, name.trim());

      if (result.error) {
        setErrorMessage(result.error);
      }
      // On success, AuthContext state change triggers AppContent re-render
      // which swaps AuthNavigator out for MainTabNavigator automatically.
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setErrorMessage(null);
    setEmail("");
    setPassword("");
    setName("");
  };

  // Not-configured fallback (should not normally reach here since AppContent
  // bypasses AuthNavigator when !isConfigured, but guard just in case)
  if (!isConfigured) {
    return (
      <ThemedView style={styles.unconfiguredContainer}>
        <View style={[styles.iconContainer, { backgroundColor: `${fullTheme.colors.primary}15` }]}>
          <Feather name="wifi-off" size={40} color={fullTheme.colors.primary} />
        </View>
        <ThemedText type="h3" style={styles.unconfiguredTitle}>
          Autenticação não configurada
        </ThemedText>
        <ThemedText type="body" secondary style={styles.unconfiguredSubtitle}>
          Usando modo local — os dados são armazenados somente neste dispositivo.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Header */}
          <View style={styles.header}>
            <View style={[styles.logo, { backgroundColor: fullTheme.colors.primary }]}>
              <Feather name="shield" size={40} color="#FFFFFF" />
            </View>
            <ThemedText type="h2" style={styles.appName}>
              FireSafe ITM
            </ThemedText>
            <ThemedText type="body" secondary style={styles.tagline}>
              {mode === "login" ? "Entrar na sua conta" : "Criar nova conta"}
            </ThemedText>
          </View>

          {/* Form Card */}
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: fullTheme.colors.cardBackground,
                borderColor: fullTheme.colors.border,
              },
            ]}
          >
            {/* Name field — register only */}
            {mode === "register" ? (
              <View style={styles.fieldGroup}>
                <ThemedText type="small" secondary style={styles.fieldLabel}>
                  Nome completo
                </ThemedText>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: fullTheme.colors.inputBackground,
                      borderColor: fullTheme.colors.border,
                    },
                  ]}
                >
                  <Feather
                    name="user"
                    size={18}
                    color={fullTheme.colors.placeholder}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: fullTheme.colors.textPrimary }]}
                    placeholder="Seu nome completo"
                    placeholderTextColor={fullTheme.colors.placeholder}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>
              </View>
            ) : null}

            {/* Email field */}
            <View style={styles.fieldGroup}>
              <ThemedText type="small" secondary style={styles.fieldLabel}>
                E-mail
              </ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: fullTheme.colors.inputBackground,
                    borderColor: fullTheme.colors.border,
                  },
                ]}
              >
                <Feather
                  name="mail"
                  size={18}
                  color={fullTheme.colors.placeholder}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: fullTheme.colors.textPrimary }]}
                  placeholder="seu@email.com"
                  placeholderTextColor={fullTheme.colors.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password field */}
            <View style={styles.fieldGroup}>
              <ThemedText type="small" secondary style={styles.fieldLabel}>
                Senha
              </ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: fullTheme.colors.inputBackground,
                    borderColor: fullTheme.colors.border,
                  },
                ]}
              >
                <Feather
                  name="lock"
                  size={18}
                  color={fullTheme.colors.placeholder}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: fullTheme.colors.textPrimary }]}
                  placeholder={mode === "register" ? "Mínimo 6 caracteres" : "Sua senha"}
                  placeholderTextColor={fullTheme.colors.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={8}
                  style={styles.eyeButton}
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={18}
                    color={fullTheme.colors.placeholder}
                  />
                </Pressable>
              </View>
            </View>

            {/* Error message */}
            {errorMessage ? (
              <View
                style={[
                  styles.errorBox,
                  {
                    backgroundColor: `${fullTheme.colors.error}15`,
                    borderColor: fullTheme.colors.error,
                  },
                ]}
              >
                <Feather name="alert-circle" size={16} color={fullTheme.colors.error} />
                <ThemedText
                  type="small"
                  style={[styles.errorText, { color: fullTheme.colors.error }]}
                >
                  {errorMessage}
                </ThemedText>
              </View>
            ) : null}

            {/* Submit button */}
            <Button
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={styles.submitButton}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : mode === "login" ? (
                "Entrar"
              ) : (
                "Criar conta"
              )}
            </Button>
          </View>

          {/* Toggle mode */}
          <View style={styles.toggleRow}>
            <ThemedText type="small" secondary>
              {mode === "login" ? "Não tem conta? " : "Já tem conta? "}
            </ThemedText>
            <Pressable onPress={toggleMode} hitSlop={8}>
              <ThemedText type="small" style={{ color: fullTheme.colors.primary, fontWeight: "600" }}>
                {mode === "login" ? "Criar conta" : "Entrar"}
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing["4xl"],
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  appName: {
    marginBottom: Spacing.xs,
  },
  tagline: {
    textAlign: "center",
  },
  formCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  fieldGroup: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: "100%",
  },
  eyeButton: {
    padding: Spacing.xs,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
  },
  submitButton: {
    marginTop: Spacing.xs,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  unconfiguredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  unconfiguredTitle: {
    textAlign: "center",
  },
  unconfiguredSubtitle: {
    textAlign: "center",
    lineHeight: 22,
  },
});
