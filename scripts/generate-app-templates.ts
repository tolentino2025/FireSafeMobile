// Gera os templates agendaveis do app (constants/itmTemplates.ts) a partir do golden.
// AGREGA os 1005 itens granulares do golden por (system x activity x frequency),
// produzindo UM template agendavel por grupo. Dados sao EMBUTIDOS no arquivo gerado,
// para que o app NAO precise ler YAML em runtime.
//
// Rodar com: npm run scheduler:app-templates
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { FREQ_INTERVAL, type Frequency } from "./freq";
import type { FrequencyUnit } from "../server/scheduler/engine";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CAMINHO_GOLDEN = resolve(RAIZ, "docs/normas/golden.nfpa25.yaml");
const CAMINHO_SAIDA = resolve(RAIZ, "constants/itmTemplates.ts");

interface GoldenItem {
  id: string;
  system: string;
  activity: string;
  frequency: string;
  text: string;
  rawLine: string;
}

interface Golden {
  edition: string;
  items: GoldenItem[];
}

// Mapa system key (slug) -> rotulo legivel pt/en.
// A key do golden ("Wet Pipe") vira slug ("wet_pipe") e tem rotulos curados.
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

const ACTIVITY_LABELS: Record<string, { pt: string; en: string }> = {
  inspection: { pt: "Inspeção", en: "Inspection" },
  maintenance: { pt: "Manutenção", en: "Maintenance" },
  test: { pt: "Teste", en: "Test" },
};

const FREQUENCY_LABELS: Record<string, { pt: string; en: string }> = {
  daily: { pt: "Diária", en: "Daily" },
  weekly: { pt: "Semanal", en: "Weekly" },
  monthly: { pt: "Mensal", en: "Monthly" },
  quarterly: { pt: "Trimestral", en: "Quarterly" },
  semiannual: { pt: "Semestral", en: "Semiannual" },
  annual: { pt: "Anual", en: "Annual" },
  "3year": { pt: "Trienal (3 anos)", en: "Every 3 Years" },
  "5year": { pt: "Quinquenal (5 anos)", en: "Every 5 Years" },
};

// Converte uma key textual do golden em slug estavel (snake_case).
function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function labelSistema(systemKey: string): { pt: string; en: string } {
  return (
    SYSTEM_LABELS[systemKey] ?? {
      pt: systemKey,
      en: systemKey,
    }
  );
}

function labelAtividade(activity: string): { pt: string; en: string } {
  return ACTIVITY_LABELS[activity] ?? { pt: activity, en: activity };
}

function labelFrequencia(frequency: string): { pt: string; en: string } {
  return FREQUENCY_LABELS[frequency] ?? { pt: frequency, en: frequency };
}

interface AppTemplate {
  key: string;
  system: string; // slug
  activity: string;
  frequency: string;
  intervalUnit: FrequencyUnit;
  intervalCount: number;
  itemCount: number;
  descriptionPt: string;
  descriptionEn: string;
  normativeRef: string;
  sourceRef: string[];
}

function main() {
  const conteudo = readFileSync(CAMINHO_GOLDEN, "utf8");
  const golden = yaml.load(conteudo) as Golden;

  const grupos = new Map<string, AppTemplate>();

  for (const item of golden.items) {
    const systemKey = slug(item.system);
    const activity = item.activity;
    const frequency = item.frequency;

    // Frequencia precisa existir no mapa de intervalos.
    const intervalo = FREQ_INTERVAL[frequency as Frequency];
    if (!intervalo) {
      continue;
    }

    const key = `${systemKey}-${activity}-${frequency}`;

    let grupo = grupos.get(key);
    if (!grupo) {
      const sl = labelSistema(systemKey);
      const al = labelAtividade(activity);
      const fl = labelFrequencia(frequency);
      grupo = {
        key,
        system: systemKey,
        activity,
        frequency,
        intervalUnit: intervalo.unit,
        intervalCount: intervalo.count,
        itemCount: 0,
        descriptionPt: `${al.pt} ${fl.pt} — ${sl.pt}`,
        descriptionEn: `${fl.en} ${al.en} — ${sl.en}`,
        normativeRef: "NFPA 25 (2019), eForms",
        sourceRef: [],
      };
      grupos.set(key, grupo);
    }
    grupo.itemCount += 1;
    grupo.sourceRef.push(item.id);
  }

  // Ordenacao estavel: por key.
  const templates = Array.from(grupos.values()).sort((a, b) =>
    a.key.localeCompare(b.key),
  );

  const totalItens = templates.reduce((acc, t) => acc + t.itemCount, 0);

  const cabecalho = `// ARQUIVO GERADO AUTOMATICAMENTE — NAO EDITAR A MAO.
// Gerado por scripts/generate-app-templates.ts (npm run scheduler:app-templates).
// Agrega o golden NFPA 25 (docs/normas/golden.nfpa25.yaml) por (system x activity x frequency).
// Templates: ${templates.length} | Itens do golden cobertos: ${totalItens}.
import type { FrequencyUnit } from "@/server/scheduler/engine";

export interface ItmTemplate {
  /** Chave estavel do template (ex.: "wet_pipe-inspection-weekly"). */
  key: string;
  /** Slug do sistema (ex.: "wet_pipe"). */
  system: string;
  /** Atividade ITM: inspection | maintenance | test. */
  activity: string;
  /** Frequencia normativa (ex.: "weekly", "annual"). */
  frequency: string;
  /** Unidade do intervalo de recorrencia. */
  intervalUnit: FrequencyUnit;
  /** Quantidade de unidades do intervalo. */
  intervalCount: number;
  /** Quantos itens do golden este template agrega. */
  itemCount: number;
  /** Descricao legivel em portugues. */
  descriptionPt: string;
  /** Descricao legivel em ingles. */
  descriptionEn: string;
  /** Referencia normativa. */
  normativeRef: string;
  /** IDs do golden agregados neste template. */
  sourceRef: string[];
}

export const ITM_TEMPLATES: ItmTemplate[] = ${JSON.stringify(templates, null, 2)};
`;

  writeFileSync(CAMINHO_SAIDA, cabecalho, "utf8");

  console.log(
    `[generate-app-templates] ${templates.length} templates gerados a partir de ${totalItens} itens do golden.`,
  );
  console.log(`[generate-app-templates] arquivo: ${CAMINHO_SAIDA}`);
}

main();
