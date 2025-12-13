import React, { useState } from "react";
import { View, StyleSheet, TextInput, ActivityIndicator, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLicense } from "@/contexts/LicenseContext";
import { formatDate } from "@/utils/licenseUtils";
import { Spacing, BorderRadius } from "@/constants/theme";

interface LicenseActivationScreenProps {
  isExpired?: boolean;
  expirationDate?: string;
}

export default function LicenseScreen({ isExpired = false, expirationDate }: LicenseActivationScreenProps) {
  const { fullTheme } = useTheme();
  const { t, language } = useLanguage();
  const { activateLicense } = useLicense();
  const insets = useSafeAreaInsets();
  
  const [licenseKeyInput, setLicenseKeyInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatLicenseKeyInput = (text: string) => {
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const trimmed = cleaned.substring(0, 12);
    const parts = [];
    
    if (trimmed.length > 0) {
      parts.push(trimmed.substring(0, 4));
    }
    if (trimmed.length > 4) {
      parts.push(trimmed.substring(4, 8));
    }
    if (trimmed.length > 8) {
      parts.push(trimmed.substring(8, 12));
    }
    
    return parts.join("-");
  };

  const getFullLicenseKey = () => {
    const cleanedInput = licenseKeyInput.replace(/-/g, "");
    if (cleanedInput.length === 12) {
      return `FIRE-${cleanedInput.substring(0, 4)}-${cleanedInput.substring(4, 8)}-${cleanedInput.substring(8, 12)}`;
    }
    return "";
  };

  const handleKeyChange = (text: string) => {
    const formatted = formatLicenseKeyInput(text);
    setLicenseKeyInput(formatted);
    setError(null);
  };

  const handleActivate = async () => {
    const fullKey = getFullLicenseKey();
    if (!fullKey || licenseKeyInput.replace(/-/g, "").length < 12) {
      setError(t.license?.errors?.incompleteKey || "Please enter the complete license key");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await activateLicense(fullKey, language as "en" | "pt-BR");

    setIsLoading(false);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (result.error === "invalid_key") {
        setError(t.license?.errors?.invalidKey || "Invalid license key. Please check and try again.");
      } else {
        setError(t.license?.errors?.saveError || "Error saving license. Please try again.");
      }
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + Spacing["3xl"], paddingBottom: insets.bottom + Spacing.xl }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: isExpired ? fullTheme.colors.error : fullTheme.colors.primary }]}>
          <Feather 
            name={isExpired ? "alert-circle" : "key"} 
            size={48} 
            color="#FFFFFF" 
          />
        </View>

        <Spacer height={Spacing["2xl"]} />

        <ThemedText type="h1" style={styles.title}>
          {isExpired 
            ? (t.license?.expiredTitle || "License Expired")
            : (t.license?.activationTitle || "Activate License")
          }
        </ThemedText>

        <Spacer height={Spacing.md} />

        <ThemedText type="body" secondary style={styles.subtitle}>
          {isExpired 
            ? (t.license?.expiredMessage || "Your license has expired. Please enter a new license key to continue using the app.")
            : (t.license?.activationMessage || "Enter your license key to activate the app.")
          }
        </ThemedText>

        {isExpired && expirationDate ? (
          <>
            <Spacer height={Spacing.md} />
            <View style={[styles.expirationBadge, { backgroundColor: `${fullTheme.colors.error}15` }]}>
              <ThemedText type="small" style={{ color: fullTheme.colors.error }}>
                {t.license?.expiredOn || "Expired on"}: {formatDate(expirationDate, language)}
              </ThemedText>
            </View>
          </>
        ) : null}

        <Spacer height={Spacing["3xl"]} />

        <View style={styles.inputContainer}>
          <ThemedText type="label" style={styles.inputLabel}>
            {t.license?.keyLabel || "License Key"}
          </ThemedText>
          <Spacer height={Spacing.sm} />
          <View style={[
            styles.inputRow,
            {
              backgroundColor: fullTheme.colors.cardBackground,
              borderColor: error ? fullTheme.colors.error : fullTheme.colors.border,
            },
          ]}>
            <ThemedText type="body" style={styles.prefixText}>FIRE-</ThemedText>
            <TextInput
              style={[
                styles.inputField,
                { color: fullTheme.colors.textPrimary },
              ]}
              value={licenseKeyInput}
              onChangeText={handleKeyChange}
              placeholder="XXXX-XXXX-XXXX"
              placeholderTextColor={fullTheme.colors.textSecondary}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={14}
              editable={!isLoading}
            />
          </View>
          {error ? (
            <>
              <Spacer height={Spacing.sm} />
              <ThemedText type="small" style={{ color: fullTheme.colors.error }}>
                {error}
              </ThemedText>
            </>
          ) : null}
        </View>

        <Spacer height={Spacing["2xl"]} />

        <Button
          onPress={handleActivate}
          disabled={isLoading || licenseKeyInput.replace(/-/g, "").length < 12}
          style={styles.button}
        >
          {isLoading 
            ? (t.license?.activating || "Activating...") 
            : (t.license?.activateButton || "Ativar Licença")
          }
        </Button>

        {isLoading ? (
          <>
            <Spacer height={Spacing.lg} />
            <ActivityIndicator size="small" color={fullTheme.colors.primary} />
          </>
        ) : null}

        <Spacer height={Spacing["3xl"]} />

        <View style={[styles.infoBox, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}>
          <Feather name="info" size={20} color={fullTheme.colors.textSecondary} />
          <Spacer height={Spacing.sm} />
          <ThemedText type="small" secondary style={styles.infoText}>
            {t.license?.contactInfo || "Contact your administrator to obtain a valid license key."}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
  expirationBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  inputContainer: {
    width: "100%",
  },
  inputLabel: {
    marginLeft: Spacing.xs,
  },
  inputRow: {
    width: "100%",
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  prefixText: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 2,
  },
  inputField: {
    flex: 1,
    height: 56,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 2,
  },
  button: {
    width: "100%",
  },
  infoBox: {
    width: "100%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  infoText: {
    textAlign: "center",
  },
});
