import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Inspection, InspectionType } from "@/contexts/InspectionContext";
import { ensureAllPhotosBase64 } from "@/utils/photoUtils";

const sanitizeHtml = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const INSPECTION_TYPE_NAMES: Record<InspectionType, { en: string; pt: string }> = {
  wet_pipe: { en: "Wet Pipe Sprinkler System", pt: "Sistema de Sprinkler Tubo Molhado" },
  dry_pipe: { en: "Dry Pipe Sprinkler System", pt: "Sistema de Sprinkler Tubo Seco" },
  preaction_deluge: { en: "Preaction/Deluge System", pt: "Sistema Pré-Ação/Dilúvio" },
  foam_water: { en: "Foam-Water Sprinkler System", pt: "Sistema de Sprinkler Espuma-Água" },
  water_spray: { en: "Water Spray System", pt: "Sistema de Spray de Água" },
  water_mist: { en: "Water Mist System", pt: "Sistema de Neblina de Água" },
  pump_weekly: { en: "Fire Pump - Weekly Inspection", pt: "Bomba de Incêndio - Inspeção Semanal" },
  pump_monthly: { en: "Fire Pump - Monthly Inspection", pt: "Bomba de Incêndio - Inspeção Mensal" },
  pump_annual: { en: "Fire Pump - Annual Test", pt: "Bomba de Incêndio - Teste Anual" },
  aboveground: { en: "Aboveground Piping", pt: "Tubulação Aérea" },
  underground: { en: "Underground Piping", pt: "Tubulação Subterrânea" },
  hydrant_flow: { en: "Hydrant Flow Test", pt: "Teste de Vazão de Hidrante" },
  water_tank: { en: "Water Storage Tank", pt: "Tanque de Armazenamento de Água" },
  hazard_eval: { en: "Hazard Evaluation", pt: "Avaliação de Riscos" },
  standpipe: { en: "Standpipe & Hose System", pt: "Sistema de Standpipe e Mangueiras" },
};

interface GeneratePdfOptions {
  inspection: Inspection;
  language: "en" | "pt-BR";
  companyName?: string;
  companyLogo?: string;
}

