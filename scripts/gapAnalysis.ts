// Analise de cobertura (gap analysis) entre o golden NFPA 25 e os templates do app.
// 4 categorias: Coberto, Faltando, Orfao, Divergencia de frequencia.
import { FREQ_INTERVAL } from "./freq";
import type { Frequency } from "./freq";
import type { GoldenItem } from "./generate-golden";

export interface TemplateLike {
  key: string;
  intervalUnit: string;
  intervalCount: number;
  sourceRef: string[];
}

export interface GapResultado {
  total: number;
  covered: number;
  pct: number;
  // golden sem template -> bloqueia.
  missing: GoldenItem[];
  // template existe mas unit/count != frequencia esperada -> bloqueia.
  freqMismatch: {
    goldenId: string;
    templateKey: string;
    esperado: { unit: string; count: number };
    encontrado: { unit: string; count: number };
  }[];
  // template sem sourceRef valido no golden.
  orphan: TemplateLike[];
}

export function gapAnalysis(
  golden: GoldenItem[],
  templates: TemplateLike[],
): GapResultado {
  const idsGolden = new Set(golden.map((g) => g.id));

  // Indexa templates por goldenId referenciado.
  const porGoldenId = new Map<string, TemplateLike[]>();
  for (const t of templates) {
    for (const ref of t.sourceRef) {
      const lista = porGoldenId.get(ref) ?? [];
      lista.push(t);
      porGoldenId.set(ref, lista);
    }
  }

  const missing: GoldenItem[] = [];
  const freqMismatch: GapResultado["freqMismatch"] = [];
  let covered = 0;

  for (const item of golden) {
    const tpls = porGoldenId.get(item.id) ?? [];
    if (tpls.length === 0) {
      missing.push(item);
      continue;
    }
    covered += 1;
    const esperado = FREQ_INTERVAL[item.frequency as Frequency];
    if (esperado) {
      for (const t of tpls) {
        if (
          t.intervalUnit !== esperado.unit ||
          t.intervalCount !== esperado.count
        ) {
          freqMismatch.push({
            goldenId: item.id,
            templateKey: t.key,
            esperado: { unit: esperado.unit, count: esperado.count },
            encontrado: { unit: t.intervalUnit, count: t.intervalCount },
          });
        }
      }
    }
  }

  // Orfaos: templates cujo(s) sourceRef nao existe(m) no golden.
  const orphan: TemplateLike[] = templates.filter((t) => {
    const refsValidos = t.sourceRef.filter((r) => idsGolden.has(r));
    return refsValidos.length === 0;
  });

  const total = golden.length;
  const pct = total === 0 ? 100 : (covered / total) * 100;

  return { total, covered, pct, missing, freqMismatch, orphan };
}
