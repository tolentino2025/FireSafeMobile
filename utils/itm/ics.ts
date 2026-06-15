// FASE 1 — Geração de arquivo .ics (iCalendar) universal a partir das ocorrências ITM.
// Funciona em Google Calendar, Apple Calendar, Outlook, Android, iOS e web.
// O app continua sendo a fonte oficial; o .ics é apenas uma cópia para lembrete.
import { Platform } from "react-native";
import * as Sharing from "expo-sharing";
import type { ItmOccurrence } from "@/contexts/ITMContext";
import { rotuloSistema, rotuloFrequencia } from "@/utils/itm/labels";
import {
  occurrenceIcsTimes,
  icsNowUtc,
  NOTIFY_OFFSET_HOURS,
} from "@/utils/itm/datetime";

type Idioma = "pt-BR" | "en";

export interface IcsBuildOptions {
  propertyName: string;
  language: Idioma;
  // Horizonte em dias (padrão 90). Ocorrências com dueDate fora do horizonte são ignoradas.
  horizonDays?: number;
  // Base URL para deep link (opcional).
  appUrl?: string;
}

// Escapa caracteres especiais conforme RFC 5545.
function esc(text: string): string {
  return (text || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

// Monta o conteúdo .ics (VCALENDAR + VEVENTs) das ocorrências dentro do horizonte.
export function buildItmIcs(
  occurrences: ItmOccurrence[],
  opts: IcsBuildOptions,
): string {
  const horizon = opts.horizonDays ?? 90;
  const hoje = todayISO();
  const limite = addDaysISO(hoje, horizon);
  const dtstamp = icsNowUtc();

  const lembreteLabel =
    opts.language === "pt-BR" ? "Lembrete ITM 48h" : "ITM reminder 48h";

  const events: string[] = [];
  for (const occ of occurrences) {
    // Só ocorrências não concluídas dentro do horizonte (hoje..hoje+N).
    if (occ.completedAt) continue;
    if (occ.dueDate < hoje || occ.dueDate > limite) continue;

    const { start, end } = occurrenceIcsTimes(occ.scheduledDate || occ.dueDate);
    const sistema = rotuloSistema(occ.system, opts.language);
    const freq = rotuloFrequencia(occ.frequency, opts.language);
    const uid = `${occ.id}@firesafeitm`;

    const summary =
      opts.language === "pt-BR"
        ? `ITM — ${occ.description}`
        : `ITM — ${occ.description}`;

    const descLines =
      opts.language === "pt-BR"
        ? [
            `Propriedade: ${opts.propertyName}`,
            `Sistema: ${sistema}`,
            `Atividade: ${occ.description}`,
            `Periodicidade: ${freq}`,
            `Vencimento: ${occ.dueDate}`,
            `Fonte oficial: FireSafe ITM (a agenda oficial é controlada pelo app).`,
          ]
        : [
            `Property: ${opts.propertyName}`,
            `System: ${sistema}`,
            `Activity: ${occ.description}`,
            `Frequency: ${freq}`,
            `Due: ${occ.dueDate}`,
            `Official source: FireSafe ITM (the official schedule is controlled by the app).`,
          ];
    if (opts.appUrl) {
      descLines.push(`${opts.appUrl}/agenda/occurrence/${occ.id}`);
    }

    events.push(
      [
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${esc(summary)}`,
        `DESCRIPTION:${esc(descLines.join("\n"))}`,
        `LOCATION:${esc(opts.propertyName)}`,
        "STATUS:CONFIRMED",
        "BEGIN:VALARM",
        `TRIGGER:-PT${NOTIFY_OFFSET_HOURS}H`,
        "ACTION:DISPLAY",
        `DESCRIPTION:${esc(lembreteLabel)}`,
        "END:VALARM",
        "END:VEVENT",
      ].join("\r\n"),
    );
  }

  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FireSafe ITM//NFPA 25//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:FireSafe ITM — ${esc(opts.propertyName)}`,
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  return calendar;
}

// Baixa (web) ou compartilha (nativo) o conteúdo .ics.
export async function downloadOrShareIcs(
  filename: string,
  content: string,
): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof document === "undefined") return;
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }

  // Nativo: escreve em arquivo (requer expo-file-system) e abre o share sheet.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const FileSystem = require("expo-file-system");
    const uri = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(uri, content, {
      encoding: FileSystem.EncodingType?.UTF8 ?? "utf8",
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "text/calendar",
        UTI: "com.apple.ical.ics",
        dialogTitle: filename,
      });
    }
  } catch (e) {
    console.warn(
      "[ics] compartilhamento nativo requer expo-file-system instalado:",
      e,
    );
  }
}
