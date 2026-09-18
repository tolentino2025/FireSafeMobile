// Certificado FM85A — confere a migração para o sistema visual.
import { describe, it, expect, vi } from "vitest";
import { writeFileSync } from "node:fs";

vi.mock("@/utils/pdf/pdfPrint", () => ({ printHtml: vi.fn(), shareOrPrintHtml: vi.fn() }));
vi.mock("@/utils/pdf/pdfAssets", () => ({ getLogoDataUri: async () => null }));

const OUT = process.env.PDF_OUT ?? "/tmp/fm85a.html";

describe("certificado FM85A", () => {
  it("gera o HTML", async () => {
    const { createEmptyFM85ACertificate } = await import("@/types/fm85a");
    const { generateFM85APdfHtml } = await import("@/utils/fm85aPdfGenerator");
    const cert: any = createEmptyFM85ACertificate();
    cert.contractorCompanyName = "FIRESAFE SERVIÇOS DE ENGENHARIA LTDA";
    cert.contractorCompanyAddress = "RUA DAS ACÁCIAS, 45 - CAMPINAS/SP";
    cert.date = "2026-09-15";
    const html = generateFM85APdfHtml({ certificate: cert, language: "pt-BR" } as any);
    writeFileSync(OUT, html);
    expect(html).toContain("</html>");
  });
});
