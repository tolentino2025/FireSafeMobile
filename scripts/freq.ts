// Mapa de frequencia -> intervalo (unit/count) compartilhado por gap analysis e seed.
import type { FrequencyUnit } from "../server/scheduler/engine";

export type Frequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "annual"
  | "3year"
  | "5year";

export interface Intervalo {
  unit: FrequencyUnit;
  count: number;
}

export const FREQ_INTERVAL: Record<Frequency, Intervalo> = {
  daily: { unit: "day", count: 1 },
  weekly: { unit: "week", count: 1 },
  monthly: { unit: "month", count: 1 },
  quarterly: { unit: "month", count: 3 },
  semiannual: { unit: "month", count: 6 },
  annual: { unit: "year", count: 1 },
  "3year": { unit: "year", count: 3 },
  "5year": { unit: "year", count: 5 },
};
