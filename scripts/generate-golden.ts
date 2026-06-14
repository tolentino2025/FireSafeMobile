// Gera o golden YAML (docs/normas/golden.nfpa25.yaml) a partir do parseMd.
// IDs estaveis: NFPA25-<SYSTEM>-<ACTIVITY>-<FREQUENCY>-<NNN> (sequencial por grupo,
// 3 digitos). Pula itens com frequency=unknown OU activity=unknown.
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { parseMd } from "./parseMd";
import type { SourceItem } from "./parseMd";

export interface GoldenItem {
  id: string;
  system: string;
  activity: string;
  frequency: string;
  text: string;
  rawLine: string;
}

export interface Golden {
  edition: string;
  items: GoldenItem[];
}

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const CAMINHO_FONTE = resolve(RAIZ, "docs/normas/nfpa25-eforms.md");
export const CAMINHO_GOLDEN = resolve(RAIZ, "docs/normas/golden.nfpa25.yaml");

// Token estavel em maiusculas, sem caracteres especiais.
function token(s: string): string {
  return s
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .trim();
}

// Constroi o golden a partir dos SourceItem (deterministico).
export function construirGolden(itens: SourceItem[]): {
  golden: Golden;
  pulados: number;
} {
  const validos = itens.filter(
    (i) => i.frequency !== "unknown" && i.activity !== "unknown",
  );
  const pulados = itens.length - validos.length;

  const contadores = new Map<string, number>();
  const goldenItems: GoldenItem[] = validos.map((i) => {
    const grupo = `${token(i.system)}-${token(i.activity)}-${token(i.frequency)}`;
    const n = (contadores.get(grupo) ?? 0) + 1;
    contadores.set(grupo, n);
    const seq = String(n).padStart(3, "0");
    return {
      id: `NFPA25-${grupo}-${seq}`,
      system: i.system,
      activity: i.activity,
      frequency: i.frequency,
      text: i.text,
      rawLine: i.rawLine,
    };
  });

  return {
    golden: {
      edition: "NFPA 25 (2019 eForms Handbook)",
      items: goldenItems,
    },
    pulados,
  };
}

// CLI: gera e grava o arquivo.
function main(): void {
  const itens = parseMd(CAMINHO_FONTE);
  const { golden, pulados } = construirGolden(itens);
  const conteudo = yaml.dump(golden, { lineWidth: 120, noRefs: true });
  writeFileSync(CAMINHO_GOLDEN, conteudo, "utf8");
  console.log(`Golden gerado em: ${CAMINHO_GOLDEN}`);
  console.log(`  itens totais (parseados): ${itens.length}`);
  console.log(`  itens no golden: ${golden.items.length}`);
  console.log(`  pulados (unknown freq/activity): ${pulados}`);
}

// Executa apenas quando rodado diretamente.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
