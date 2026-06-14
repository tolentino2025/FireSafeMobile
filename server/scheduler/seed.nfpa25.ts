// Seed NFPA 25: gera os templates a partir do golden YAML (docs/normas/golden.nfpa25.yaml).
// Para CADA item do golden cria um template com key estavel, garantindo cobertura 100%
// e zero divergencia de frequencia. Idempotente: a mesma entrada gera a mesma saida.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { FREQ_INTERVAL } from "../../scripts/freq";
import type { Frequency } from "../../scripts/freq";
import type { Template } from "./rebuild";

interface GoldenItemRaw {
  id: string;
  system: string;
  activity: string;
  frequency: string;
  text: string;
  rawLine: string;
}

interface GoldenRaw {
  edition: string;
  items: GoldenItemRaw[];
}

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const CAMINHO_GOLDEN = resolve(RAIZ, "docs/normas/golden.nfpa25.yaml");

export function loadGolden(caminho: string = CAMINHO_GOLDEN): GoldenRaw {
  const conteudo = readFileSync(caminho, "utf8");
  return yaml.load(conteudo) as GoldenRaw;
}

// Determina o anchorMode. Por padrao 'calendar'. Atencao normativa:
// bomba diesel operating test eh semanal e eletrica mensal; ambos seguem calendar.
function determinarAnchor(): "calendar" | "completion" {
  return "calendar";
}

// Gera um UUID deterministico (v5-like simplificado) a partir da key, para que a
// mesma entrada produza sempre o mesmo id sem depender de rede/crypto random.
function idDeterministico(key: string): string {
  // Hash FNV-1a 32-bit repetido para preencher 128 bits.
  let h = 0x811c9dc5;
  const bytes: number[] = [];
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < key.length; j++) {
      h ^= key.charCodeAt(j) + i;
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    bytes.push(h & 0xff);
  }
  const hex = bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

// Le o golden e devolve os templates (idempotente).
export function carregarSeedNfpa25(
  caminho: string = CAMINHO_GOLDEN,
): Template[] {
  const golden = loadGolden(caminho);

  return golden.items.map((item) => {
    const intervalo = FREQ_INTERVAL[item.frequency as Frequency];
    if (!intervalo) {
      throw new Error(
        `Frequencia desconhecida no golden: ${item.frequency} (id ${item.id})`,
      );
    }
    const key = `tpl-${item.id.toLowerCase()}`;
    return {
      id: idDeterministico(key),
      key,
      system: item.system,
      activity: item.activity,
      description: item.text,
      intervalUnit: intervalo.unit,
      intervalCount: intervalo.count,
      toleranceDays: 0,
      anchorMode: determinarAnchor(),
      normativeRef: `NFPA 25 (2019), eForms - ${item.system}`,
      sourceRef: [item.id],
      active: true,
    };
  });
}

export function loadSeed(caminho: string = CAMINHO_GOLDEN): Template[] {
  return carregarSeedNfpa25(caminho);
}