const formatDate = (dateString: string, language: string): string => {
  const date = new Date(dateString);
  if (language === "pt-BR") {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getChecklistValueSymbol = (value: "yes" | "no" | "na" | null): string => {
  switch (value) {
    case "yes":
      return '<span style="color: #22863A; font-weight: bold;">&#10004;</span>';
    case "no":
      return '<span style="color: #DC2626; font-weight: bold;">&#10008;</span>';
    case "na":
      return '<span style="color: #6B7280;">N/A</span>';
    default:
      return '<span style="color: #9CA3AF;">-</span>';
  }
};

const translations = {
  en: {
    inspectionReport: "Inspection Report",
    nfpaCompliance: "NFPA 25 Compliant",
    propertyInformation: "Property Information",
    propertyName: "Property Name",
    address: "Address",
    phone: "Phone",
    inspectionDetails: "Inspection Details",
    inspectionType: "Inspection Type",
    inspector: "Inspector",
    date: "Date",
    frequency: "Frequency",
    contractNo: "Contract No.",
    checklistResults: "Checklist Results",
    item: "Item",
    status: "Status",
    psi: "PSI",
    observations: "Observations",
    signature: "Inspector Signature",
    photos: "Inspection Photos",
    generatedOn: "Report generated on",
    page: "Page",
    frequencies: {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      quarterly: "Quarterly",
      annually: "Annually",
      five_years: "5 Years",
    },
  },
  "pt-BR": {
    inspectionReport: "Relatório de Inspeção",
    nfpaCompliance: "Conforme NFPA 25",
    propertyInformation: "Informações da Propriedade",
    propertyName: "Nome da Propriedade",
    address: "Endereço",
    phone: "Telefone",
    inspectionDetails: "Detalhes da Inspeção",
    inspectionType: "Tipo de Inspeção",
    inspector: "Inspetor",
    date: "Data",
    frequency: "Frequência",
    contractNo: "Nº do Contrato",
    checklistResults: "Resultados da Verificação",
    item: "Item",
    status: "Status",
    psi: "PSI",
    observations: "Observações",
    signature: "Assinatura do Inspetor",
    photos: "Fotos da Inspeção",
    generatedOn: "Relatório gerado em",
    page: "Página",
    frequencies: {
      daily: "Diária",
      weekly: "Semanal",
      monthly: "Mensal",
      quarterly: "Trimestral",
      annually: "Anual",
      five_years: "5 Anos",
    },
  },
};

interface PhotoWithBase64 {
  id: string;
  uri: string;
  base64?: string;
  caption: string;
  timestamp: string;
}

const generateInspectionPdfHtmlWithPhotos = (
  options: GeneratePdfOptions,
  photosWithBase64: PhotoWithBase64[]
): string => {
  const { inspection, language, companyName = "FireSafe ITM" } = options;
  const t = translations[language];
  const typeName = INSPECTION_TYPE_NAMES[inspection.type][language === "pt-BR" ? "pt" : "en"];
  const freq = t.frequencies[inspection.frequency as keyof typeof t.frequencies] || inspection.frequency;

  const checklistRows = inspection.checklist
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB;">${sanitizeHtml(item.label)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; text-align: center;">${getChecklistValueSymbol(item.value)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; text-align: center;">${sanitizeHtml(item.psiValue) || "-"}</td>
      </tr>
    `
    )
    .join("");

  const validPhotos = photosWithBase64.filter((photo) => photo.base64);
  
  const photosHtml =
    validPhotos.length > 0
      ? `
    <div style="margin-top: 30px; page-break-inside: avoid;">
      <h2 style="color: #1A365D; border-bottom: 2px solid #FF6B00; padding-bottom: 8px; font-size: 16px;">${t.photos}</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px;">
        ${validPhotos
          .map(
            (photo) => `
          <div style="width: 200px; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
            <img src="${photo.base64}" style="width: 100%; height: 150px; object-fit: cover;" />
            ${photo.caption ? `<p style="margin: 0; padding: 8px; font-size: 11px; color: #4B5563;">${sanitizeHtml(photo.caption)}</p>` : ""}
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `
      : "";

  const signatureHtml = inspection.signature
    ? `
    <div style="margin-top: 30px; page-break-inside: avoid;">
      <h2 style="color: #1A365D; border-bottom: 2px solid #FF6B00; padding-bottom: 8px; font-size: 16px;">${t.signature}</h2>
      <div style="margin-top: 15px; padding: 15px; background: #F9FAFB; border-radius: 8px; display: inline-block;">
        <img src="${inspection.signature}" style="max-height: 80px;" />
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #6B7280;">${sanitizeHtml(inspection.inspectorName) || "-"}</p>
      </div>
    </div>
  `
    : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: #1F2937;
          background: white;
        }
        .page {
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #FF6B00;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #FF6B00 0%, #FF8533 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #1A365D;
        }
        .compliance-badge {
          background: #22863A;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        .report-title {
          font-size: 14px;
          color: #6B7280;
          margin-top: 5px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          color: #1A365D;
          font-size: 16px;
          font-weight: 600;
          border-bottom: 2px solid #FF6B00;
          padding-bottom: 8px;
          margin-bottom: 15px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .info-item {
          background: #F9FAFB;
          padding: 12px;
          border-radius: 8px;
          border-left: 3px solid #FF6B00;
        }
        .info-label {
          font-size: 10px;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .info-value {
          font-size: 13px;
          font-weight: 500;
          color: #1F2937;
        }
        .checklist-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .checklist-table th {
          background: #1A365D;
          color: white;
          padding: 12px;
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .checklist-table th:nth-child(2),
        .checklist-table th:nth-child(3) {
          text-align: center;
          width: 80px;
        }
        .checklist-table td {
          font-size: 12px;
        }
        .observations-box {
          background: #FEF3C7;
          border: 1px solid #F59E0B;
          border-radius: 8px;
          padding: 15px;
          margin-top: 10px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          text-align: center;
          font-size: 10px;
          color: #9CA3AF;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div>
            <div class="logo-section">
              <div class="logo-icon">F</div>
              <div>
                <div class="company-name">${companyName}</div>
                <div class="report-title">${t.inspectionReport}</div>
              </div>
            </div>
          </div>
          <div class="compliance-badge">${t.nfpaCompliance}</div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.propertyInformation}</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">${t.propertyName}</div>
              <div class="info-value">${sanitizeHtml(inspection.propertyName) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.address}</div>
              <div class="info-value">${sanitizeHtml(inspection.propertyAddress) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.phone}</div>
              <div class="info-value">${sanitizeHtml(inspection.propertyPhone) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.contractNo}</div>
              <div class="info-value">${sanitizeHtml(inspection.contractNo) || "-"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.inspectionDetails}</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">${t.inspectionType}</div>
              <div class="info-value">${typeName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.inspector}</div>
              <div class="info-value">${sanitizeHtml(inspection.inspectorName) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.date}</div>
              <div class="info-value">${formatDate(inspection.date, language)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.frequency}</div>
              <div class="info-value">${freq}</div>
            </div>
          </div>
        </div>

        <div class="section" style="page-break-inside: avoid;">
          <h2 class="section-title">${t.checklistResults}</h2>
          <table class="checklist-table">
            <thead>
              <tr>
                <th>${t.item}</th>
                <th>${t.status}</th>
                <th>${t.psi}</th>
              </tr>
            </thead>
            <tbody>
              ${checklistRows}
            </tbody>
          </table>
        </div>

        ${
          inspection.observations
            ? `
        <div class="section" style="page-break-inside: avoid;">
          <h2 class="section-title">${t.observations}</h2>
          <div class="observations-box">
            ${sanitizeHtml(inspection.observations)}
          </div>
        </div>
        `
            : ""
        }

        ${photosHtml}

        ${signatureHtml}

        <div class="footer">
          <p>${t.generatedOn}: ${formatDate(new Date().toISOString(), language)}</p>
          <p style="margin-top: 5px;">FireSafe ITM - Fire Protection System Inspection, Testing & Maintenance</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateAndPrintPdf = async (options: GeneratePdfOptions): Promise<void> => {
  const photosWithBase64 = await ensureAllPhotosBase64(options.inspection.photos || []);
  const html = generateInspectionPdfHtmlWithPhotos(options, photosWithBase64);
  await Print.printAsync({ html });
};

export const generatePdfUri = async (options: GeneratePdfOptions): Promise<string> => {
  const photosWithBase64 = await ensureAllPhotosBase64(options.inspection.photos || []);
  const html = generateInspectionPdfHtmlWithPhotos(options, photosWithBase64);
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
};

export const generateAndSharePdf = async (options: GeneratePdfOptions): Promise<void> => {
  const uri = await generatePdfUri(options);
  
  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `${options.inspection.propertyName || "Inspection"} Report`,
      UTI: "com.adobe.pdf",
    });
  } else {
    throw new Error("Sharing is not available on this device");
  }
};

export const generateInspectionPdfHtml = generateInspectionPdfHtmlWithPhotos;
