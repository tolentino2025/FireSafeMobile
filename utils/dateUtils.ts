import * as Localization from "expo-localization";

export function getLocalTimeZone(): string {
  try {
    const calendars = Localization.getCalendars();
    if (calendars && calendars.length > 0 && calendars[0].timeZone) {
      return calendars[0].timeZone;
    }
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }
}

export function getDeviceLocale(): string {
  try {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      return locales[0].languageTag || locales[0].languageCode || "pt-BR";
    }
  } catch {
    return "pt-BR";
  }
  return "pt-BR";
}

export function formatDateWithTimezone(
  dateString: string, 
  language: "pt-BR" | "en",
  customTimezone?: string
): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const timeZone = customTimezone || getLocalTimeZone();
  
  return date.toLocaleDateString(language === "pt-BR" ? "pt-BR" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone,
  });
}

export function formatShortDateWithTimezone(
  dateString: string, 
  language: "pt-BR" | "en",
  customTimezone?: string
): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const timeZone = customTimezone || getLocalTimeZone();
  
  return date.toLocaleDateString(language === "pt-BR" ? "pt-BR" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone,
  });
}

export function formatDateTimeWithTimezone(
  dateString: string, 
  language: "pt-BR" | "en",
  customTimezone?: string
): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const timeZone = customTimezone || getLocalTimeZone();
  
  return date.toLocaleString(language === "pt-BR" ? "pt-BR" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  });
}

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalYMD(ymd: string): Date {
  if (!ymd || typeof ymd !== 'string') {
    return new Date();
  }
  const parts = ymd.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month - 1, day, 12, 0, 0);
    }
  }
  const parsed = new Date(ymd);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function getLocalISOString(date: Date = new Date()): string {
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - tzOffset);
  return localDate.toISOString();
}

export function getCurrentTimezoneInfo(): { timezone: string; offset: string; region: string } {
  const timezone = getLocalTimeZone();
  const now = new Date();
  const offset = now.toLocaleTimeString("en-US", { 
    timeZone: timezone, 
    timeZoneName: "shortOffset" 
  }).split(" ").pop() || "";
  
  const region = timezone.split("/").pop()?.replace(/_/g, " ") || timezone;
  
  return { timezone, offset, region };
}
