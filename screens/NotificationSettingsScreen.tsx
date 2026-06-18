import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Switch,
  Pressable,
  ScrollView,
  Share,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

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
import {
  getSavedCalendarFeedUrl,
  createCalendarFeed,
  revokeCalendarFeed,
  isLoggedIn,
} from "@/utils/itm/calendarFeed";
import { showAlert, showConfirm } from "@/utils/appAlert";
import { syncItmPreferencesToSupabase } from "@/utils/itm/preferencesSync";
import { registerForItmPush, deactivateItmPush } from "@/utils/itm/pushTokens";

export default function NotificationSettingsScreen() {
  const { fullTheme } = useTheme();
  const { language } = useLanguage();
  const { occurrences } = useITM();
  const pt = language === "pt-BR";
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();

  const [prefs, setPrefs] = useState<ItmNotificationPreferences>(
    DEFAULT_ITM_NOTIFICATION_PREFERENCES,
  );
  const [loggedIn, setLoggedIn] = useState(false);
  const [feedUrl, setFeedUrl] = useState<string | null>(null);
  const [feedBusy, setFeedBusy] = useState(false);

  useEffect(() => {
    getItmNotificationPreferences().then((p) => {
      setPrefs(p);
      // Garante que o servidor tenha as preferências atuais (e-mail/resumo diário).
      syncItmPreferencesToSupabase(p).catch(() => {});
    });
    isLoggedIn().then(setLoggedIn);
    getSavedCalendarFeedUrl().then(setFeedUrl);
  }, []);

  const handleCreateFeed = async () => {
    setFeedBusy(true);
    try {
      const { feedUrl: url } = await createCalendarFeed();
      setFeedUrl(url);
      showAlert(
        pt ? "Link gerado" : "Link created",
        pt
          ? "Copie o link e adicione/assine como um calendário no Google, Apple ou Outlook. Ele atualiza sozinho."
          : "Copy the link and subscribe to it as a calendar in Google, Apple or Outlook. It updates automatically.",
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      showAlert(
        pt ? "Erro" : "Error",
        msg.includes("Failed to send a request") || msg.includes("Edge Function")
          ? pt
            ? "Não foi possível conectar ao servidor. O link de calendário requer que as Edge Functions estejam ativas no Supabase."
            : "Could not connect to the server. The calendar link requires Edge Functions to be active in Supabase."
          : msg,
      );
    } finally {
      setFeedBusy(false);
    }
  };

  const handleCopyFeed = async () => {
    if (!feedUrl) return;
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(feedUrl);
      showAlert(pt ? "Copiado" : "Copied", feedUrl);
    } else {
      await Share.share({ message: feedUrl });
    }
  };

  const handleRevokeFeed = () => {
    showConfirm(
      pt ? "Revogar link?" : "Revoke link?",
      pt
        ? "Os calendários que usam este link param de atualizar. Você pode gerar um novo depois."
        : "Calendars using this link will stop updating. You can generate a new one later.",
      async () => {
        setFeedBusy(true);
        try {
          await revokeCalendarFeed();
          setFeedUrl(null);
        } catch (e: unknown) {
          showAlert(
            pt ? "Erro" : "Error",
            e instanceof Error ? e.message : String(e),
          );
        } finally {
          setFeedBusy(false);
        }
      },
      { destructive: true },
    );
  };

  const update = async (patch: Partial<ItmNotificationPreferences>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    await saveItmNotificationPreferences(next);
    // Se mexeu no push: lembrete local + registro de push remoto (mobile/login).
    if ("push48hEnabled" in patch) {
      syncItmLocalReminders(occurrences).catch(() => {});
      if (next.push48hEnabled) {
        registerForItmPush().then((reason) => {
          if (reason === "projectId") {
            showAlert(
              pt ? "Push remoto" : "Remote push",
              pt
                ? "O lembrete local foi ativado. O push remoto (servidor) requer um build do app (EAS) — será ativado automaticamente quando o app for publicado."
                : "Local reminder enabled. Remote push (server) requires an app build (EAS) — it will activate automatically once the app is published.",
            );
          }
        });
      } else {
        deactivateItmPush().catch(() => {});
      }
    }
    // Espelha as preferências no Supabase (servidor lê para e-mail/resumo diário).
    syncItmPreferencesToSupabase(next).catch(() => {});
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
        left={
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Feather name="chevron-left" size={26} color={fullTheme.colors.textPrimary} />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="h4" style={styles.sectionTitle}>
          {pt ? "Notificações" : "Notifications"}
        </ThemedText>

        <Toggle
          label={pt ? "Receber e-mail 48h antes" : "Email 48h before"}
          desc={pt ? "Requer login (envio pelo servidor)" : "Requires login (sent by server)"}
          value={prefs.email48hEnabled}
          onChange={(v) => update({ email48hEnabled: v })}
        />
        <Toggle
          label={pt ? "Receber push no celular" : "Push on phone"}
          desc={
            pt
              ? "Lembrete local + push remoto 48h antes (mobile)"
              : "Local + remote push 48h before (mobile)"
          }
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
          desc={
            pt
              ? "E-mail diário com vencidas e a vencer (requer login)"
              : "Daily email with overdue and upcoming (requires login)"
          }
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

        {loggedIn ? (
          <>
            <ThemedText type="h4" style={styles.sectionTitle}>
              {pt ? "Calendário assinável (link)" : "Subscribable calendar (link)"}
            </ThemedText>
            <ThemedText type="small" secondary style={{ marginBottom: Spacing.sm }}>
              {pt
                ? "Gere um link e assine-o no Google/Apple/Outlook. O calendário atualiza sozinho conforme sua agenda ITM muda."
                : "Generate a link and subscribe to it in Google/Apple/Outlook. The calendar updates automatically as your ITM schedule changes."}
            </ThemedText>

            {feedUrl ? (
              <>
                <View
                  style={[
                    styles.urlBox,
                    { backgroundColor: fullTheme.colors.surfaceAlt, borderColor: fullTheme.colors.border },
                  ]}
                >
                  <ThemedText type="small" mono style={{ fontSize: 12 }} numberOfLines={2}>
                    {feedUrl}
                  </ThemedText>
                </View>
                <View style={styles.feedActions}>
                  <Pressable
                    onPress={handleCopyFeed}
                    style={[styles.feedBtn, { backgroundColor: fullTheme.colors.primary }]}
                  >
                    <Feather name="copy" size={15} color="#FFFFFF" />
                    <ThemedText type="small" style={styles.feedBtnLabel}>
                      {pt ? "Copiar / Compartilhar" : "Copy / Share"}
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={handleRevokeFeed}
                    disabled={feedBusy}
                    style={[styles.feedBtn, { backgroundColor: fullTheme.colors.surface, borderColor: fullTheme.colors.border, borderWidth: 1 }]}
                  >
                    <Feather name="x-circle" size={15} color={fullTheme.colors.textPrimary} />
                    <ThemedText type="small" style={{ marginLeft: 6, fontWeight: "600" }}>
                      {pt ? "Revogar" : "Revoke"}
                    </ThemedText>
                  </Pressable>
                </View>
              </>
            ) : (
              <Pressable
                onPress={handleCreateFeed}
                disabled={feedBusy}
                style={[styles.feedBtn, { backgroundColor: fullTheme.colors.primary, opacity: feedBusy ? 0.6 : 1 }]}
              >
                <Feather name="link" size={15} color="#FFFFFF" />
                <ThemedText type="small" style={styles.feedBtnLabel}>
                  {feedBusy
                    ? pt
                      ? "Gerando..."
                      : "Generating..."
                    : pt
                      ? "Gerar link de calendário"
                      : "Generate calendar link"}
                </ThemedText>
              </Pressable>
            )}
          </>
        ) : null}

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
  content: { padding: Spacing.lg },
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
  urlBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  feedActions: { flexDirection: "row", gap: Spacing.sm },
  feedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    flex: 1,
  },
  feedBtnLabel: { color: "#FFFFFF", fontWeight: "600", marginLeft: 6 },
});
