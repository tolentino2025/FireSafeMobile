import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

function formatDate(date: Date, language: string): string {
  if (language === "pt-BR") {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
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
