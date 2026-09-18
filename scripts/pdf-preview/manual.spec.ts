// Manual do usuário — documento de leitura, alinhado ao sistema na paleta e na
// tipografia, mas com estrutura própria (capa, sumário, capítulos).
import { describe, it, expect, vi } from "vitest";
import { writeFileSync } from "node:fs";

vi.mock("@/utils/pdf/pdfPrint", () => ({ printHtml: vi.fn(), shareOrPrintHtml: vi.fn() }));

const OUT = process.env.PDF_OUT ?? "/tmp/manual.html";

describe("manual do usuário", () => {
  it("gera o HTML", async () => {
    const { buildUserManualHtml } = await import("@/utils/manualPdfGenerator");
    const html = buildUserManualHtml("pt-BR");
    writeFileSync(OUT, html);
    expect(html).toContain("</html>");
  });
});
