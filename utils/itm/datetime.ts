// FASE 0 — Camada de data/hora para notificações e calendário.
// As ocorrências ITM hoje guardam apenas datas (YYYY-MM-DD). Para calendário e
// notificações, derivamos data/hora a partir de `scheduledDate` + horário padrão.
// (A persistência de campos scheduledStartAt/notify48hAt fica para a fase de
//  notificações por servidor; aqui a derivação é a fonte.)

export const DEFAULT_EVENT_TZ = "America/Sao_Paulo";
export const DEFAULT_EVENT_START_HOUR = 8; // 08:00
export const DEFAULT_EVENT_DURATION_MIN = 60; // 60 minutos
export const NOTIFY_OFFSET_HOURS = 48; // lembrete 48h antes

// Formata um local date-time "flutuante" no padrão iCalendar: YYYYMMDDTHHMMSS.
function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Recebe "YYYY-MM-DD" e devolve { start, end } no formato iCal (hora local flutuante).
export function occurrenceIcsTimes(
  scheduledDate: string,
  startHour: number = DEFAULT_EVENT_START_HOUR,
  durationMin: number = DEFAULT_EVENT_DURATION_MIN,
): { start: string; end: string } {
  const [y, m, d] = scheduledDate.split("-").map((v) => parseInt(v, 10));
  const startMinutesTotal = startHour * 60;
  const endMinutesTotal = startMinutesTotal + durationMin;
  const sh = Math.floor(startMinutesTotal / 60) % 24;
  const sm = startMinutesTotal % 60;
  const eh = Math.floor(endMinutesTotal / 60) % 24;
  const em = endMinutesTotal % 60;
  const day = `${y}${pad(m)}${pad(d)}`;
  return {
    start: `${day}T${pad(sh)}${pad(sm)}00`,
    end: `${day}T${pad(eh)}${pad(em)}00`,
  };
}

// Timestamp UTC atual no formato iCal: YYYYMMDDTHHMMSSZ.
export function icsNowUtc(): string {
  const d = new Date();
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}
