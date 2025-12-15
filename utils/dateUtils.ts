export function getLocalTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

export function formatDateWithTimezone(dateString: string, language: "pt-BR" | "en"): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const timeZone = getLocalTimeZone();
  
  return date.toLocaleDateString(language === "pt-BR" ? "pt-BR" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone,
  });
}

export function formatShortDateWithTimezone(dateString: string, language: "pt-BR" | "en"): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const timeZone = getLocalTimeZone();
  
  return date.toLocaleDateString(language === "pt-BR" ? "pt-BR" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone,
  });
}

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLocalISOString(date: Date = new Date()): string {
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - tzOffset);
  return localDate.toISOString();
}
