export const PDF_THEME = {
  brandPrimary: "#1A365D",
  brandAccent: "#FF6B00",
  brandAccentLight: "#FF8533",
  text: "#1F2937",
  muted: "#6B7280",
  mutedLight: "#9CA3AF",
  border: "#E5E7EB",
  bgSoft: "#F9FAFB",
  success: "#22863A",
  error: "#DC2626",
  warning: "#F59E0B",
  warningBg: "#FEF3C7",
  white: "#FFFFFF",
} as const;

export type PdfTheme = typeof PDF_THEME;

export const getBaseCss = (): string => {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: ${PDF_THEME.text};
      background: ${PDF_THEME.white};
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
      border-bottom: 3px solid ${PDF_THEME.brandAccent};
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
      background: linear-gradient(135deg, ${PDF_THEME.brandAccent} 0%, ${PDF_THEME.brandAccentLight} 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${PDF_THEME.white};
      font-size: 24px;
      font-weight: bold;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: ${PDF_THEME.brandPrimary};
    }
    .compliance-badge {
      background: ${PDF_THEME.success};
      color: ${PDF_THEME.white};
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
    }
    .report-title {
      font-size: 14px;
      color: ${PDF_THEME.muted};
      margin-top: 5px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      color: ${PDF_THEME.brandPrimary};
      font-size: 16px;
      font-weight: 600;
      border-bottom: 2px solid ${PDF_THEME.brandAccent};
      padding-bottom: 8px;
      margin-bottom: 15px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .info-item {
      background: ${PDF_THEME.bgSoft};
      padding: 12px;
      border-radius: 8px;
      border-left: 3px solid ${PDF_THEME.brandAccent};
    }
    .info-label {
      font-size: 10px;
      color: ${PDF_THEME.muted};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 13px;
      font-weight: 500;
      color: ${PDF_THEME.text};
    }
    .checklist-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .checklist-table th {
      background: ${PDF_THEME.brandPrimary};
      color: ${PDF_THEME.white};
      padding: 12px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .checklist-table th:nth-child(2) {
      text-align: center;
      width: 80px;
    }
    .checklist-table td {
      font-size: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      font-size: 9px;
    }
    th, td {
      border: 1px solid ${PDF_THEME.border};
      padding: 3px 5px;
      text-align: left;
    }
    th {
      background: ${PDF_THEME.bgSoft};
      font-weight: bold;
    }
    .observations-box {
      background: ${PDF_THEME.warningBg};
      border: 1px solid ${PDF_THEME.warning};
      border-radius: 8px;
      padding: 15px;
      margin-top: 10px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid ${PDF_THEME.border};
      text-align: center;
      font-size: 10px;
      color: ${PDF_THEME.mutedLight};
    }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .info-row {
      display: flex;
      margin-bottom: 4px;
    }
    .info-row .info-label {
      font-weight: bold;
      min-width: 180px;
      font-size: 12px;
    }
    .info-row .info-value {
      flex: 1;
      border-bottom: 1px solid ${PDF_THEME.border};
      min-height: 14px;
      padding-left: 4px;
    }
    .question-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      padding: 2px 0;
      border-bottom: 1px dotted ${PDF_THEME.border};
    }
    .question-label {
      flex: 1;
    }
    .question-value {
      min-width: 40px;
      text-align: center;
      font-weight: bold;
    }
    .signature-box {
      border: 1px solid ${PDF_THEME.border};
      min-height: 60px;
      margin-top: 5px;
      padding: 5px;
    }
    .signature-img {
      max-height: 50px;
      max-width: 100%;
    }
    .notes-box {
      border: 1px solid ${PDF_THEME.border};
      min-height: 60px;
      padding: 8px;
      margin-top: 5px;
      white-space: pre-wrap;
    }
    .geo-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }
    .geo-item {
      flex: 1;
      min-width: 120px;
    }
    .geo-label {
      font-size: 9px;
      color: ${PDF_THEME.muted};
      text-transform: uppercase;
    }
    .geo-value {
      font-size: 11px;
      font-weight: 500;
      color: ${PDF_THEME.text};
    }
    .subsection {
      margin-bottom: 15px;
    }
    .subsection-title {
      background: ${PDF_THEME.bgSoft};
      padding: 8px 12px;
      font-weight: 600;
      font-size: 12px;
      border: 1px solid ${PDF_THEME.border};
      border-left: 3px solid ${PDF_THEME.brandAccent};
      margin-bottom: 10px;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }
    .col-2 { width: 50%; padding-right: 12px; }
    .col-3 { width: 33.33%; padding-right: 12px; }
    .col-4 { width: 25%; padding-right: 12px; }
    .field { margin-bottom: 10px; }
    .field-label {
      font-size: 10px;
      color: ${PDF_THEME.muted};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }
    .field-value {
      font-size: 12px;
      font-weight: 500;
      color: ${PDF_THEME.text};
    }
    .check-item {
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }
    .status-approved {
      background: ${PDF_THEME.success};
      color: ${PDF_THEME.white};
      padding: 10px 20px;
      display: inline-block;
      font-weight: 700;
      font-size: 14px;
      border-radius: 4px;
    }
    .status-reproved {
      background: ${PDF_THEME.error};
      color: ${PDF_THEME.white};
      padding: 10px 20px;
      display: inline-block;
      font-weight: 700;
      font-size: 14px;
      border-radius: 4px;
    }
    .conclusion-text {
      background: ${PDF_THEME.bgSoft};
      padding: 15px;
      border: 1px solid ${PDF_THEME.border};
      border-radius: 8px;
      margin-top: 12px;
      white-space: pre-wrap;
      font-size: 12px;
      line-height: 1.5;
    }
    .declaration {
      background: ${PDF_THEME.warningBg};
      border: 1px solid ${PDF_THEME.warning};
      padding: 12px;
      margin-bottom: 20px;
      font-size: 11px;
      border-radius: 8px;
    }
    .photo-section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .photo-section h4 {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 10px;
      color: ${PDF_THEME.brandPrimary};
    }
    .photo-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .photo-item {
      width: calc(50% - 6px);
    }
    .photo-item img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      border: 1px solid ${PDF_THEME.border};
      border-radius: 4px;
    }
    .photo-caption {
      font-size: 10px;
      color: ${PDF_THEME.muted};
      text-align: center;
      margin-top: 6px;
    }
    .signature-section {
      margin-top: 20px;
    }
    .signature-row {
      display: flex;
      gap: 30px;
      margin-bottom: 25px;
    }
    .signature-box-container {
      flex: 1;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid ${PDF_THEME.text};
      margin-top: 50px;
      padding-top: 8px;
    }
    .signature-label {
      font-size: 11px;
      color: ${PDF_THEME.muted};
      font-weight: 600;
    }
    .signature-name {
      font-size: 10px;
      margin-top: 4px;
    }
    .signature-date {
      font-size: 9px;
      color: ${PDF_THEME.muted};
    }
    .signature-img {
      max-width: 200px;
      max-height: 80px;
      margin-bottom: 5px;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
    .status-container {
      text-align: center;
      margin-bottom: 15px;
    }
    .check-icon-yes {
      color: ${PDF_THEME.success};
      font-weight: bold;
    }
    .check-icon-no {
      color: ${PDF_THEME.muted};
    }
    .section-content {
      border: 1px solid ${PDF_THEME.border};
      padding: 15px;
      border-radius: 0 0 8px 8px;
      margin-top: -1px;
    }
    @media print {
      .section { page-break-inside: avoid; }
    }
  `;
};

export const sanitizeHtml = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const getChecklistValueSymbol = (value: "yes" | "no" | "na" | null): string => {
  switch (value) {
    case "yes":
      return `<span style="color: ${PDF_THEME.success}; font-weight: bold;">&#10004;</span>`;
    case "no":
      return `<span style="color: ${PDF_THEME.error}; font-weight: bold;">&#10008;</span>`;
    case "na":
      return `<span style="color: ${PDF_THEME.muted};">N/A</span>`;
    default:
      return `<span style="color: ${PDF_THEME.mutedLight};">-</span>`;
  }
};
