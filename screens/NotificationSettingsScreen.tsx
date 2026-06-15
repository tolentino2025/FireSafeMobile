import React, { useEffect, useState } from "react";
import { View, StyleSheet, Switch, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useITM } from "@/contexts/ITMContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  getItmNotificationPreferences,
  saveItmNotificationPreferences,
  DEFAULT_ITM_NOTIFICATION_PREFERENCES,
  type ItmNotificationPreferences,
  type HorizonDays,
} from "@/utils/itm/notificationPreferences";
import { syncItmLocalReminders } from "@/utils/itm/localReminders";

export default function NotificationSettingsScreen() {
  const { fullTheme } = useTheme();
  const { language } = useLanguage();
  const { occurrences } = useITM();
  const pt = language === "pt-BR";

  const [prefs, setPrefs] = useState<ItmNotificationPreferences>(
    DEFAULT_ITM_NOTIFICATION_PREFERENCES,
  );

  useEffect(() => {
    getItmNotificationPreferences().then(setPrefs);
  }, []);

  const update = async (patch: Partial<ItmNotificationPreferences>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    await saveItmNotificationPreferences(next);
    // Se mexeu no push, reagenda os lembretes locais.
    if ("push48hEnabled" in patch) {
      syncItmLocalReminders(occurrences).catch(() => {});
    }
  };

  const Toggle = ({
    label,
    desc,
    value,
    onChange,
  }: {
    label: string;
    desc?: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <View
      style={[
        styles.row,
        { backgroundColor: fullTheme.colors.surface, borderColor: fullTheme.colors.border },
      ]}
    >
      <View style={styles.rowText}>
        <ThemedText type="body" style={{ fontWeight: "600" }}>
          {label}
        </ThemedText>
        {desc ? (
          <ThemedText type="small" secondary style={{ marginTop: 2 }}>
            {desc}
          </ThemedText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: fullTheme.colors.border, true: fullTheme.colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader
        title={pt ? "Notificações e Calendário" : "Notifications & Calendar"}
        subtitle="ITM · NFPA 25"
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          {pt ? "Notificações" : "Notifications"}
        </ThemedText>

        <Toggle
          label={pt ? "Receber e-mail 48h antes" : "Email 48h before"}
          desc={pt ? "Requer servidor (em breve)" : "Requires server (coming soon)"}
          value={prefs.email48hEnabled}
          onChange={(v) => update({ email48hEnabled: v })}
        />
        <Toggle
          label={pt ? "Receber push no celular" : "Push on phone"}
          desc={pt ? "Lembrete local 48h antes (mobile)" : "Local 48h reminder (mobile)"}
          value={prefs.push48hEnabled}
          onChange={(v) => update({ push48hEnabled: v })}
        />
        <Toggle
          label={pt ? "Avisar tarefas vencidas" : "Overdue alerts"}
          value={prefs.overdueAlertEnabled}
          onChange={(v) => update({ overdueAlertEnabled: v })}
        />
        <Toggle
          label={pt ? "Resumo diário" : "Daily summary"}
          desc={pt ? "Requer servidor (em breve)" : "Requires server (coming soon)"}
          value={prefs.dailySummaryEnabled}
          onChange={(v) => update({ dailySummaryEnabled: v })}
        />

        <ThemedText type="h4" style={styles.sectionTitle}>
          {pt ? "Calendário" : "Calendar"}
        </ThemedText>
        <Toggle
          label={pt ? "Sincronizar com meu calendário" : "Sync with my calendar"}
          desc={pt ? "Use “Adicionar ao calendário (.ics)” na agenda do sistema" : "Use “Add to calendar (.ics)” in the system schedule"}
          value={prefs.calendarSyncEnabled}
          onChange={(v) => update({ calendarSyncEnabled: v })}
        />

        <ThemedText type="h4" style={styles.sectionTitle}>
          {pt ? "Horizonte de sincronização" : "Sync horizon"}
        </ThemedText>
        <View style={styles.horizonRow}>
          {([30, 60, 90] as HorizonDays[]).map((h) => {
            const active = prefs.horizonDays === h;
            return (
              <Pressable
                key={h}
                onPress={() => update({ horizonDays: h })}
                style={[
                  styles.horizonChip,
                  {
                    backgroundColor: active ? fullTheme.colors.primary : fullTheme.colors.surface,
                    borderColor: active ? fullTheme.colors.primary : fullTheme.colors.border,
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{ color: active ? "#FFFFFF" : fullTheme.colors.textPrimary, fontWeight: "600" }}
                >
                  {pt ? `${h} dias` : `${h} days`}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View
          style={[
            styles.infoBox,
            { backgroundColor: fullTheme.colors.surfaceAlt, borderColor: fullTheme.colors.border },
          ]}
        >
          <Feather name="info" size={16} color={fullTheme.colors.textSecondary} />
          <ThemedText type="small" secondary style={{ flex: 1, marginLeft: Spacing.sm }}>
            {pt
              ? "Fuso horário: America/Sao_Paulo · Horário padrão: 08:00 · Duração: 60 min. E-mail/push remoto e Google/Outlook serão ativados com o servidor."
              : "Timezone: America/Sao_Paulo · Default time: 08:00 · Duration: 60 min. Email/remote push and Google/Outlook will be enabled with the server."}
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: Spacing["5xl"] },
  sectionTitle: { marginTop: Spacing.lg, marginBottom: Spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  rowText: { flex: 1, marginRight: Spacing.md },
  horizonRow: { flexDirection: "row", gap: Spacing.sm },
  horizonChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 11,
    borderWidth: 1,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.xl,
  },
});
