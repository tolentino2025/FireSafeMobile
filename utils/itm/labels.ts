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

// Rotulo de um sistema no idioma escolhido (fallback = a propria key).
export function rotuloSistema(systemKey: string, idioma: Idioma): string {
  const l = SYSTEM_LABELS[systemKey];
  if (!l) return systemKey;
  return idioma === "pt-BR" ? l.pt : l.en;
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
