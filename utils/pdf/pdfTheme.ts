// Sistema visual dos relatórios em PDF do FireSafe ITM.
//
// Princípios (adaptados do padrão de documentos da Jonel, mantendo a identidade
// FireSafe e a estrutura dos nossos relatórios técnicos):
//
// 1. COR SIGNIFICA ALGUMA COISA. A base é neutra. O laranja da marca aparece só
//    na assinatura visual (marca e fio do cabeçalho); o vermelho é reservado a
//    não conformidade. Nada de cor decorativa.
// 2. É PAPEL, NÃO TELA. Geometria em milímetros, texto em pontos, A4 com
//    margens fixas — o mesmo resultado no iOS, no Android e no navegador.
// 3. HIERARQUIA POR PESO E CAIXA, não por tamanho grande: uma escala só.
// 4. NADA PARTE NO MEIO. Todo bloco tem break-inside: avoid.
// 5. NÚMERO É COLUNA: tabular-nums e alinhamento à direita, para pressão,
//    vazão e PSI não dançarem entre as linhas.
export const PDF_THEME = {
  // Neutros (base do documento)
  ink: "#111827",
  graphite: "#2B2F36",
  text: "#4B5563",
  muted: "#8A8F98",
  line: "#D4D6DA",
  lineSoft: "#E7E9EC",
  surface: "#F4F5F6",
  white: "#FFFFFF",

  // Identidade FireSafe — só marca e fio do cabeçalho.
  brandAccent: "#FF6B00",

  // Semântico — vermelho apenas para não conformidade/reprovação.
  danger: "#B91C1C",

  // Compatibilidade com os geradores ainda não migrados (etapa 3).
  brandPrimary: "#111827",
  brandAccentLight: "#FF8533",
  mutedLight: "#8A8F98",
  border: "#D4D6DA",
  bgSoft: "#F4F5F6",
  success: "#111827",
  error: "#B91C1C",
  warning: "#8A8F98",
  warningBg: "#F4F5F6",
} as const;

export type PdfTheme = typeof PDF_THEME;

// Condensada para títulos; cai para Arial no Android, que não tem Arial Narrow.
const FONT_TITLE = `"Arial Narrow", "Helvetica Neue Condensed", Arial, sans-serif`;
const FONT_BODY = `Inter, "Helvetica Neue", Helvetica, Arial, sans-serif`;

