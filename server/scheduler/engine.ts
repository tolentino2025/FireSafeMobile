// Motor de agendamento ITM (drift-safe).
// Trabalha com Date internamente, mas expoe helpers em string YYYY-MM-DD.
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  format,
  getDay,
  isAfter,
  parseISO,
} from "date-fns";

export type FrequencyUnit = "day" | "week" | "month" | "year";

export interface Ocorrencia<T> {
  dueDate: T;
  scheduledDate: T;
  windowStart: T;
  windowEnd: T;
}

// Converte Date -> string YYYY-MM-DD (granularidade dia).
export function toISODate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

// Converte string YYYY-MM-DD -> Date.
export function fromISODate(s: string): Date {
  return parseISO(s);
}

// Soma um intervalo (unit x count) a uma data.
export function addInterval(d: Date, unit: FrequencyUnit, count: number): Date {
  switch (unit) {
    case "day":
      return addDays(d, count);
    case "week":
      return addWeeks(d, count);
    case "month":
      return addMonths(d, count);
    case "year":
      return addYears(d, count);
    default: {
      const _exhaustivo: never = unit;
      throw new Error(`Unidade de frequencia invalida: ${_exhaustivo}`);
    }
  }
}

// Avanca a data enquanto cair em fim de semana ou feriado (chave YYYY-MM-DD).
export function toBusinessDay(d: Date, holidays: Set<string>): Date {
  let atual = d;
  // getDay: 0 = domingo, 6 = sabado.
  while (
    getDay(atual) === 0 ||
    getDay(atual) === 6 ||
    holidays.has(toISODate(atual))
  ) {
    atual = addDays(atual, 1);
  }
  return atual;
}

export interface GerarOpcoes {
  startDate: Date;
  unit: FrequencyUnit;
  count: number;
  toleranceDays: number;
  horizonEnd: Date;
  holidays: Set<string>;
  // Se true, a primeira ocorrencia eh a propria startDate (n comeca em 0).
  firstDueIsStart?: boolean;
}

// Gera ocorrencias DRIFT-SAFE: due = addInterval(startDate, unit, count * n)
// sempre derivado da ancora teorica, nunca incrementando um cursor.
export function generateOccurrences(
  opts: GerarOpcoes,
): Ocorrencia<Date>[] {
  const {
    startDate,
    unit,
    count,
    toleranceDays,
    horizonEnd,
    holidays,
    firstDueIsStart = false,
  } = opts;

  const resultado: Ocorrencia<Date>[] = [];
  let n = firstDueIsStart ? 0 : 1;
  // Trava de seguranca contra loop infinito.
  const MAX = 100000;

  while (n < MAX) {
    const due = addInterval(startDate, unit, count * n);
    if (isAfter(due, horizonEnd)) {
      break;
    }
    const scheduledDate = toBusinessDay(due, holidays);
    const windowStart = addDays(due, -toleranceDays);
    const windowEnd = addDays(due, toleranceDays);
    resultado.push({ dueDate: due, scheduledDate, windowStart, windowEnd });
    n += 1;
  }

  return resultado;
}

export interface GerarOpcoesString {
  startDate: string;
  unit: FrequencyUnit;
  count: number;
  toleranceDays: number;
  horizonEnd: string;
  holidays?: Set<string> | string[];
  firstDueIsStart?: boolean;
}

// Versao string-based: recebe/devolve datas como YYYY-MM-DD.
// Usada pela camada de persistencia e pelos testes de cobertura.
export function gerarOcorrencias(
  opts: GerarOpcoesString,
): Ocorrencia<string>[] {
  const holidays =
    opts.holidays instanceof Set
      ? opts.holidays
      : new Set(opts.holidays ?? []);

  const datas = generateOccurrences({
    startDate: fromISODate(opts.startDate),
    unit: opts.unit,
    count: opts.count,
    toleranceDays: opts.toleranceDays,
    horizonEnd: fromISODate(opts.horizonEnd),
    holidays,
    firstDueIsStart: opts.firstDueIsStart,
  });

  return datas.map((o) => ({
    dueDate: toISODate(o.dueDate),
    scheduledDate: toISODate(o.scheduledDate),
    windowStart: toISODate(o.windowStart),
    windowEnd: toISODate(o.windowEnd),
  }));
}
