import React, { useState, useEffect } from "react";
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
import { useNavigation } from "@react-navigation/native";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { BorderRadius, Spacing } from "@/constants/theme";

export default function LoginScreen() {
  const { fullTheme } = useTheme();
  const { t } = useLanguage();
  const { signIn, signUp, resetPassword, updatePassword, isConfigured, isPasswordRecovery } = useAuth();
  const navigation = useNavigation<{ canGoBack: () => boolean; goBack: () => void }>();

  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Quando o SDK detecta o link de recuperação, muda para o modo de redefinição.
  useEffect(() => {
    if (isPasswordRecovery) {
      setMode("reset");
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isPasswordRecovery]);

  // If Supabase is not configured, show unconfigured state with local mode button
  // The parent (AppContent) will handle navigation once user/session changes,
  // but we expose a "continue without account" path via isConfigured guard in AppContent.
  // This screen is only rendered when isConfigured === true.

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === "forgot") {
      if (!email.trim()) {
        setErrorMessage("Informe o e-mail para redefinir a senha.");
        return;
      }
      setIsSubmitting(true);
      try {
        const result = await resetPassword(email.trim());
        if (result.error) {
          setErrorMessage(result.error);
        } else {
          setSuccessMessage("E-mail de redefinição enviado. Verifique sua caixa de entrada.");
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (mode === "reset") {
      if (!newPassword || newPassword.length < 6) {
        setErrorMessage("A nova senha deve ter pelo menos 6 caracteres.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage("As senhas não coincidem.");
        return;
      }
      setIsSubmitting(true);
      try {
        const result = await updatePassword(newPassword);
        if (result.error) {
          setErrorMessage(result.error);
        } else {
          setSuccessMessage("Senha atualizada com sucesso! Você já está conectado.");
          setNewPassword("");
          setConfirmPassword("");
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!email.trim()) {
      setErrorMessage(t.login.emailRequired);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage(t.login.emailInvalid);
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMessage(t.login.passwordTooShort);
      return;
    }
    if (mode === "register" && !name.trim()) {
      setErrorMessage(t.login.nameRequired);
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
      } else if (mode === "register") {
        setSuccessMessage(t.login.registerSuccess);
        setErrorMessage(null);
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      } else if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (next: "login" | "register" | "forgot" | "reset") => {
    setMode(next);
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword("");
    setName("");
    setNewPassword("");
    setConfirmPassword("");
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
              {mode === "login"
                ? "Entrar na sua conta"
                : mode === "register"
                  ? "Criar nova conta"
                  : mode === "reset"
                    ? "Criar nova senha"
                    : "Redefinir senha"}
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

            {/* Email field — hidden in reset mode (user identified via recovery token) */}
            {mode !== "reset" ? <View style={styles.fieldGroup}>
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
            </View> : null}

            {/* New password fields — reset mode only */}
            {mode === "reset" ? (
              <>
                <View style={styles.fieldGroup}>
                  <ThemedText type="small" secondary style={styles.fieldLabel}>
                    Nova senha
                  </ThemedText>
                  <View
                    style={[
                      styles.inputWrapper,
                      { backgroundColor: fullTheme.colors.inputBackground, borderColor: fullTheme.colors.border },
                    ]}
                  >
                    <Feather name="lock" size={18} color={fullTheme.colors.placeholder} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: fullTheme.colors.textPrimary }]}
                      placeholder="Mínimo 6 caracteres"
                      placeholderTextColor={fullTheme.colors.placeholder}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                    <Pressable onPress={() => setShowNewPassword((p) => !p)} hitSlop={8} style={styles.eyeButton}>
                      <Feather name={showNewPassword ? "eye-off" : "eye"} size={18} color={fullTheme.colors.placeholder} />
                    </Pressable>
                  </View>
                </View>
                <View style={styles.fieldGroup}>
                  <ThemedText type="small" secondary style={styles.fieldLabel}>
                    Confirmar nova senha
                  </ThemedText>
                  <View
                    style={[
                      styles.inputWrapper,
                      { backgroundColor: fullTheme.colors.inputBackground, borderColor: fullTheme.colors.border },
                    ]}
                  >
                    <Feather name="lock" size={18} color={fullTheme.colors.placeholder} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: fullTheme.colors.textPrimary }]}
                      placeholder="Repita a nova senha"
                      placeholderTextColor={fullTheme.colors.placeholder}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit}
                    />
                  </View>
                </View>
              </>
            ) : null}

            {/* Password field — login and register only */}
            {mode !== "forgot" && mode !== "reset" ? (
              <View style={styles.fieldGroup}>
                <View style={styles.passwordLabelRow}>
                  <ThemedText type="small" secondary style={styles.fieldLabel}>
                    Senha
                  </ThemedText>
                  {mode === "login" ? (
                    <Pressable onPress={() => switchMode("forgot")} hitSlop={8}>
                      <ThemedText type="small" style={{ color: fullTheme.colors.primary }}>
                        Esqueci minha senha
                      </ThemedText>
                    </Pressable>
                  ) : null}
                </View>

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
            ) : null}

            {/* Success message */}
            {successMessage ? (
              <View
                style={[
                  styles.successBox,
                  {
                    backgroundColor: `${fullTheme.colors.success}15`,
                    borderColor: fullTheme.colors.success,
                  },
                ]}
              >
                <Feather name="check-circle" size={16} color={fullTheme.colors.success} />
                <ThemedText
                  type="small"
                  style={[styles.errorText, { color: fullTheme.colors.success }]}
                >
                  {successMessage}
                </ThemedText>
              </View>
            ) : null}

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
            <Pressable
              onPress={isSubmitting ? undefined : handleSubmit}
              disabled={isSubmitting}
              style={[
                styles.submitButton,
                { backgroundColor: isSubmitting ? "#9CA3AF" : fullTheme.colors.primary },
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <ThemedText style={styles.submitButtonText}>
                  {mode === "login"
                    ? "Entrar"
                    : mode === "register"
                      ? "Criar conta"
                      : mode === "reset"
                        ? "Salvar nova senha"
                        : "Enviar e-mail de redefinição"}
                </ThemedText>
              )}
            </Pressable>
          </View>

          {/* Links de navegação entre modos */}
          {mode === "login" ? (
            <View style={styles.toggleRow}>
              <ThemedText type="small" secondary>Não tem conta? </ThemedText>
              <Pressable onPress={() => switchMode("register")} hitSlop={8}>
                <ThemedText type="small" style={{ color: fullTheme.colors.primary, fontWeight: "600" }}>
                  Criar conta
                </ThemedText>
              </Pressable>
            </View>
          ) : mode === "reset" ? null : (
            <View style={styles.toggleRow}>
              <Pressable onPress={() => switchMode("login")} hitSlop={8}>
                <ThemedText type="small" style={{ color: fullTheme.colors.primary, fontWeight: "600" }}>
                  ← Voltar para o login
                </ThemedText>
              </Pressable>
            </View>
          )}
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
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
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
    height: 52,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
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
