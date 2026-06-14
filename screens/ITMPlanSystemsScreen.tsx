import React from "react";
import { StyleSheet, ScrollView, Pressable, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useITM } from "@/contexts/ITMContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { parseLocalYMD } from "@/utils/dateUtils";
import { rotuloSistema } from "@/utils/itm/labels";
import { statusGeral, type StatusGeral } from "@/utils/itm/agenda";
import { ITMStackParamList } from "@/navigation/ITMStackNavigator";

type Props = NativeStackScreenProps<ITMStackParamList, "ITMPlanSystems">;

export default function ITMPlanSystemsScreen({ route, navigation }: Props) {
  const { planId } = route.params;
  const { fullTheme } = useTheme();
  const { t, language } = useLanguage();
  const { getPlanoById, getSistemasDoPlano } = useITM();
  const insets = useSafeAreaInsets();

  const plano = getPlanoById(planId);
  const sistemas = getSistemasDoPlano(planId);

  const locale = language === "pt-BR" ? "pt-BR" : "en-US";
  const formatDate = (s: string | null) =>
    s
      ? parseLocalYMD(s).toLocaleDateString(locale, {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : t.itm.systems.none;

  const corStatusGeral = (status: StatusGeral): string => {
    switch (status) {
      case "vencido":
        return fullTheme.colors.error;
      case "com_pendencias":
        return fullTheme.colors.warning;
      case "em_dia":
        return fullTheme.colors.success;
      default:
        return fullTheme.colors.textSecondary;
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
        {plano ? (
          <View style={styles.headerBlock}>
            <ThemedText type="h3" numberOfLines={2}>
              {plano.propertyName}
            </ThemedText>
            <ThemedText type="small" secondary>
              {t.itm.systems.subtitle}
            </ThemedText>
          </View>
        ) : null}

        {sistemas.length === 0 ? (
          <View style={styles.empty}>
            <Feather
              name="layers"
              size={48}
              color={fullTheme.colors.textSecondary}
            />
            <ThemedText type="h3" style={styles.emptyTitle}>
              {t.itm.systems.emptyTitle}
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptySubtitle}>
              {t.itm.systems.emptySubtitle}
            </ThemedText>
          </View>
        ) : (
          sistemas.map(({ systemKey, resumo }) => {
            const geral = statusGeral(resumo);
            const corGeral = corStatusGeral(geral);
            return (
              <Pressable
                key={systemKey}
                onPress={() =>
                  navigation.navigate("ITMSchedule", { planId, systemKey })
                }
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
                  <ThemedText type="h4" style={styles.cardTitle} numberOfLines={2}>
                    {rotuloSistema(systemKey, language)}
                  </ThemedText>
                  <View style={[styles.dot, { backgroundColor: corGeral }]} />
                </View>

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
                      {t.itm.systems.overdue}
                    </ThemedText>
                  </View>
                  <View style={styles.metric}>
                    <ThemedText type="h4">{resumo.proximas}</ThemedText>
                    <ThemedText type="small" secondary>
                      {t.itm.systems.soon}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.cardRow}>
                  <ThemedText type="small" secondary>
                    {t.itm.systems.nextDue}: {formatDate(resumo.proximoVencimento)}
                  </ThemedText>
                  <ThemedText type="small" secondary>
                    {t.itm.systems.lastDone}: {formatDate(resumo.ultimaConclusao)}
                  </ThemedText>
                </View>

                <View style={styles.chevron}>
                  <Feather
                    name="chevron-right"
                    size={18}
                    color={fullTheme.colors.textSecondary}
                  />
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
  headerBlock: { marginBottom: Spacing.lg, gap: 2 },
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
  metricsRow: {
    flexDirection: "row",
    gap: Spacing.xl,
    marginTop: Spacing.xs,
  },
  metric: { gap: 2, minWidth: 70 },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  chevron: { position: "absolute", right: Spacing.md, top: Spacing.lg },
});
