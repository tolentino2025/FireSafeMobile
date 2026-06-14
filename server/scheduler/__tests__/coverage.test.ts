import { describe, expect, it } from "vitest";
import { gapAnalysis } from "../../../scripts/gapAnalysis";
import type { TemplateLike } from "../../../scripts/gapAnalysis";
import type { GoldenItem } from "../../../scripts/generate-golden";
import { carregarSeedNfpa25, loadGolden } from "../seed.nfpa25";
import { gerarOcorrencias } from "../engine";
import type { Frequency } from "../../../scripts/freq";

describe("Cobertura NFPA 25 eForms", () => {
  it("FireSafeITM cobre 100% do NFPA 25 eForms", () => {
    const golden = loadGolden().items as GoldenItem[];
    const templates = carregarSeedNfpa25() as unknown as TemplateLike[];
    const r = gapAnalysis(golden, templates);

    expect(golden.length).toBeGreaterThan(0);
    expect(r.missing.length).toBe(0);
    expect(r.freqMismatch.length).toBe(0);
    expect(r.pct).toBe(100);
  });

  it("o cronograma gerado contempla todas as frequencias do golden", () => {
    const golden = loadGolden().items as GoldenItem[];
    const templates = carregarSeedNfpa25();

    // Frequencias esperadas (exceto unknown) presentes no golden.
    const freqsEsperadas = new Set(golden.map((g) => g.frequency));

    // Horizonte de teste +6 anos para cobrir 3year/5year.
    const startDate = "2025-01-01";
    const horizonEnd = "2031-01-01";

    // Mapeia unit/count -> frequencia (inverso de FREQ_INTERVAL).
    const freqDeTemplate = (
      unit: string,
      count: number,
    ): Frequency | undefined => {
      const m: Record<string, Frequency> = {
        "day:1": "daily",
        "week:1": "weekly",
        "month:1": "monthly",
        "month:3": "quarterly",
        "month:6": "semiannual",
        "year:1": "annual",
        "year:3": "3year",
        "year:5": "5year",
      };
      return m[`${unit}:${count}`];
    };

    const freqsGeradas = new Set<string>();
    for (const tpl of templates) {
      const ocs = gerarOcorrencias({
        startDate,
        unit: tpl.intervalUnit,
        count: tpl.intervalCount,
        toleranceDays: tpl.toleranceDays,
        horizonEnd,
        holidays: new Set<string>(),
        firstDueIsStart: true,
      });
      if (ocs.length > 0) {
        const f = freqDeTemplate(tpl.intervalUnit, tpl.intervalCount);
        if (f) freqsGeradas.add(f);
      }
    }

    for (const f of freqsEsperadas) {
      expect(freqsGeradas.has(f)).toBe(true);
    }
  });
});
