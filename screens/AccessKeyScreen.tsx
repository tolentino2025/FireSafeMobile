// Tela de liberação por chave de acesso.
//
// Aparece quando o usuário esgota as inspeções da versão de avaliação. O app não
// vende nem cobra nada aqui: apenas valida uma chave já fornecida à empresa.
import React, { useState } from "react";
import { View, StyleSheet, Modal, Pressable, ActivityIndicator, TextInput, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription, FREE_INSPECTION_LIMIT, RedeemError } from "@/contexts/SubscriptionContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { showAlert } from "@/utils/appAlert";
import { PRIVACY_CONTACT_EMAIL } from "@/constants/legal";

interface FeatureRowProps {
  icon: keyof typeof Feather.glyphMap;
  text: string;
}

function FeatureRow({ icon, text }: FeatureRowProps) {
  const { fullTheme } = useTheme();
  return (
    <View style={styles.featureRow}>
      <Feather name={icon} size={18} color={fullTheme.colors.success} />
      <ThemedText type="body" style={styles.featureText}>
        {text}
      </ThemedText>
    </View>
  );
}

/** Formata enquanto digita: maiúsculas, só A-Z0-9, em grupos de 5. */
function formatKey(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
  return clean.replace(/(.{5})(?=.)/g, "$1-");
}

export default function AccessKeyScreen() {
  const { fullTheme } = useTheme();
  const { t } = useLanguage();
  const { accessGateVisible, hideAccessGate, redeemAccessKey } = useSubscription();
  const [key, setKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sub = t.subscription;

  const errorMessage = (reason: RedeemError): string => {
    switch (reason) {
      case "invalid":
        return sub.errorInvalid;
      case "used":
        return sub.errorUsed;
      case "revoked":
        return sub.errorRevoked;
      case "offline":
        return sub.errorOffline;
      default:
        return sub.errorUnknown;
    }
  };

  const handleRedeem = async () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setIsLoading(true);
    try {
      const reason = await redeemAccessKey(key);
      if (reason) {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        showAlert(sub.errorTitle, errorMessage(reason));
        return;
      }
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setKey("");
      showAlert(sub.successTitle, sub.successMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = key.replace(/-/g, "").length >= 16 && !isLoading;

  return (
    <Modal
      visible={accessGateVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={hideAccessGate}
    >
      <View style={[styles.container, { backgroundColor: fullTheme.colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={hideAccessGate} hitSlop={12} style={styles.closeBtn}>
            <Feather name="x" size={24} color={fullTheme.colors.textSecondary} />
          </Pressable>
        </View>

        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bottomOffset={24}
        >
          <View style={styles.heroSection}>
            <View style={[styles.heroIcon, { backgroundColor: fullTheme.colors.primary }]}>
              <Feather name="key" size={40} color="#FFFFFF" />
            </View>
            <Spacer height={Spacing.lg} />
            <ThemedText type="h2" style={styles.heroTitle}>
              {sub.gateTitle}
            </ThemedText>
            <Spacer height={Spacing.sm} />
            <ThemedText type="body" secondary style={styles.heroSubtitle}>
              {sub.gateSubtitle.replace("{limit}", String(FREE_INSPECTION_LIMIT))}
            </ThemedText>
          </View>

          <Spacer height={Spacing.xl} />

          <ThemedText type="small" secondary>
            {sub.keyLabel}
          </ThemedText>
          <Spacer height={Spacing.xs} />
          <TextInput
            value={key}
            onChangeText={(text) => setKey(formatKey(text))}
            placeholder={sub.keyPlaceholder}
            placeholderTextColor={fullTheme.colors.textSecondary}
            autoCapitalize="characters"
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
            maxLength={23}
            testID="access-key-input"
            style={[
              styles.input,
              {
                backgroundColor: fullTheme.colors.cardBackground,
                borderColor: fullTheme.colors.border,
                color: fullTheme.colors.textPrimary,
              },
            ]}
          />

          <Spacer height={Spacing.lg} />

          <Pressable
            onPress={handleRedeem}
            disabled={!canSubmit}
            testID="access-key-submit"
            style={({ pressed }) => [
              styles.redeemBtn,
              {
                backgroundColor: fullTheme.colors.primary,
                opacity: !canSubmit ? 0.5 : pressed ? 0.8 : 1,
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText type="h4" style={styles.redeemBtnText}>
                {sub.redeemButton}
              </ThemedText>
            )}
          </Pressable>

          <Spacer height={Spacing.md} />

          <Pressable onPress={hideAccessGate}>
            <ThemedText type="small" secondary style={styles.laterText}>
              {sub.laterButton}
            </ThemedText>
          </Pressable>

          <Spacer height={Spacing.xl} />

          <View style={styles.featuresSection}>
            <FeatureRow icon="check-circle" text={sub.featureUnlimited} />
            <FeatureRow icon="check-circle" text={sub.featurePdf} />
            <FeatureRow icon="check-circle" text={sub.featureSync} />
            <FeatureRow icon="check-circle" text={sub.featureSupport} />
          </View>

          <Spacer height={Spacing.xl} />

          <ThemedText type="small" secondary style={styles.helpText}>
            {`${sub.helpLabel} ${PRIVACY_CONTACT_EMAIL}`}
          </ThemedText>

          <Spacer height={Spacing.xl} />
        </KeyboardAwareScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: Spacing.xl,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  heroSection: {
    alignItems: "center",
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    textAlign: "center",
  },
  heroSubtitle: {
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    fontSize: 18,
    letterSpacing: 2,
    textAlign: "center",
  },
  redeemBtn: {
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  redeemBtnText: {
    color: "#FFFFFF",
  },
  laterText: {
    textAlign: "center",
  },
  featuresSection: {
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  featureText: {
    flex: 1,
  },
  helpText: {
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
    fontSize: 11,
  },
});
