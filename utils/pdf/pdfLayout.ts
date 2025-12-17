import { getBaseCss, PDF_THEME } from './pdfTheme';

export interface HeaderParams {
  companyName?: string;
  reportTitle: string;
  badgeText?: string;
  showBadge?: boolean;
}

export interface FooterParams {
  generatedText: string;
  dateText: string;
  tagline?: string;
}

export interface WrapDocumentParams {
  title?: string;
  headerHtml: string;
  bodyHtml: string;
  footerHtml: string;
  extraCss?: string;
}

export const renderHeader = (params: HeaderParams): string => {
  const { 
    companyName = "FireSafe ITM", 
    reportTitle, 
    badgeText,
    showBadge = true 
  } = params;
  
  return `
    <div class="header">
      <div>
        <div class="logo-section">
          <div class="logo-icon">F</div>
          <div>
            <div class="company-name">${companyName}</div>
            <div class="report-title">${reportTitle}</div>
          </div>
        </div>
      </div>
      ${showBadge && badgeText ? `<div class="compliance-badge">${badgeText}</div>` : ''}
    </div>
  `;
};

export const renderFooter = (params: FooterParams): string => {
  const { 
    generatedText, 
    dateText, 
    tagline = "FireSafe ITM - Fire Protection System Inspection, Testing & Maintenance" 
  } = params;
  
  return `
    <div class="footer">
      <p>${generatedText}: ${dateText}</p>
      <p style="margin-top: 5px;">${tagline}</p>
    </div>
  `;
};

export const wrapDocument = (params: WrapDocumentParams): string => {
  const { 
    title = "Report", 
    headerHtml, 
    bodyHtml, 
    footerHtml,
    extraCss = "" 
  } = params;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        ${getBaseCss()}
        ${extraCss}
      </style>
    </head>
    <body>
      <div class="page">
        ${headerHtml}
        ${bodyHtml}
        ${footerHtml}
      </div>
    </body>
    </html>
  `;
};

export const renderSection = (title: string, content: string): string => {
  return `
    <div class="section">
      <h2 class="section-title">${title}</h2>
      ${content}
    </div>
  `;
};

export const renderInfoGrid = (items: Array<{ label: string; value: string; span?: number }>): string => {
  const itemsHtml = items.map(item => `
    <div class="info-item"${item.span ? ` style="grid-column: span ${item.span};"` : ''}>
      <div class="info-label">${item.label}</div>
      <div class="info-value">${item.value || "-"}</div>
    </div>
  `).join('');
  
  return `<div class="info-grid">${itemsHtml}</div>`;
};

export const renderSignatureBlock = (params: {
  signatureBase64?: string;
  name?: string;
  role?: string;
  title: string;
}): string => {
  if (!params.signatureBase64) return '';
  
  return `
    <div style="margin-top: 30px; page-break-inside: avoid;">
      <h2 style="color: ${PDF_THEME.brandPrimary}; border-bottom: 2px solid ${PDF_THEME.brandAccent}; padding-bottom: 8px; font-size: 16px;">${params.title}</h2>
      <div style="margin-top: 15px; padding: 15px; background: ${PDF_THEME.bgSoft}; border-radius: 8px; display: inline-block;">
        <img src="${params.signatureBase64}" style="max-height: 80px;" />
        ${params.name ? `<p style="margin: 10px 0 0 0; font-size: 12px; color: ${PDF_THEME.muted};">${params.name}</p>` : ''}
        ${params.role ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: ${PDF_THEME.mutedLight};">${params.role}</p>` : ''}
      </div>
    </div>
  `;
};

export const renderPhotosSection = (params: {
  photos: Array<{ base64?: string; caption?: string }>;
  title: string;
}): string => {
  const validPhotos = params.photos.filter(p => p.base64);
  if (validPhotos.length === 0) return '';
  
  return `
    <div style="margin-top: 30px; page-break-inside: avoid;">
      <h2 style="color: ${PDF_THEME.brandPrimary}; border-bottom: 2px solid ${PDF_THEME.brandAccent}; padding-bottom: 8px; font-size: 16px;">${params.title}</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px;">
        ${validPhotos.map(photo => `
          <div style="width: 200px; border: 1px solid ${PDF_THEME.border}; border-radius: 8px; overflow: hidden;">
            <img src="${photo.base64}" style="width: 100%; height: 150px; object-fit: cover;" />
            ${photo.caption ? `<p style="margin: 0; padding: 8px; font-size: 11px; color: #4B5563;">${photo.caption}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

export const renderGeolocationSection = (params: {
  latitude: number;
  longitude: number;
  accuracy?: number;
  translations: {
    title: string;
    latitude: string;
    longitude: string;
    accuracy: string;
    meters: string;
  };
}): string => {
  const { latitude, longitude, accuracy, translations: t } = params;
  
  return `
    <div class="section" style="page-break-inside: avoid;">
      <h2 class="section-title">${t.title}</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">${t.latitude}</div>
          <div class="info-value">${latitude.toFixed(6)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.longitude}</div>
          <div class="info-value">${longitude.toFixed(6)}</div>
        </div>
        ${accuracy ? `
        <div class="info-item">
          <div class="info-label">${t.accuracy}</div>
          <div class="info-value">${accuracy.toFixed(1)} ${t.meters}</div>
        </div>
        ` : ''}
      </div>
    </div>
  `;
};

export { PDF_THEME, getBaseCss, sanitizeHtml, getChecklistValueSymbol } from './pdfTheme';