export const getBaseCss = (): string => {
  const c = PDF_THEME;
  return `
    @page { size: A4; margin: 12mm 0 13mm; }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: ${FONT_BODY};
      font-size: 8pt;
      line-height: 1.4;
      color: ${c.text};
      background: ${c.white};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* O respiro lateral vem do conteúdo, não da margem da página. */
    .page { padding: 0 12mm; }

    /* ── Moldura do documento ─────────────────────────────────────────────
       Cabeçalho e rodapé repetidos em toda página. Nenhum motor acessível ao
       app expõe a API de cabeçalho de impressão (nem o expo-print, nem o
       window.print), mas thead/tfoot de tabela repetem em WebKit e Chromium —
       é o único caminho que funciona igual no iOS, no Android e no navegador. */
    .doc-frame { width: 100%; border-collapse: collapse; }
    .doc-frame > thead > tr > td,
    .doc-frame > tbody > tr > td,
    .doc-frame > tfoot > tr > td {
      padding: 0; border: 0; vertical-align: top;
      font-size: inherit; color: inherit;
    }

    /* ── Cabeçalho ────────────────────────────────────────────────────── */
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 6mm;
      padding-bottom: 3mm;
      border-bottom: .5mm solid ${c.brandAccent};
      margin-bottom: 5mm;
    }
    .logo-section { display: flex; align-items: center; gap: 3mm; }
    .logo-icon {
      width: 11mm; height: 11mm;
      background: ${c.brandAccent};
      border-radius: 1.5mm;
      display: flex; align-items: center; justify-content: center;
      color: ${c.white};
      font-family: ${FONT_TITLE};
      font-size: 15pt; font-weight: 800;
    }
    .brand-logo { height: 11mm; width: auto; }
    .company-name {
      font-family: ${FONT_TITLE};
      font-size: 11pt; font-weight: 800;
      letter-spacing: .04em; text-transform: uppercase;
      color: ${c.ink};
    }
    .report-title {
      font-size: 7pt; color: ${c.muted};
      text-transform: uppercase; letter-spacing: .06em; margin-top: .6mm;
    }
    /* Caixa de identificação do documento, à direita do cabeçalho. */
    .doc-meta {
      min-width: 42mm;
      border: .25mm solid ${c.line}; border-radius: 1.5mm;
      background: ${c.surface};
      overflow: hidden;
    }
    .doc-meta > div { padding: 1.6mm 2.6mm; }
    .doc-meta > div + div { border-top: .25mm solid ${c.line}; }
    .doc-meta .k { font-size: 5.8pt; color: ${c.muted}; text-transform: uppercase; letter-spacing: .05em; }
    .doc-meta .v { font-size: 7.5pt; font-weight: 700; color: ${c.ink}; font-variant-numeric: tabular-nums; }
    .compliance-badge {
      display: inline-block;
      border: .3mm solid ${c.graphite}; border-radius: 1mm;
      padding: 1mm 2.4mm;
      font-size: 6.6pt; font-weight: 800;
      text-transform: uppercase; letter-spacing: .04em;
      color: ${c.ink};
    }

    /* ── Seções ───────────────────────────────────────────────────────── */
    .section { margin-bottom: 4.5mm; break-inside: avoid; }
    .section-title {
      background: ${c.ink}; color: ${c.white};
      font-family: ${FONT_TITLE};
      font-size: 8.4pt; font-weight: 800;
      text-transform: uppercase; letter-spacing: .05em;
      padding: 1.8mm 3mm;
      border-radius: 1.5mm 1.5mm 0 0;
    }
    .section-content {
      border: .25mm solid ${c.line}; border-top: 0;
      border-radius: 0 0 1.5mm 1.5mm;
      padding: 3mm;
    }
    .subsection { margin-bottom: 3mm; break-inside: avoid; }
    .subsection:last-child { margin-bottom: 0; }
    .subsection-title {
      background: ${c.surface};
      border-bottom: .25mm solid ${c.line};
      padding: 1.4mm 2.4mm; margin-bottom: 2.4mm;
      font-size: 7pt; font-weight: 800;
      text-transform: uppercase; letter-spacing: .04em;
      color: ${c.ink};
    }

    /* ── Campos rótulo/valor ──────────────────────────────────────────── */
    .row { display: flex; flex-wrap: wrap; margin: 0 -1.5mm; }
    .col-2 { width: 50%; padding: 0 1.5mm; }
    .col-3 { width: 33.333%; padding: 0 1.5mm; }
    .col-4 { width: 25%; padding: 0 1.5mm; }
    .field { margin-bottom: 2.2mm; break-inside: avoid; }
    .field-label {
      font-size: 6pt; font-weight: 700; color: ${c.muted};
      text-transform: uppercase; letter-spacing: .05em;
    }
    .field-value {
      font-size: 8pt; color: ${c.ink}; line-height: 1.35;
      font-variant-numeric: tabular-nums;
    }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5mm; }
    .info-grid:empty { display: none; }
    .info-item {
      background: ${c.surface};
      border: .25mm solid ${c.lineSoft};
      border-radius: 1.5mm;
      padding: 2mm 2.4mm;
      break-inside: avoid;
    }
    .info-label { font-size: 6pt; font-weight: 700; color: ${c.muted}; text-transform: uppercase; letter-spacing: .05em; }
    .info-value { font-size: 8pt; color: ${c.ink}; font-variant-numeric: tabular-nums; }
    .info-row { display: flex; gap: 2mm; padding: 1.1mm 0; border-bottom: .18mm solid ${c.lineSoft}; font-size: 7.4pt; }
    .info-row:last-child { border-bottom: 0; }
    .info-row .info-label { min-width: 46mm; font-weight: 700; color: ${c.ink}; text-transform: none; letter-spacing: 0; font-size: 7.4pt; }
    .info-row .info-value { flex: 1; color: ${c.text}; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }

    /* ── Tabelas ──────────────────────────────────────────────────────── */
    table { width: 100%; border-collapse: collapse; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; }
    th {
      background: ${c.graphite}; color: ${c.white};
      font-size: 6pt; font-weight: 700;
      text-transform: uppercase; letter-spacing: .04em;
      text-align: left; padding: 1.8mm 2mm;
      border-right: .18mm solid rgba(255,255,255,.25);
    }
    th:last-child { border-right: 0; }
    td {
      font-size: 7.2pt; color: ${c.text};
      padding: 1.6mm 2mm; vertical-align: top;
      border-bottom: .18mm solid ${c.lineSoft};
      font-variant-numeric: tabular-nums;
    }
    tbody tr:last-child td { border-bottom: 0; }
    .num, td.num, .right { text-align: right; white-space: nowrap; }
    .center { text-align: center; }
    .checklist-table { border: .25mm solid ${c.line}; border-radius: 1.5mm; overflow: hidden; }
    .checklist-table th:nth-child(2) { text-align: center; width: 18mm; }
    .checklist-table td:nth-child(2) { text-align: center; }

    /* ── Detalhe do item de checklist ─────────────────────────────────── */
    .item-fields { margin-top: 1mm; font-size: 6.6pt; color: ${c.muted}; font-variant-numeric: tabular-nums; }
    .item-note {
      margin-top: 1.2mm; padding: 1.2mm 2mm;
      background: ${c.surface}; border-left: .6mm solid ${c.line};
      font-size: 6.8pt; color: ${c.text}; font-style: italic;
    }
    .item-photos { display: flex; flex-wrap: wrap; gap: 2mm; margin-top: 1.6mm; }
    .item-photo {
      width: 26mm; border: .25mm solid ${c.line}; border-radius: 1mm;
      overflow: hidden; background: ${c.surface};
    }
    .item-photo img { display: block; width: 100%; height: 18mm; object-fit: cover; }
    .item-photo p { padding: .8mm 1.2mm; font-size: 5.6pt; color: ${c.muted}; word-break: break-word; }

    /* ── Marcações (conforme / não conforme) ──────────────────────────── */
    .check-item {
      display: flex; align-items: flex-start; gap: 2mm;
      font-size: 7.4pt; color: ${c.ink};
      padding: .9mm 0;
      break-inside: avoid;
    }
    .check-icon-yes, .check-icon-no {
      display: inline-block; width: 3.2mm; height: 3.2mm;
      border: .3mm solid ${c.graphite}; border-radius: .5mm;
      text-align: center; line-height: 2.8mm;
      font-size: 6.4pt; font-weight: 900;
      flex: 0 0 auto;
    }
    .check-icon-yes { background: ${c.ink}; border-color: ${c.ink}; color: ${c.white}; }
    .check-icon-no { background: ${c.white}; color: transparent; }
    /* Ocorrência marcada (vazamento, falha): aí sim, vermelho. */
    .check-item.flagged { color: ${c.danger}; font-weight: 700; }
    .check-item.flagged .check-icon-yes { background: ${c.danger}; border-color: ${c.danger}; }

    /* ── Resultado ────────────────────────────────────────────────────── */
    .status-container { text-align: center; margin: 1mm 0 2mm; }
    .status-approved, .status-reproved {
      display: inline-block;
      padding: 2mm 6mm; border-radius: 1mm;
      font-family: ${FONT_TITLE};
      font-size: 12pt; font-weight: 800;
      text-transform: uppercase; letter-spacing: .08em;
    }
    .status-approved { border: .6mm solid ${c.ink}; color: ${c.ink}; background: ${c.white}; }
    .status-reproved { border: .6mm solid ${c.danger}; background: ${c.danger}; color: ${c.white}; }
    .conclusion-text { font-size: 7.6pt; color: ${c.text}; line-height: 1.5; text-align: justify; }

    /* ── Caixas de texto ──────────────────────────────────────────────── */
    .observations-box, .notes-box {
      background: ${c.surface};
      border: .25mm solid ${c.line}; border-radius: 1.5mm;
      padding: 2.4mm 3mm;
      font-size: 7.4pt; color: ${c.text}; line-height: 1.5;
      white-space: pre-wrap;
      break-inside: avoid;
    }
    .declaration { font-size: 7.2pt; color: ${c.text}; line-height: 1.5; text-align: justify; }

    /* ── Registro fotográfico ─────────────────────────────────────────── */
    .photo-section { margin-bottom: 3mm; break-inside: avoid; }
    .photo-section h4 {
      font-size: 7pt; font-weight: 800; color: ${c.ink};
      text-transform: uppercase; letter-spacing: .04em;
      margin-bottom: 1.8mm;
    }
    .photo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; }
    .photo-item {
      border: .25mm solid ${c.line}; border-radius: 1.5mm;
      overflow: hidden; background: ${c.surface};
      break-inside: avoid;
    }
    .photo-item img { display: block; width: 100%; height: 52mm; object-fit: cover; }
    .photo-caption {
      padding: 1.4mm 2mm;
      border-top: .25mm solid ${c.line};
      font-size: 6pt; color: ${c.muted};
      text-transform: uppercase; letter-spacing: .04em;
    }

    /* ── Assinaturas ──────────────────────────────────────────────────── */
    .signature-section { margin-top: 4mm; break-inside: avoid; }
    /* Ajusta às assinaturas que o documento tiver (1, 2 ou 3). */
    .signature-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(48mm, 1fr)); gap: 6mm; }
    .signature-box-container { break-inside: avoid; }
    .signature-box { min-height: 16mm; display: flex; align-items: flex-end; justify-content: center; }
    .signature-img { max-height: 15mm; max-width: 100%; }
    .signature-line { border-top: .3mm solid ${c.ink}; margin-top: 1mm; padding-top: 1.2mm; text-align: center; }
    .signature-name { font-size: 7.2pt; font-weight: 700; color: ${c.ink}; }
    .signature-label { font-size: 6pt; color: ${c.muted}; text-transform: uppercase; letter-spacing: .04em; }
    .signature-date { font-size: 6.4pt; color: ${c.text}; font-variant-numeric: tabular-nums; }

    /* ── Geolocalização ───────────────────────────────────────────────── */
    .geo-grid { display: flex; flex-wrap: wrap; gap: 6mm; }
    .geo-item { flex: 0 0 auto; }
    .geo-label { font-size: 6pt; color: ${c.muted}; text-transform: uppercase; letter-spacing: .05em; }
    .geo-value { font-size: 7.4pt; color: ${c.ink}; font-variant-numeric: tabular-nums; }

    /* ── Perguntas (relatórios de desempenho) ─────────────────────────── */
    .question-row {
      display: flex; justify-content: space-between; gap: 3mm;
      padding: 1.1mm 0;
      border-bottom: .18mm solid ${c.lineSoft};
      font-size: 7.4pt;
      break-inside: avoid;
    }
    .question-label { flex: 1; color: ${c.text}; }
    .question-value { min-width: 12mm; text-align: center; font-weight: 700; color: ${c.ink}; }

    /* ── Rodapé ───────────────────────────────────────────────────────── */
    .footer {
      margin-top: 6mm; padding-top: 2mm;
      border-top: .35mm solid ${c.graphite};
      display: flex; justify-content: space-between; align-items: baseline;
      font-size: 6.2pt; color: ${c.muted};
    }
    .footer .generated { color: ${c.text}; }
  `;
};

export const sanitizeHtml = (text: string | null | undefined): string => {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Conformidade no checklist: conforme é neutro, não conforme é vermelho — a cor
// fica reservada ao que exige atenção.
export const getChecklistValueSymbol = (value: "yes" | "no" | "na" | null): string => {
  switch (value) {
    case "yes":
      return `<span style="color: ${PDF_THEME.ink}; font-weight: 700;">&#10004;</span>`;
    case "no":
      return `<span style="color: ${PDF_THEME.danger}; font-weight: 800;">&#10008;</span>`;
    case "na":
      return `<span style="color: ${PDF_THEME.muted}; font-size: 6.4pt;">N/A</span>`;
    default:
      return `<span style="color: ${PDF_THEME.muted};">&ndash;</span>`;
  }
};
