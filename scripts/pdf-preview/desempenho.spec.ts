// Teste de desempenho de bomba (diesel) — confere a migração para o sistema.
import { describe, it, expect, vi } from "vitest";
import { writeFileSync } from "node:fs";

vi.mock("@/utils/pdf/pdfPrint", () => ({ printHtml: vi.fn(), shareOrPrintHtml: vi.fn() }));

const OUT = process.env.PDF_OUT ?? "/tmp/desempenho.html";

describe("teste de desempenho", () => {
  it("gera o HTML", async () => {
    const { createEmptyDieselPerformanceTest } = await import("@/types/performanceTest");
    const { generateDieselPumpPdfHtml } = await import("@/utils/performanceTestPdfGenerator");
    const test: any = createEmptyDieselPerformanceTest();
    test.contractorInfo = { companyName: "FIRESAFE SERVIÇOS DE ENGENHARIA LTDA", address: "RUA DAS ACÁCIAS, 45", city: "CAMPINAS", state: "SP", zipCode: "13000-000", licenseNumber: "12.345.678/0001-90" };
    test.jobInfo = { ...(test.jobInfo ?? {}), propertyName: "CENTRO LOGÍSTICO JONEL", address: "AV. INDUSTRIAL, 1200", testDate: "2026-09-15" };
    test.deficiencies = [
      { id: "d1", description: "Vazamento na gaxeta do mancal dianteiro", severity: "critical", recommendedAction: "Substituir gaxeta e reapertar", targetCompletionDate: "2026-09-30", resolved: false },
      { id: "d2", description: "Manômetro de sucção fora de calibração", severity: "major", recommendedAction: "Enviar para calibração", targetCompletionDate: "2026-10-15", resolved: false },
      { id: "d3", description: "Pintura descascada na base", severity: "minor", recommendedAction: "Retoque de pintura", targetCompletionDate: "2026-11-30", resolved: false },
    ];
    const html = generateDieselPumpPdfHtml({ test, language: "pt-BR" });
    writeFileSync(OUT, html);
    expect(html).toContain("</html>");
  });
});
