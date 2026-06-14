import React from "react";
import { StyleSheet, ScrollView, Pressable, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useITM, ItmOccurrence } from "@/contexts/ITMContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { parseLocalYMD } from "@/utils/dateUtils";
import { ITMStackParamList } from "@/navigation/ITMStackNavigator";

type Props = NativeStackScreenProps<ITMStackParamList, "ITMSchedule">;

function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export default function ITMScheduleScreen({ route }: Props) {
  const { planId } = route.params;
  const { fullTheme } = useTheme();
  const { t, language } = useLanguage();
  const { getOcorrenciasDoPlano, concluirOcorrencia, regenerarAgenda } = useITM();
  const insets = useSafeAreaInsets();

  const ocorrencias = getOcorrenciasDoPlano(planId);

  const locale = language === "pt-BR" ? "pt-BR" : "en-US";

  const formatDate = (dateString: string) => {
    return parseLocalYMD(dateString).toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Agrupa por mes (chave YYYY-MM, rotulo "mês ano").
  const grupos = new Map<string, ItmOccurrence[]>();
  for (const occ of ocorrencias) {
    const chave = occ.dueDate.slice(0, 7);
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave)!.push(occ);
  }
  const chavesMes = Array.from(grupos.keys()).sort();

  const rotuloMes = (chave: string) => {
    const [ano, mes] = chave.split("-");
    const d = new Date(Number(ano), Number(mes) - 1, 1);
    return d.toLocaleDateString(locale, { month: "long", year: "numeric" });
  };

  const statusColor = (status: ItmOccurrence["status"]) => {
    switch (status) {
      case "completed":
        return fullTheme.colors.success;
      case "overdue":
        return fullTheme.colors.error;
      case "scheduled":
      default:
        return fullTheme.colors.textSecondary;
    }
  };

  const statusLabel = (status: ItmOccurrence["status"]) => {
    switch (status) {
      case "completed":
        return t.itm.status.completed;
      case "overdue":
        return t.itm.status.overdue;
      case "scheduled":
      default:
        return t.itm.status.scheduled;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 60,
            paddingBottom: insets.bottom + Spacing["5xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => regenerarAgenda(planId)}
          style={[
            styles.regenButton,
            { borderColor: fullTheme.colors.primary },
          ]}
        >
          <Feather name="refresh-cw" size={16} color={fullTheme.colors.primary} />
          <ThemedText
            type="small"
            style={{ color: fullTheme.colors.primary, fontWeight: "600" }}
          >
            {t.itm.schedule.regenerate}
          </ThemedText>
        </Pressable>

        {ocorrencias.length === 0 ? (
          <View style={styles.empty}>
            <Feather
              name="calendar"
              size={48}
              color={fullTheme.colors.textSecondary}
            />
            <ThemedText type="h3" style={styles.emptyTitle}>
              {t.itm.schedule.emptyTitle}
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptySubtitle}>
              {t.itm.schedule.emptySubtitle}
            </ThemedText>
          </View>
        ) : (
          chavesMes.map((chave) => (
            <View key={chave} style={styles.monthGroup}>
              <ThemedText type="h4" style={styles.monthTitle}>
                {rotuloMes(chave)}
              </ThemedText>
              {grupos.get(chave)!.map((occ) => (
                <View
                  key={occ.id}
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
                    <ThemedText type="body" style={styles.cardTitle}>
                      {occ.description}
                    </ThemedText>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: statusColor(occ.status) },
                      ]}
                    >
                      <ThemedText type="small" style={styles.badgeText}>
                        {statusLabel(occ.status)}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.cardRow}>
                    <ThemedText type="small" secondary>
                      {t.itm.schedule.dueDate}: {formatDate(occ.dueDate)}
                    </ThemedText>
                    <ThemedText type="small" secondary>
                      {t.itm.schedule.scheduledDate}: {formatDate(occ.scheduledDate)}
                    </ThemedText>
                  </View>

                  {occ.status === "completed" && occ.completedAt ? (
                    <ThemedText
                      type="small"
                      style={{ color: fullTheme.colors.success }}
                    >
                      {t.itm.schedule.completedOn}: {formatDate(occ.completedAt)}
                    </ThemedText>
                  ) : (
                    <Pressable
                      onPress={() => concluirOcorrencia(occ.id, hojeISO())}
                      style={[
                        styles.completeButton,
                        { backgroundColor: fullTheme.colors.primary },
                      ]}
                    >
                      <Feather name="check" size={16} color="#FFFFFF" />
                      <ThemedText type="small" style={styles.completeButtonText}>
                        {t.itm.schedule.complete}
                      </ThemedText>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          ))
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
  regenButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
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
  monthGroup: {
    marginBottom: Spacing.xl,
  },
  monthTitle: {
    marginBottom: Spacing.md,
    textTransform: "capitalize",
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  cardTitle: {
    flex: 1,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: Spacing.xs,
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
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
