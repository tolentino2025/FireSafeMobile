import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription, FREE_INSPECTION_LIMIT } from "@/contexts/SubscriptionContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { showAlert } from "@/utils/appAlert";

type PlanOption = "monthly" | "annual";

interface PlanCardProps {
  plan: PlanOption;
  selected: boolean;
  onSelect: () => void;
}

function PlanCard({ plan, selected, onSelect }: PlanCardProps) {
  const { fullTheme } = useTheme();
  const { t } = useLanguage();
  const isAnnual = plan === "annual";
  const sub = t.subscription;

  return (
    <Pressable
      onPress={onSelect}
      style={[
        styles.planCard,
        {
          borderColor: selected ? fullTheme.colors.primary : fullTheme.colors.border,
          backgroundColor: selected
            ? `${fullTheme.colors.primary}12`
            : fullTheme.colors.cardBackground,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      {isAnnual ? (
        <View style={[styles.savingsBadge, { backgroundColor: fullTheme.colors.success }]}>
          <ThemedText type="small" style={styles.savingsText}>
            {sub.savePercent}
          </ThemedText>
        </View>
      ) : null}

      <View style={[styles.planIconCircle, { backgroundColor: `${fullTheme.colors.primary}18` }]}>
        <Feather
          name={isAnnual ? "star" : "calendar"}
          size={22}
          color={fullTheme.colors.primary}
        />
      </View>

      <Spacer height={Spacing.sm} />
      <ThemedText type="h4">{isAnnual ? sub.annualPlan : sub.monthlyPlan}</ThemedText>
      <Spacer height={Spacing.xs} />
      <ThemedText type="h3" style={{ color: fullTheme.colors.primary }}>
        {isAnnual ? sub.annualPrice : sub.monthlyPrice}
      </ThemedText>
      <ThemedText type="small" secondary>
        {isAnnual ? sub.perYear : sub.perMonth}
      </ThemedText>

      {selected ? (
        <View style={[styles.selectedDot, { backgroundColor: fullTheme.colors.primary }]} />
      ) : null}
    </Pressable>
  );
}

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

export default function PaywallScreen() {
  const { fullTheme } = useTheme();
  const { t, language } = useLanguage();
  const { paywallVisible, hidePaywall, activatePremium, restorePurchases } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<PlanOption>("annual");
  const [isLoading, setIsLoading] = useState(false);

  const sub = t.subscription;

  const handleSubscribe = async () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setIsLoading(true);
    try {
      // TODO: Replace with real IAP purchase flow
      // For now simulates success so the UI is functional
      await activatePremium(selectedPlan);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Subscribe error:", error);
      showAlert(sub.errorTitle, sub.errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    await restorePurchases();
    showAlert(
      sub.restoreTitle,
      sub.restoreMessage,
    );
  };

  return (
    <Modal
      visible={paywallVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={hidePaywall}
    >
      <View style={[styles.container, { backgroundColor: fullTheme.colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={hidePaywall} hitSlop={12} style={styles.closeBtn}>
            <Feather name="x" size={24} color={fullTheme.colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.heroSection}>
          <View style={[styles.heroIcon, { backgroundColor: fullTheme.colors.primary }]}>
            <Feather name="shield" size={40} color="#FFFFFF" />
          </View>
          <Spacer height={Spacing.lg} />
          <ThemedText type="h2" style={styles.heroTitle}>
            {sub.paywallTitle}
          </ThemedText>
          <Spacer height={Spacing.sm} />
          <ThemedText type="body" secondary style={styles.heroSubtitle}>
            {sub.paywallSubtitle.replace("{limit}", String(FREE_INSPECTION_LIMIT))}
          </ThemedText>
        </View>

        <Spacer height={Spacing.xl} />

        <View style={styles.featuresSection}>
          <FeatureRow icon="check-circle" text={sub.featureUnlimited} />
          <FeatureRow icon="check-circle" text={sub.featurePdf} />
          <FeatureRow icon="check-circle" text={sub.featureSync} />
          <FeatureRow icon="check-circle" text={sub.featureSupport} />
        </View>

        <Spacer height={Spacing.xl} />

        <View style={styles.planRow}>
          <PlanCard
            plan="monthly"
            selected={selectedPlan === "monthly"}
            onSelect={() => setSelectedPlan("monthly")}
          />
          <PlanCard
            plan="annual"
            selected={selectedPlan === "annual"}
            onSelect={() => setSelectedPlan("annual")}
          />
        </View>

        <Spacer height={Spacing.xl} />

        <Pressable
          onPress={handleSubscribe}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.subscribeBtn,
            { backgroundColor: fullTheme.colors.primary, opacity: pressed || isLoading ? 0.8 : 1 },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText type="h4" style={styles.subscribeBtnText}>
              {sub.subscribeButton}
            </ThemedText>
          )}
        </Pressable>

        <Spacer height={Spacing.md} />

        <Pressable onPress={handleRestore}>
          <ThemedText type="small" secondary style={styles.restoreText}>
            {sub.restorePurchases}
          </ThemedText>
        </Pressable>

        <Spacer height={Spacing.sm} />
        <ThemedText type="small" secondary style={styles.legalText}>
          {sub.legalNote}
        </ThemedText>

        <Spacer height={Spacing.xl} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
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
  planRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  planCard: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    position: "relative",
    overflow: "hidden",
  },
  planIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  savingsBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderBottomLeftRadius: BorderRadius.md,
  },
  savingsText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 11,
  },
  selectedDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginTop: Spacing.sm,
  },
  subscribeBtn: {
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeBtnText: {
    color: "#FFFFFF",
  },
  restoreText: {
    textAlign: "center",
  },
  legalText: {
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
    fontSize: 11,
  },
});
