// Inspeção de BOMBA DE INCÊNDIO — exercita as seções que só existem neste tipo
// (dados da bomba e do painel) e várias páginas com cabeçalho repetido.
import { describe, it, expect, vi } from "vitest";
import { writeFileSync } from "node:fs";

vi.mock("@/utils/pdf/pdfPrint", () => ({ printHtml: vi.fn(), shareOrPrintHtml: vi.fn() }));
vi.mock("@/utils/pdf/pdfAssets", () => ({ getLogoDataUri: async () => null }));
vi.mock("@/utils/photoUtils", () => ({
  ensureAllPhotosBase64: async (p: any[]) => p,
  ensurePhotoBase64: async (p: any) => p,
}));

const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
const OUT = process.env.PDF_OUT ?? "/tmp/bomba.html";

const CHECKLIST = [
  ["Casa de bombas limpa, aquecida e com iluminação adequada", "yes", undefined, "", ""],
  ["Válvulas de sucção e descarga abertas e travadas", "yes", undefined, "", ""],
  ["Manômetro de sucção", "yes", undefined, "45", ""],
  ["Manômetro de descarga", "yes", undefined, "165", ""],
  ["Nível de óleo do mancal dentro da faixa", "no", "Nível abaixo do mínimo; completado no local.", "", ""],
  ["Gaxeta com gotejamento conforme recomendação do fabricante", "yes", undefined, "", ""],
  ["Partida automática por queda de pressão", "yes", undefined, "120", ""],
  ["Tempo de funcionamento sem sobreaquecimento (10 min)", "yes", undefined, "", ""],
  ["Alarme de falha de fase no painel", "na", undefined, "", ""],
  ["Bomba jockey mantém pressão do sistema", "no", "Jockey ciclando em excesso — investigar vazamento.", "", ""],
  ["Válvula de alívio de circulação operando", "yes", undefined, "", ""],
  ["Registro de horímetro atualizado", "yes", undefined, "", ""],
];

describe("inspeção de bomba de incêndio", () => {
  it("gera o HTML", async () => {
    const mod = await import("@/utils/pdfGenerator");
    const photos = [
      { id: "p1", uri: "", base64: PIXEL, caption: "Conjunto moto-bomba", timestamp: "" },
      { id: "p2", uri: "", base64: PIXEL, caption: "Painel de comando", timestamp: "" },
    ];
    const html = (mod as any).generateInspectionPdfHtml(
      {
        inspection: {
          id: "i-pump",
          type: "pump_monthly",
          status: "completed",
          propertyName: "CENTRO LOGÍSTICO JONEL",
          propertyAddress: "AV. INDUSTRIAL, 1200 - CAMPINAS/SP",
          propertyPhone: "(19) 99999-1234",
          inspectorName: "CLEITON TOLENTINO",
          contractNo: "CT-2026-118",
          date: "2026-09-15",
          frequency: "monthly",
          checklist: CHECKLIST.map(([label, value, notes, psi], i) => ({
            id: `c${i}`,
            labelKey: `c${i}`,
            label,
            value,
            notes,
            psiValue: psi || undefined,
          })),
          observations:
            "BOMBA PRINCIPAL OPERANDO DENTRO DOS PARÂMETROS. ITENS NÃO CONFORMES COMUNICADOS AO RESPONSÁVEL LOCAL E REGISTRADOS EM ORDEM DE SERVIÇO.",
          signature: null,
          photos,
          companyData: {
            id: "c1",
            name: "JONEL ENGENHARIA LTDA",
            cnpj: "12.345.678/0001-90",
            address: "AV. INDUSTRIAL, 1200",
            city: "CAMPINAS",
            state: "SP",
            zipCode: "13000-000",
            contactName: "CARLOS EDUARDO RAMOS",
            contactPhone: "(19) 99999-1234",
            contactEmail: "carlos@jonel.com.br",
          },
          inspectorData: { id: "u1", name: "CLEITON TOLENTINO", email: "cleiton@jonelincendio.com.br", phone: "(19) 98888-4321", role: "Inspetor NFPA 25" },
          firePumpData: {
            id: "fp1", companyId: "c1", tag: "BI-01", type: "electric",
            manufacturer: "KSB", model: "MEGANORM 80-250", serialNumber: "SN-448210",
            ratedFlowGpm: 500, ratedPressurePsi: 120, ratedSpeedRpm: 3500, powerHP: 60,
            voltage: "380V", phases: 3, frequency: 60, numberOfStages: 1, impellerDiameter: '9.5"',
          },
          firePumpPanelData: {
            id: "pn1", companyId: "c1", tag: "PN-01",
            manufacturer: "TORNATECH", model: "GPA-380", serialNumber: "PN-99120",
            voltage: "380V", startMethod: "Partida direta",
          },
          geoLocation: { latitude: -22.9099, longitude: -47.0626, accuracy: 8, timestamp: "2026-09-15T08:32:00.000Z" },
          createdAt: "",
          updatedAt: "",
        },
        language: "pt-BR",
      },
      photos,
      null,
    );
    writeFileSync(OUT, html);
    expect(html).toContain("</html>");
  });
});
