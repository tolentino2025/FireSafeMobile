import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ComplianceRing } from "@/components/ComplianceRing";
import { MetricStrip } from "@/components/MetricStrip";
import { StatusChip } from "@/components/StatusChip";
import { InspectionCard } from "@/components/InspectionCard";
import { SyncStatus } from "@/components/SyncStatus";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections, Inspection } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { parseLocalYMD } from "@/utils/dateUtils";

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "Home">;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { fullTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { inspections } = useInspections();

  const toggleLanguage = () => {
    setLanguage(language === "pt-BR" ? "en" : "pt-BR");
  };

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisWeekInspections = inspections.filter(
    (insp) => parseLocalYMD(insp.date) >= startOfWeek,
  );
  const thisMonthInspections = inspections.filter(
    (insp) => parseLocalYMD(insp.date) >= startOfMonth,
  );
  const incompleteInspections = inspections.filter(
    (insp) => insp.status !== "completed",
  );

  const total = inspections.length;
  const completed = total - incompleteInspections.length;
  // Conformidade = inspeções concluídas / total (100% quando não há inspeções).
  const compliancePct = total === 0 ? 100 : Math.round((completed / total) * 100);

  const recentInspections = [...inspections]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5);

  const handleInspectionPress = (inspection: Inspection) => {
    navigation.navigate("InspectionDetail", { inspectionId: inspection.id });
  };

  return (
    <ScreenScrollView>
      <View style={styles.header}>
        <ThemedText type="h2">{t.home.greeting}</ThemedText>
        <Pressable
          onPress={toggleLanguage}
          style={({ pressed }) => [
            styles.languageButton,
            {
              backgroundColor: fullTheme.colors.cardBackground,
              borderColor: fullTheme.colors.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <ThemedText type="small" mono style={styles.languageText}>
            {language === "pt-BR" ? "PT" : "EN"}
          </ThemedText>
        </Pressable>
      </View>

      <Spacer height={Spacing.lg} />

      <SyncStatus />

      <Spacer height={Spacing.xl} />

      {/* Card de conformidade — padrao Instrument */}
      <View
        style={[
          styles.complianceCard,
          {
            backgroundColor: fullTheme.colors.surface,
            borderColor: fullTheme.colors.border,
            ...fullTheme.shadows.medium,
          },
        ]}
      >
        <View
          style={[styles.glow, { backgroundColor: fullTheme.colors.primarySoft }]}
        />
        <View style={styles.complianceRow}>
          <ComplianceRing
            percent={compliancePct}
            label={t.home.compliant ?? "CONFORME"}
          />
          <View style={styles.complianceText}>
            <ThemedText type="small" mono secondary style={styles.eyebrow}>
              {(t.home.complianceTitle ?? "Conformidade · Carteira").toUpperCase()}
            </ThemedText>
            <ThemedText type="h4" style={styles.complianceHeadline}>
              {(t.home.complianceSummary ?? "{done} de {total} sistemas")
                .replace("{done}", String(completed))
                .replace("{total}", String(total))}
            </ThemedText>
            {incompleteInspections.length > 0 ? (
              <StatusChip
                variant="pending"
                label={(t.home.needsAttention ?? "{n} requer atenção").replace(
                  "{n}",
                  String(incompleteInspections.length),
                )}
                style={styles.attentionChip}
              />
            ) : (
              <StatusChip
                variant="pass"
                label={t.home.allCompliant ?? "Tudo em conformidade"}
                style={styles.attentionChip}
              />
            )}
          </View>
        </View>
      </View>

      <Spacer height={Spacing.md} />

      {/* Tira de metricas */}
      <MetricStrip
        metrics={[
          {
            label: t.home.thisWeek,
            value: thisWeekInspections.length,
            icon: "calendar",
          },
          {
            label: t.home.thisMonth,
            value: thisMonthInspections.length,
            icon: "check-circle",
          },
          {
            label: t.home.incomplete,
            value: incompleteInspections.length,
            icon: "clock",
          },
        ]}
      />

      <Spacer height={Spacing["3xl"]} />

      <ThemedText type="h3">{t.home.recentActivity}</ThemedText>
      <Spacer height={Spacing.lg} />

      {recentInspections.length === 0 ? (
        <View
          style={[
            styles.emptyState,
            {
              backgroundColor: fullTheme.colors.cardBackground,
              borderColor: fullTheme.colors.border,
            },
          ]}
        >
          <Feather
            name="clipboard"
            size={48}
            color={fullTheme.colors.textSecondary}
          />
          <Spacer height={Spacing.md} />
          <ThemedText type="body" secondary style={{ textAlign: "center" }}>
            {t.home.noInspections}
          </ThemedText>
        </View>
      ) : (
        recentInspections.map((inspection) => (
          <React.Fragment key={inspection.id}>
            <InspectionCard
              inspection={inspection}
              onPress={() => handleInspectionPress(inspection)}
            />
            <Spacer height={Spacing.md} />
          </React.Fragment>
        ))
      )}

      <Spacer height={80} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  languageButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  languageText: {
    fontWeight: "600",
  },
  complianceCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  complianceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  complianceText: {
    flex: 1,
  },
  eyebrow: {
    letterSpacing: 1.4,
  },
  complianceHeadline: {
    marginTop: 7,
    lineHeight: 19,
  },
  attentionChip: {
    marginTop: 11,
  },
  emptyState: {
    padding: Spacing["3xl"],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
