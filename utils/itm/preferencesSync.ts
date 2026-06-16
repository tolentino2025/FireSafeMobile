// FASE 9 — Sincroniza as preferências de notificação para o Supabase.
// O servidor (notify-48h, daily-summary) lê de user_notification_preferences;
// sem este sync a tabela fica vazia e o resumo diário nunca dispara.
// Requer Supabase configurado + login. No-op caso contrário (offline-first).
import { supabase, isSupabaseConfigured } from "@/utils/supabase";
import type { ItmNotificationPreferences } from "@/utils/itm/notificationPreferences";

export async function syncItmPreferencesToSupabase(
  prefs: ItmNotificationPreferences,
): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user?.id) return;

    await supabase.from("user_notification_preferences").upsert(
      {
        user_id: user.id,
        email_48h_enabled: prefs.email48hEnabled,
        push_48h_enabled: prefs.push48hEnabled,
        daily_summary_enabled: prefs.dailySummaryEnabled,
        overdue_alert_enabled: prefs.overdueAlertEnabled,
        calendar_sync_enabled: prefs.calendarSyncEnabled,
        default_timezone: prefs.defaultTimezone,
        default_event_start_time: prefs.defaultStartTime,
        default_event_duration_minutes: prefs.defaultDurationMinutes,
        sync_horizon_days: prefs.horizonDays,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  } catch (e) {
    console.warn("[itm] syncItmPreferencesToSupabase falhou:", e);
  }
}
