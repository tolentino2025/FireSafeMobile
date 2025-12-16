import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseLocalYMD } from "@/utils/dateUtils";

const NOTIFICATION_SETTINGS_KEY = "@firesafe_notification_settings";

interface NotificationSettings {
  enabled: boolean;
  reminderDaysBefore: number;
}

const defaultSettings: NotificationSettings = {
  enabled: false,
  reminderDaysBefore: 1,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return defaultSettings;
  } catch (error) {
    console.error("Error getting notification settings:", error);
    return defaultSettings;
  }
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving notification settings:", error);
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === "granted") {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function checkNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

interface ScheduleInspectionReminderParams {
  inspectionId: string;
  propertyName: string;
  inspectionType: string;
  scheduledDate: Date;
  language: "en" | "pt-BR";
}

const translations = {
  en: {
    title: "Upcoming Inspection",
    body: "You have an inspection scheduled for",
    overdueTitle: "Overdue Inspection",
    overdueBody: "The inspection is overdue",
  },
  "pt-BR": {
    title: "Inspeção Agendada",
    body: "Você tem uma inspeção agendada para",
    overdueTitle: "Inspeção Atrasada",
    overdueBody: "A inspeção está atrasada",
  },
};

export async function scheduleInspectionReminder(
  params: ScheduleInspectionReminderParams
): Promise<string | null> {
  const { inspectionId, propertyName, inspectionType, scheduledDate, language } = params;
  const t = translations[language];

  if (Platform.OS === "web") {
    console.log("Notifications not supported on web");
    return null;
  }

  const hasPermission = await checkNotificationPermissions();
  if (!hasPermission) {
    console.log("Notification permissions not granted");
    return null;
  }

  const settings = await getNotificationSettings();
  if (!settings.enabled) {
    return null;
  }

  const reminderDate = new Date(scheduledDate);
  reminderDate.setDate(reminderDate.getDate() - settings.reminderDaysBefore);
  reminderDate.setHours(9, 0, 0, 0);

  if (reminderDate <= new Date()) {
    console.log("Reminder date is in the past, skipping");
    return null;
  }

  try {
    await cancelInspectionReminder(inspectionId);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${t.title}: ${propertyName}`,
        body: `${t.body} ${formatDate(scheduledDate, language)} - ${inspectionType}`,
        data: { inspectionId, type: "inspection_reminder" },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      },
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return null;
  }
}

export async function cancelInspectionReminder(inspectionIdOrNotificationId: string, byNotificationId = false): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    if (byNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(inspectionIdOrNotificationId);
    } else {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const toCancel = scheduledNotifications.filter(
        (n) => n.content.data?.inspectionId === inspectionIdOrNotificationId
      );

      for (const notification of toCancel) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error("Error canceling notification:", error);
  }
}

export async function cancelAllInspectionReminders(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error canceling all notifications:", error);
  }
}

export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  if (Platform.OS === "web") {
    return [];
  }

  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error getting scheduled notifications:", error);
    return [];
  }
}

function getLocalTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

function formatDate(date: Date, language: string): string {
  const timeZone = getLocalTimeZone();
  
  if (language === "pt-BR") {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone,
    });
  }
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  });
}

export async function sendTestNotification(language: "en" | "pt-BR"): Promise<void> {
  if (Platform.OS === "web") {
    console.log("Notifications not supported on web");
    return;
  }

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    throw new Error("Notification permissions not granted");
  }

  const t = translations[language];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "FireSafe ITM",
      body: language === "pt-BR" 
        ? "Notificações configuradas com sucesso!" 
        : "Notifications configured successfully!",
      data: { type: "test" },
      sound: true,
    },
    trigger: null,
  });
}

interface ScheduleNotificationParams {
  scheduleId: string;
  inspectionType: string;
  frequency: string;
  nextDueDate: Date;
  companyName?: string;
  propertyName?: string;
  language: "en" | "pt-BR";
}

const scheduleTranslations = {
  en: {
    title: "Scheduled Inspection",
    body: "inspection is due today",
    dueFor: "Due for",
  },
  "pt-BR": {
    title: "Inspeção Programada",
    body: "está programada para hoje",
    dueFor: "Vence em",
  },
};

export async function scheduleNotificationForSchedule(
  params: ScheduleNotificationParams
): Promise<string | null> {
  const { scheduleId, inspectionType, frequency, nextDueDate, companyName, propertyName, language } = params;
  const t = scheduleTranslations[language];

  if (Platform.OS === "web") {
    console.log("Notifications not supported on web");
    return null;
  }

  const hasPermission = await checkNotificationPermissions();
  if (!hasPermission) {
    console.log("Notification permissions not granted");
    return null;
  }

  const settings = await getNotificationSettings();
  if (!settings.enabled) {
    return null;
  }

  const reminderDate = typeof nextDueDate === 'string' ? parseLocalYMD(nextDueDate) : new Date(nextDueDate);
  reminderDate.setDate(reminderDate.getDate() - settings.reminderDaysBefore);
  reminderDate.setHours(9, 0, 0, 0);

  if (reminderDate <= new Date()) {
    console.log("Reminder date is in the past, skipping schedule notification");
    return null;
  }

  try {
    await cancelScheduleNotification(scheduleId);

    const locationInfo = propertyName || companyName || "";
    const bodyText = locationInfo 
      ? `${frequency} ${inspectionType} - ${locationInfo} ${t.body}`
      : `${frequency} ${inspectionType} ${t.body}`;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: t.title,
        body: bodyText,
        data: { scheduleId, type: "schedule_reminder" },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      },
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling notification for schedule:", error);
    return null;
  }
}

export async function cancelScheduleNotification(scheduleId: string): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const toCancel = scheduledNotifications.filter(
      (n) => n.content.data?.scheduleId === scheduleId
    );

    for (const notification of toCancel) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    console.error("Error canceling schedule notification:", error);
  }
}

export async function rescheduleAllScheduleNotifications(
  schedules: Array<{
    id: string;
    inspectionType: string;
    frequency: string;
    nextDueDate: string;
    companyId?: string;
    propertyId?: string;
    isActive: boolean;
  }>,
  companies: Array<{ id: string; name: string }>,
  properties: Array<{ id: string; name: string }>,
  language: "en" | "pt-BR"
): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  for (const schedule of schedules) {
    if (!schedule.isActive) continue;

    const company = schedule.companyId ? companies.find(c => c.id === schedule.companyId) : undefined;
    const property = schedule.propertyId ? properties.find(p => p.id === schedule.propertyId) : undefined;

    await scheduleNotificationForSchedule({
      scheduleId: schedule.id,
      inspectionType: schedule.inspectionType,
      frequency: schedule.frequency,
      nextDueDate: parseLocalYMD(schedule.nextDueDate),
      companyName: company?.name,
      propertyName: property?.name,
      language,
    });
  }
}

const licenseTranslations = {
  en: {
    expiringTitle: "License Expiring Soon",
    expiringBody: "Your FireSafe ITM license will expire in",
    days: "days",
    day: "day",
    renewPrompt: "Please renew to continue using the app.",
    expiredTitle: "License Expired",
    expiredBody: "Your FireSafe ITM license has expired. Please renew to continue.",
  },
  "pt-BR": {
    expiringTitle: "Licença Expirando",
    expiringBody: "Sua licença do FireSafe ITM expirará em",
    days: "dias",
    day: "dia",
    renewPrompt: "Por favor, renove para continuar usando o aplicativo.",
    expiredTitle: "Licença Expirada",
    expiredBody: "Sua licença do FireSafe ITM expirou. Por favor, renove para continuar.",
  },
};

const LICENSE_NOTIFICATION_ID_PREFIX = "license_expiration_";

interface ScheduleLicenseExpirationParams {
  expirationDate: string;
  language: "en" | "pt-BR";
}

export async function scheduleLicenseExpirationReminders(
  params: ScheduleLicenseExpirationParams
): Promise<string[]> {
  const { expirationDate, language } = params;
  const t = licenseTranslations[language];
  const notificationIds: string[] = [];

  if (Platform.OS === "web") {
    console.log("Notifications not supported on web");
    return notificationIds;
  }

  const hasPermission = await checkNotificationPermissions();
  if (!hasPermission) {
    console.log("Notification permissions not granted");
    return notificationIds;
  }

  const settings = await getNotificationSettings();
  if (!settings.enabled) {
    return notificationIds;
  }

  await cancelLicenseExpirationReminders();

  const expDate = parseLocalYMD(expirationDate);
  const now = new Date();

  const reminderDays = [30, 14, 7, 3, 1];

  try {
    for (const daysBeforeExpiration of reminderDays) {
      const reminderDate = new Date(expDate);
      reminderDate.setDate(reminderDate.getDate() - daysBeforeExpiration);
      reminderDate.setHours(9, 0, 0, 0);

      if (reminderDate > now) {
        const dayText = daysBeforeExpiration === 1 ? t.day : t.days;
        const bodyText = `${t.expiringBody} ${daysBeforeExpiration} ${dayText}. ${t.renewPrompt}`;

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: t.expiringTitle,
            body: bodyText,
            data: { type: "license_expiration", daysBeforeExpiration },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminderDate,
          },
        });

        notificationIds.push(notificationId);
      }
    }
  } catch (error) {
    console.error("Error scheduling license expiration reminders:", error);
  }

  return notificationIds;
}

export async function cancelLicenseExpirationReminders(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const toCancel = scheduledNotifications.filter(
      (n) => n.content.data?.type === "license_expiration"
    );

    for (const notification of toCancel) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    console.error("Error canceling license expiration reminders:", error);
  }
}
