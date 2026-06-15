// FASE 3 — Preferências de notificação/calendário do usuário (persistência local).
// Quando o Supabase/Auth entrar, estas preferências sincronizam com a tabela
// user_notification_preferences. Por ora, ficam em AsyncStorage (offline-first).
import AsyncStorage from "@react-native-async-storage/async-storage";

export type HorizonDays = 30 | 60 | 90;

export interface ItmNotificationPreferences {
  email48hEnabled: boolean;
  push48hEnabled: boolean;
  dailySummaryEnabled: boolean;
  overdueAlertEnabled: boolean;
  calendarSyncEnabled: boolean;
  defaultTimezone: string;
  defaultStartTime: string; // "HH:MM"
  defaultDurationMinutes: number;
  horizonDays: HorizonDays;
}

export const DEFAULT_ITM_NOTIFICATION_PREFERENCES: ItmNotificationPreferences = {
  email48hEnabled: true,
  push48hEnabled: false,
  dailySummaryEnabled: false,
  overdueAlertEnabled: true,
  calendarSyncEnabled: false,
  defaultTimezone: "America/Sao_Paulo",
  defaultStartTime: "08:00",
  defaultDurationMinutes: 60,
  horizonDays: 90,
};

const PREFS_KEY = "@firesafe_itm_notification_prefs";

export async function getItmNotificationPreferences(): Promise<ItmNotificationPreferences> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_ITM_NOTIFICATION_PREFERENCES };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_ITM_NOTIFICATION_PREFERENCES, ...parsed };
  } catch {
    return { ...DEFAULT_ITM_NOTIFICATION_PREFERENCES };
  }
}

export async function saveItmNotificationPreferences(
  prefs: ItmNotificationPreferences,
): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
