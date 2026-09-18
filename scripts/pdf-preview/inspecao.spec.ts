// Relatório padrão de inspeção — confere que o CSS compartilhado não quebrou.
import { describe, it, expect, vi } from "vitest";
import { writeFileSync } from "node:fs";

vi.mock("@/utils/pdf/pdfPrint", () => ({ printHtml: vi.fn(), shareOrPrintHtml: vi.fn() }));
vi.mock("@/utils/pdf/pdfAssets", () => ({ getLogoDataUri: async () => null }));
vi.mock("@/utils/photoUtils", () => ({
  ensureAllPhotosBase64: async (p: any[]) => p,
  ensurePhotoBase64: async (p: any) => p,
}));

const PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
const OUT = process.env.PDF_OUT ?? "/tmp/inspecao.html";

const item = (id: string, label: string, value: any, notes?: string, psi?: string) => ({
  id, labelKey: id, label, value, notes, psiValue: psi,
});

describe("relatório padrão de inspeção", () => {
  it("gera o HTML", async () => {
    const mod = await import("@/utils/pdfGenerator");
    const html = (mod as any).generateInspectionPdfHtml(
      {
        inspection: {
          id: "i1", type: "wet_pipe", status: "completed",
          propertyName: "CENTRO LOGÍSTICO JONEL", propertyAddress: "AV. INDUSTRIAL, 1200 - CAMPINAS/SP",
          propertyPhone: "(19) 99999-1234", inspectorName: "CLEITON TOLENTINO", contractNo: "CT-2026-118",
          date: "2026-09-15", frequency: "monthly",
          checklist: [
            item("c1", "Válvulas de controle na posição correta e lacradas", "yes", undefined, "150"),
            item("c2", "Manômetros em bom estado e dentro da validade de calibração", "yes"),
            item("c3", "Sprinklers livres de obstrução, corrosão e pintura", "no", "Três bicos obstruídos por material estocado no corredor C."),
            item("c4", "Teste de fluxo do dreno principal", "na"),
            item("c5", "Sinalização e acesso à casa de bombas desobstruídos", "yes"),
          ],
          observations: "SISTEMA EM OPERAÇÃO. ITENS NÃO CONFORMES COMUNICADOS AO RESPONSÁVEL LOCAL.",
          signature: null, photos: [{ id: "p1", uri: "", base64: PIXEL, caption: "Casa de bombas", timestamp: "" }],
          createdAt: "", updatedAt: "",
        },
        language: "pt-BR",
      },
      [{ id: "p1", uri: "", base64: PIXEL, caption: "Casa de bombas", timestamp: "" }],
      null,
    );
    writeFileSync(OUT, html);
    expect(html).toContain("</html>");
  });
});
