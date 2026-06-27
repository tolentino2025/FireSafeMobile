import React from "react";
import {
  StyleSheet,
  ScrollView,
  Pressable,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useITM, ItmPlan } from "@/contexts/ITMContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { parseLocalYMD } from "@/utils/dateUtils";
import { statusGeral, type StatusGeral } from "@/utils/itm/agenda";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ITMStackParamList } from "@/navigation/ITMStackNavigator";
import { showConfirm } from "@/utils/appAlert";

const TAB_BAR_HEIGHT = 90;

type Props = NativeStackScreenProps<ITMStackParamList, "ITMPlans">;

export default function ITMPlansScreen({ navigation }: Props) {
  const { fullTheme } = useTheme();
  const { t, language } = useLanguage();
  const { plans, removerPlano, getResumoDoPlano } = useITM();
  const insets = useSafeAreaInsets();

  const formatDate = (dateString: string) => {
    const date = parseLocalYMD(dateString);
    const locale = language === "pt-BR" ? "pt-BR" : "en-US";
    return date.toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const corStatusGeral = (status: StatusGeral): string => {
    switch (status) {
      case "vencido":
        return fullTheme.colors.error;
      case "com_pendencias":
        return fullTheme.colors.warning;
      case "em_dia":
        return fullTheme.colors.success;
      case "sem_agenda":
      default:
        return fullTheme.colors.textSecondary;
    }
  };

  const confirmarRemocao = (plan: ItmPlan) => {
    showConfirm(
      t.itm.plans.removeConfirmTitle,
      t.itm.plans.removeConfirmMessage,
      () => removerPlano(plan.id),
      { confirmText: t.itm.plans.removePlan, cancelText: t.common.cancel, destructive: true }
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader
        title={t.itm.plans.title}
        subtitle={`${plans.length} ${t.itm.plans.plansCount} · NFPA 25`}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Spacing.xl,
            paddingBottom: insets.bottom + TAB_BAR_HEIGHT + Spacing["3xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => navigation.navigate("ITMPlanForm")}
          style={[
            styles.newButton,
            {
              backgroundColor: fullTheme.colors.primary,
              ...fullTheme.shadows.medium,
            },
          ]}
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
          <ThemedText type="h4" style={styles.newButtonText}>
            {t.itm.plans.newPlan}
          </ThemedText>
        </Pressable>

        {plans.length === 0 ? (
          <View style={styles.empty}>
            <Feather
              name="calendar"
              size={48}
              color={fullTheme.colors.textSecondary}
            />
            <ThemedText type="h3" style={styles.emptyTitle}>
              {t.itm.plans.emptyTitle}
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptySubtitle}>
              {t.itm.plans.emptySubtitle}
            </ThemedText>
          </View>
        ) : (
          plans.map((plan) => {
            const resumo = getResumoDoPlano(plan.id);
            const geral = statusGeral(resumo);
            const corGeral = corStatusGeral(geral);
            return (
              <Pressable
                key={plan.id}
                onPress={() =>
                  navigation.navigate("ITMPlanSystems", { planId: plan.id })
                }
                onLongPress={() => confirmarRemocao(plan)}
                style={[
                  styles.card,
                  {
                    backgroundColor: fullTheme.colors.cardBackground,
                    borderColor: fullTheme.colors.border,
                    ...fullTheme.shadows.small,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Feather name="home" size={18} color={fullTheme.colors.primary} />
                  <ThemedText type="h4" style={styles.cardTitle} numberOfLines={1}>
                    {plan.propertyName}
                  </ThemedText>
                  <View style={[styles.dot, { backgroundColor: corGeral }]} />
                  <Pressable
                    onPress={() => confirmarRemocao(plan)}
                    hitSlop={8}
                    style={styles.deleteButton}
                  >
                    <Feather name="trash-2" size={18} color={fullTheme.colors.error} />
                  </Pressable>
                </View>

                <View style={styles.cardRow}>
                  <ThemedText type="small" secondary>
                    {t.itm.plans.startDate}: {formatDate(plan.startDate)}
                  </ThemedText>
                  <ThemedText type="small" secondary>
                    {t.itm.plans.systemsCount.replace(
                      "{count}",
                      String(plan.systemKeys.length),
                    )}
                  </ThemedText>
                </View>

                {/* Contadores corretos: vencidas + proximas 30 dias */}
                <View style={styles.metricsRow}>
                  <View style={styles.metric}>
                    <ThemedText
                      type="h4"
                      style={{
                        color:
                          resumo.vencidas > 0
                            ? fullTheme.colors.error
                            : fullTheme.colors.textPrimary,
                      }}
                    >
                      {resumo.vencidas}
                    </ThemedText>
                    <ThemedText type="small" secondary>
                      {t.itm.plans.overdueCount}
                    </ThemedText>
                  </View>
                  <View style={styles.metric}>
                    <ThemedText type="h4">{resumo.proximas}</ThemedText>
                    <ThemedText type="small" secondary>
                      {t.itm.plans.soonCount}
                    </ThemedText>
                  </View>
                  <View style={styles.metric}>
                    <ThemedText type="small" secondary>
                      {t.itm.plans.nextDue}
                    </ThemedText>
                    <ThemedText type="small">
                      {resumo.proximoVencimento
                        ? formatDate(resumo.proximoVencimento)
                        : t.itm.systems.none}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.statusRow}>
                  <View style={[styles.badge, { backgroundColor: corGeral }]}>
                    <ThemedText type="small" style={styles.badgeText}>
                      {t.itm.plans.general[geral]}
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg },
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  newButtonText: { color: "#FFFFFF" },
  empty: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
    gap: Spacing.md,
  },
  emptyTitle: { textAlign: "center" },
  emptySubtitle: { textAlign: "center", paddingHorizontal: Spacing.xl },
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  cardTitle: { flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  deleteButton: { padding: Spacing.xs },
  cardRow: { flexDirection: "row", justifyContent: "space-between" },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  metric: { flex: 1, gap: 2 },
  statusRow: { flexDirection: "row", marginTop: Spacing.xs },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: { color: "#FFFFFF", fontWeight: "600" },
});
