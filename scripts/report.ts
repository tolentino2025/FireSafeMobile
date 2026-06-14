// Relatorio de cobertura: imprime cobertura total, % por sistema e listas.
import { resolve } from "node:path";
import { gapAnalysis } from "./gapAnalysis";
import type { TemplateLike } from "./gapAnalysis";
import { loadGolden, CAMINHO_GOLDEN } from "../server/scheduler/seed.nfpa25";
import { carregarSeedNfpa25 } from "../server/scheduler/seed.nfpa25";
import type { GoldenItem } from "./generate-golden";

function main(): void {
  const golden = loadGolden(CAMINHO_GOLDEN).items as GoldenItem[];
  const templates = carregarSeedNfpa25() as unknown as TemplateLike[];
  const r = gapAnalysis(golden, templates);

  console.log("=== Relatorio de Cobertura NFPA 25 eForms ===");
  console.log(`Golden: ${resolve(CAMINHO_GOLDEN)}`);
  console.log(
    `Cobertura total: ${r.covered}/${r.total} (${r.pct.toFixed(2)}%)`,
  );
  console.log(`Faltando (bloqueia): ${r.missing.length}`);
  console.log(`Divergencia de frequencia (bloqueia): ${r.freqMismatch.length}`);
  console.log(`Orfaos: ${r.orphan.length}`);

  // % por sistema.
  const porSistema = new Map<string, { total: number; covered: number }>();
  const idsMissing = new Set(r.missing.map((m) => m.id));
  for (const g of golden) {
    const e = porSistema.get(g.system) ?? { total: 0, covered: 0 };
    e.total += 1;
    if (!idsMissing.has(g.id)) e.covered += 1;
    porSistema.set(g.system, e);
  }
  console.log("\n--- Cobertura por sistema ---");
  for (const [sis, e] of [...porSistema.entries()].sort()) {
    const pct = e.total === 0 ? 100 : (e.covered / e.total) * 100;
    console.log(`  ${sis}: ${e.covered}/${e.total} (${pct.toFixed(1)}%)`);
  }

  if (r.missing.length) {
    console.log("\n--- Faltando ---");
    for (const m of r.missing.slice(0, 50))
      console.log(`  ${m.id} :: ${m.text.slice(0, 60)}`);
  }
  if (r.freqMismatch.length) {
    console.log("\n--- Divergencia de frequencia ---");
    for (const f of r.freqMismatch.slice(0, 50))
      console.log(
        `  ${f.goldenId} esperado ${f.esperado.unit}/${f.esperado.count} encontrado ${f.encontrado.unit}/${f.encontrado.count}`,
      );
  }
  if (r.orphan.length) {
    console.log("\n--- Orfaos ---");
    for (const o of r.orphan.slice(0, 50)) console.log(`  ${o.key}`);
  }
}

main();
