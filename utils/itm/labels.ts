// Rotulos legiveis (pt/en) para chaves de sistema usadas nos templates ITM.
// Mantido em sincronia com o mapa SYSTEM_LABELS de scripts/generate-app-templates.ts.
import { ITM_TEMPLATES } from "@/constants/itmTemplates";

type Idioma = "pt-BR" | "en";

const SYSTEM_LABELS: Record<string, { pt: string; en: string }> = {
  wet_pipe: { pt: "Sprinkler Tubo Molhado", en: "Wet Pipe Sprinkler" },
  dry_pipe: { pt: "Sprinkler Tubo Seco", en: "Dry Pipe Sprinkler" },
  preaction_deluge: { pt: "Pré-Ação/Dilúvio", en: "Preaction/Deluge" },
  foam_water: { pt: "Espuma-Água", en: "Foam-Water" },
  water_spray: { pt: "Spray de Água", en: "Water Spray" },
  water_mist: { pt: "Neblina de Água", en: "Water Mist" },
  fire_pump: { pt: "Bomba de Incêndio", en: "Fire Pump" },
  standpipe_and_hose: { pt: "Coluna e Mangueira", en: "Standpipe and Hose" },
  private_fire_service_mains: {
    pt: "Redes Privadas de Incêndio",
    en: "Private Fire Service Mains",
  },
  water_storage_tank: {
    pt: "Tanque de Armazenamento de Água",
    en: "Water Storage Tank",
  },
};

// Rotulos de frequencia normativa (chave usada nos templates -> texto legivel).
const FREQUENCY_LABELS: Record<string, { pt: string; en: string }> = {
  weekly: { pt: "Semanal", en: "Weekly" },
  monthly: { pt: "Mensal", en: "Monthly" },
  quarterly: { pt: "Trimestral", en: "Quarterly" },
  semiannual: { pt: "Semestral", en: "Semiannual" },
  annual: { pt: "Anual", en: "Annual" },
  "5year": { pt: "Quinquenal (5 anos)", en: "Every 5 years" },
  "3year": { pt: "Trienal (3 anos)", en: "Every 3 years" },
  "10year": { pt: "Decenal (10 anos)", en: "Every 10 years" },
  daily: { pt: "Diária", en: "Daily" },
};

// Rotulo de um sistema no idioma escolhido (fallback = a propria key).
export function rotuloSistema(systemKey: string, idioma: Idioma): string {
  const l = SYSTEM_LABELS[systemKey];
  if (!l) return systemKey;
  return idioma === "pt-BR" ? l.pt : l.en;
}

// Rotulo de uma frequencia no idioma escolhido (fallback = a propria key).
export function rotuloFrequencia(frequency: string, idioma: Idioma): string {
  const l = FREQUENCY_LABELS[frequency];
  if (!l) return frequency;
  return idioma === "pt-BR" ? l.pt : l.en;
}

// Ordem canonica das periodicidades (do mais curto ao mais longo).
const FREQUENCY_ORDER: string[] = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "bimonthly",
  "quarterly",
  "semiannual",
  "annual",
  "3year",
  "5year",
  "10year",
];

// Peso para ordenacao (frequencias desconhecidas vao para o fim).
export function ordemFrequencia(frequency: string): number {
  const i = FREQUENCY_ORDER.indexOf(frequency);
  return i === -1 ? FREQUENCY_ORDER.length : i;
}

// Lista de sistemas distintos presentes nos templates, com rotulo.
export function sistemasDisponiveis(
  idioma: Idioma,
): { key: string; label: string }[] {
  const keys = Array.from(new Set(ITM_TEMPLATES.map((t) => t.system)));
  return keys
    .map((key) => ({ key, label: rotuloSistema(key, idioma) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
