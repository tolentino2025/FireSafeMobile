// FASE 2 — Lembretes LOCAIS no dispositivo (48h antes) via expo-notifications.
// Complementar ao e-mail (que virá no backend). Mobile-only: no web é no-op.
// O app continua a fonte oficial; isto é só um lembrete no aparelho.
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { ItmOccurrence } from "@/contexts/ITMContext";
import {
  getItmNotificationPreferences,
  type ItmNotificationPreferences,
} from "@/utils/itm/notificationPreferences";
import { NOTIFY_OFFSET_HOURS } from "@/utils/itm/datetime";

const ITM_REMINDER_PREFIX = "itm-reminder-";
// Limite de lembretes locais agendados (iOS limita ~64 pendentes no total).
const MAX_LOCAL_REMINDERS = 20;

// Momento de disparo do lembrete: data agendada às HH:MM padrão, menos 48h.
function reminderFireDate(
  occ: ItmOccurrence,
  prefs: ItmNotificationPreferences,
): Date {
  const baseDate = occ.scheduledDate || occ.dueDate; // YYYY-MM-DD
  const [hh, mm] = (prefs.defaultStartTime || "08:00")
    .split(":")
    .map((v) => parseInt(v, 10));
  const d = new Date(`${baseDate}T00:00:00`);
  d.setHours(hh || 8, mm || 0, 0, 0);
  d.setHours(d.getHours() - NOTIFY_OFFSET_HOURS);
  return d;
}

export async function cancelItmLocalReminders(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((n) => (n.identifier || "").startsWith(ITM_REMINDER_PREFIX))
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
  } catch {
    /* noop */
  }
}

// Reagenda os lembretes locais das próximas ocorrências (48h antes).
// Chamado quando as ocorrências mudam (mobile-only, se push habilitado).
export async function syncItmLocalReminders(
  occurrences: ItmOccurrence[],
): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const prefs = await getItmNotificationPreferences();
    if (!prefs.push48hEnabled) {
      await cancelItmLocalReminders();
      return;
    }

    const perm = await Notifications.getPermissionsAsync();
    if (perm.status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      if (req.status !== "granted") return;
    }

    await cancelItmLocalReminders();

    const now = Date.now();
    const upcoming = occurrences
      .filter((o) => !o.completedAt)
      .map((o) => ({ o, fireAt: reminderFireDate(o, prefs) }))
      .filter((x) => x.fireAt.getTime() > now)
      .sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime())
      .slice(0, MAX_LOCAL_REMINDERS);

    for (const { o, fireAt } of upcoming) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${ITM_REMINDER_PREFIX}${o.id}`,
        content: {
          title: "FireSafe ITM",
          body: `Vence em 48h: ${o.description}`,
          data: { occurrenceId: o.id, planId: o.planId, type: "itm-48h" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireAt,
        },
      });
    }
  } catch (e) {
    console.warn("[itm] syncItmLocalReminders falhou:", e);
  }
}
