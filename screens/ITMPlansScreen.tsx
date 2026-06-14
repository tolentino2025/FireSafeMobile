import React from "react";
import {
  StyleSheet,
  ScrollView,
  Pressable,
  View,
  Alert,
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
import { ITMStackParamList } from "@/navigation/ITMStackNavigator";

const TAB_BAR_HEIGHT = 90;

type Props = NativeStackScreenProps<ITMStackParamList, "ITMPlans">;

export default function ITMPlansScreen({ navigation }: Props) {
  const { fullTheme } = useTheme();
  const { t, language } = useLanguage();
  const { plans, occurrences, removerPlano } = useITM();
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

  const hojeISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
  };

  const pendentesDoPlano = (planId: string) => {
    return occurrences.filter((o) => o.planId === planId && !o.completedAt).length;
  };

  const atrasadasDoPlano = (planId: string) => {
    const hoje = hojeISO();
    return occurrences.filter(
      (o) => o.planId === planId && !o.completedAt && o.windowEnd < hoje,
    ).length;
  };

  const confirmarRemocao = (plan: ItmPlan) => {
    Alert.alert(
      t.itm.plans.removeConfirmTitle,
      t.itm.plans.removeConfirmMessage,
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text: t.itm.plans.removePlan,
          style: "destructive",
          onPress: () => removerPlano(plan.id),
        },
      ],
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 60,
            paddingBottom: insets.bottom + TAB_BAR_HEIGHT + Spacing["3xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => navigation.navigate("ITMPlanForm")}
          style={[
            styles.newButton,
            { backgroundColor: fullTheme.colors.primary, ...fullTheme.shadows.medium },
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
            const pendentes = pendentesDoPlano(plan.id);
            const atrasadas = atrasadasDoPlano(plan.id);
            return (
              <Pressable
                key={plan.id}
                onPress={() =>
                  navigation.navigate("ITMSchedule", { planId: plan.id })
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
                  <Feather
                    name="home"
                    size={18}
                    color={fullTheme.colors.primary}
                  />
                  <ThemedText type="h4" style={styles.cardTitle} numberOfLines={1}>
                    {plan.propertyName}
                  </ThemedText>
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

                <View style={styles.cardFooter}>
                  <ThemedText
                    type="small"
                    style={{
                      color:
                        pendentes > 0
                          ? fullTheme.colors.textPrimary
                          : fullTheme.colors.textSecondary,
                    }}
                  >
                    {pendentes > 0
                      ? `${t.itm.plans.upcoming}: ${pendentes}`
                      : t.itm.plans.noUpcoming}
                  </ThemedText>
                  {atrasadas > 0 ? (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: fullTheme.colors.error },
                      ]}
                    >
                      <ThemedText type="small" style={styles.badgeText}>
                        {atrasadas} {t.itm.status.overdue}
                      </ThemedText>
                    </View>
                  ) : null}
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
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  newButtonText: {
    color: "#FFFFFF",
  },
  empty: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
    gap: Spacing.md,
  },
  emptyTitle: {
    textAlign: "center",
  },
  emptySubtitle: {
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
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
  cardTitle: {
    flex: 1,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
