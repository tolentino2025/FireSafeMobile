// Gera o HTML do relatório hidrostático fora do app (mocks dos módulos nativos),
// para renderizar o PDF e comparar antes/depois.
import { describe, it, expect, vi } from "vitest";
import { writeFileSync } from "node:fs";
import { sampleHydrostatic, sampleInspection, samplePhotos } from "./sample";

vi.mock("expo-print", () => ({ printToFileAsync: vi.fn(), printAsync: vi.fn() }));
vi.mock("expo-sharing", () => ({ isAvailableAsync: vi.fn(), shareAsync: vi.fn() }));
vi.mock("expo-mail-composer", () => ({ composeAsync: vi.fn(), isAvailableAsync: vi.fn() }));
vi.mock("@/utils/pdf/pdfPrint", () => ({ printHtml: vi.fn(), shareOrPrintHtml: vi.fn() }));
vi.mock("@/utils/pdf/pdfAssets", () => ({ getLogoDataUri: async () => null }));
vi.mock("@/utils/photoUtils", () => ({
  ensureAllPhotosBase64: async (photos: any[]) => photos,
  ensurePhotoBase64: async (p: any) => p,
}));

const OUT = process.env.PDF_OUT ?? "/tmp/relatorio.html";

describe("pré-visualização do relatório hidrostático", () => {
  it("gera o HTML", async () => {
    const { generateHydrostaticTestHtml } = await import("@/utils/pdf/hydrostaticTestPdfGenerator");
    const h = sampleHydrostatic();
    const html = await generateHydrostaticTestHtml({
      inspection: sampleInspection(h) as any,
      hydrostaticTest: h as any,
      photos: samplePhotos() as any,
      language: "pt-BR",
    });
    writeFileSync(OUT, html);
    expect(html.length).toBeGreaterThan(1000);
  });
});
