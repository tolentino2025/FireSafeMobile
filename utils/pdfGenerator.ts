import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Inspection, InspectionType } from "@/contexts/InspectionContext";
import { ensureAllPhotosBase64 } from "@/utils/photoUtils";
import { parseLocalYMD, getLocalTimeZone } from "@/utils/dateUtils";
import { 
  PDF_THEME, 
  getBaseCss, 
  sanitizeHtml, 
  getChecklistValueSymbol 
} from "@/utils/pdf/pdfTheme";
import { 
  renderHeader, 
  renderFooter, 
  wrapDocument 
} from "@/utils/pdf/pdfLayout";
import { getLogoDataUri } from "@/utils/pdf/pdfAssets";
import { printHtml, shareOrPrintHtml } from "@/utils/pdf/pdfPrint";

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
  electric_pump: { en: "Electric Fire Pump", pt: "Bomba de Incêndio Elétrica" },
  diesel_pump: { en: "Diesel Fire Pump", pt: "Bomba de Incêndio Diesel" },
  aboveground: { en: "Aboveground Piping", pt: "Tubulação Aérea" },
  underground: { en: "Underground Piping", pt: "Tubulação Subterrânea" },
  hydrant_flow: { en: "Hydrant Flow Test", pt: "Teste de Vazão de Hidrante" },
  water_tank: { en: "Water Storage Tank", pt: "Tanque de Armazenamento de Água" },
  hazard_eval: { en: "Hazard Evaluation", pt: "Avaliação de Riscos" },
  standpipe: { en: "Standpipe & Hose System", pt: "Sistema de Standpipe e Mangueiras" },
  fire_service_mains: { en: "Fire Service Mains", pt: "Rede Principal de Incêndio" },
  fm85a: { en: "FM Global Certificate FM85A", pt: "Certificado FM Global FM85A" },
  hydrostatic_test: { en: "Hydrostatic Test", pt: "Teste Hidrostático" },
};

interface GeneratePdfOptions {
  inspection: Inspection;
  language: "en" | "pt-BR";
  companyName?: string;
  companyLogo?: string;
}

const formatDate = (dateString: string, language: string): string => {
  if (!dateString) return "-";
  const date = parseLocalYMD(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const timeZone = getLocalTimeZone();
  
  if (language === "pt-BR") {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone,
    });
  }
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  });
};


const numericFieldLabels = {
  en: {
    staticPsi: "Static Pressure (psi)",
    residualPsi: "Residual Pressure (psi)",
    pressureDrop: "Pressure Drop (psi)",
    airPressurePsi: "Air Pressure (psi)",
    tripTimeSec: "Trip Time (sec)",
    waterDeliveryTimeMin: "Water Delivery Time (min)",
    flowGpm: "Flow (gpm)",
    operationTimeSec: "Operation Time (sec)",
    operatingPsi: "Operating Pressure (psi)",
    suctionPsi: "Suction Pressure (psi)",
    dischargePsi: "Discharge Pressure (psi)",
    noFlowPsi: "No Flow Pressure (psi)",
    ratedFlowPsi: "Rated Flow Pressure (psi)",
    peakFlowPsi: "Peak Flow Pressure (psi)",
    rpmValue: "RPM",
    voltageReading: "Voltage (V)",
    amperageReading: "Amperage (A)",
    foamExpansionRatio: "Foam Expansion Ratio (%)",
    foamDrainTime: "Foam Drain Time (min)",
    pitotPsi: "Pitot Pressure (psi)",
    tankCapacity: "Tank Capacity (gal)",
    waterLevelPercent: "Water Level (%)",
    waterTempF: "Water Temperature (F)",
  },
  "pt-BR": {
    staticPsi: "Pressao Estatica (psi)",
    residualPsi: "Pressao Residual (psi)",
    pressureDrop: "Queda de Pressao (psi)",
    airPressurePsi: "Pressao de Ar (psi)",
    tripTimeSec: "Tempo de Disparo (seg)",
    waterDeliveryTimeMin: "Tempo de Entrega de Agua (min)",
    flowGpm: "Vazao (gpm)",
    operationTimeSec: "Tempo de Operacao (seg)",
    operatingPsi: "Pressao de Operacao (psi)",
    suctionPsi: "Pressao de Succao (psi)",
    dischargePsi: "Pressao de Descarga (psi)",
    noFlowPsi: "Pressao Sem Vazao (psi)",
    ratedFlowPsi: "Pressao de Vazao Nominal (psi)",
    peakFlowPsi: "Pressao de Pico de Vazao (psi)",
    rpmValue: "RPM",
    voltageReading: "Tensao (V)",
    amperageReading: "Corrente (A)",
    foamExpansionRatio: "Taxa de Expansao da Espuma (%)",
    foamDrainTime: "Tempo de Drenagem da Espuma (min)",
    pitotPsi: "Pressao Pitot (psi)",
    tankCapacity: "Capacidade do Tanque (gal)",
    waterLevelPercent: "Nivel de Agua (%)",
    waterTempF: "Temperatura da Agua (F)",
  },
};

const translations = {
  en: {
    inspectionReport: "Inspection Report",
    nfpaCompliance: "NFPA 25 Compliant",
    companyInformation: "Company Information",
    companyName: "Company Name",
    cnpj: "Tax ID",
    propertyInformation: "Property Information",
    propertyName: "Property Name",
    address: "Address",
    city: "City",
    state: "State",
    zipCode: "ZIP Code",
    phone: "Phone",
    email: "Email",
    contact: "Contact",
    inspectionDetails: "Inspection Details",
    inspectorInformation: "Inspector Information",
    inspectionType: "Inspection Type",
    inspector: "Inspector",
    inspectorRole: "Role",
    date: "Date",
    frequency: "Frequency",
    contractNo: "Contract No.",
    firePumpInformation: "Fire Pump Information",
    controlPanelInformation: "Control Panel Information",
    pumpTag: "Pump Tag",
    pumpType: "Pump Type",
    manufacturer: "Manufacturer",
    model: "Model",
    flowRate: "Flow Rate",
    pressure: "Pressure",
    motorPower: "Motor Power",
    serialNumber: "Serial Number",
    installationDate: "Installation Date",
    panelTag: "Panel Tag",
    startingType: "Starting Type",
    automaticTransfer: "Automatic Transfer",
    electricMain: "Electric Main",
    dieselMain: "Diesel Main",
    jockey: "Jockey",
    yes: "Yes",
    no: "No",
    notRegistered: "Not registered",
    checklistResults: "Checklist Results",
    item: "Item",
    status: "Status",
    psi: "PSI",
    staticPsi: "Static Pressure",
    observations: "Observations",
    signature: "Inspector Signature",
    photos: "Inspection Photos",
    generatedOn: "Report generated on",
    page: "Page",
    geolocation: "Geolocation",
    latitude: "Latitude",
    longitude: "Longitude",
    accuracy: "Accuracy",
    meters: "meters",
    notAvailable: "Not available",
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
    companyInformation: "Informações da Empresa",
    companyName: "Nome da Empresa",
    cnpj: "CNPJ",
    propertyInformation: "Informações da Propriedade",
    propertyName: "Nome da Propriedade",
    address: "Endereço",
    city: "Cidade",
    state: "Estado",
    zipCode: "CEP",
    phone: "Telefone",
    email: "Email",
    contact: "Contato",
    inspectionDetails: "Detalhes da Inspeção",
    inspectorInformation: "Informações do Inspetor",
    inspectionType: "Tipo de Inspeção",
    inspector: "Inspetor",
    inspectorRole: "Cargo",
    date: "Data",
    frequency: "Frequência",
    contractNo: "Nº do Contrato",
    firePumpInformation: "Informações da Bomba de Incêndio",
    controlPanelInformation: "Informações do Painel de Comando",
    pumpTag: "Tag da Bomba",
    pumpType: "Tipo de Bomba",
    manufacturer: "Fabricante",
    model: "Modelo",
    flowRate: "Vazão",
    pressure: "Pressão",
    motorPower: "Potência do Motor",
    serialNumber: "Número de Série",
    installationDate: "Data de Instalação",
    panelTag: "Tag do Painel",
    startingType: "Tipo de Partida",
    automaticTransfer: "Transferência Automática",
    electricMain: "Bomba Elétrica Principal",
    dieselMain: "Bomba Diesel Principal",
    jockey: "Bomba Jockey",
    yes: "Sim",
    no: "Não",
    notRegistered: "Não cadastrado",
    checklistResults: "Resultados da Verificação",
    item: "Item",
    status: "Status",
    psi: "PSI",
    staticPsi: "Pressão Estática",
    observations: "Observações",
    signature: "Assinatura do Inspetor",
    photos: "Fotos da Inspeção",
    generatedOn: "Relatório gerado em",
    page: "Página",
    geolocation: "Geolocalização",
    latitude: "Latitude",
    longitude: "Longitude",
    accuracy: "Precisão",
    meters: "metros",
    notAvailable: "Não disponível",
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
  photosWithBase64: PhotoWithBase64[],
  logoDataUri: string | null = null
): string => {
  const { inspection, language, companyName = "FireSafe ITM" } = options;
  const t = translations[language];
  const typeName = INSPECTION_TYPE_NAMES[inspection.type][language === "pt-BR" ? "pt" : "en"];
  const freq = t.frequencies[inspection.frequency as keyof typeof t.frequencies] || inspection.frequency;

  const companyData = inspection.companyData;
  const inspectorData = inspection.inspectorData;

  const companyAddress = companyData
    ? [companyData.address, companyData.city, companyData.state, companyData.zipCode]
        .filter(Boolean)
        .join(", ")
    : inspection.propertyAddress;

  const nfLabels = numericFieldLabels[language];
  
  const getNumericFieldLabel = (labelKey: string): string => {
    return nfLabels[labelKey as keyof typeof nfLabels] || labelKey;
  };

  const getNumericFieldsHtml = (item: any, excludePsi: boolean = false): string => {
    if (!excludePsi && item.psiValue && !item.numericFields?.length) {
      return `<div style="font-size: 11px; color: #6B7280; margin-top: 4px;">${t.staticPsi || "Pressure"}: ${sanitizeHtml(item.psiValue)} psi</div>`;
    }
    if (!item.numericFields?.length) return "";
    const filledFields = item.numericFields.filter((f: any) => {
      if (!f.value) return false;
      if (excludePsi && f.unit === "psi") return false;
      return true;
    });
    if (!filledFields.length) return "";
    return `<div style="margin-top: 6px; font-size: 11px; color: #6B7280;">
      ${filledFields.map((f: any) => `<div>${getNumericFieldLabel(f.labelKey)}: ${sanitizeHtml(f.value)} ${sanitizeHtml(f.unit) || ""}</div>`).join("")}
    </div>`;
  };

  const getNotesHtml = (notes: string | undefined): string => {
    if (!notes) return "";
    return `<div style="margin-top: 6px; font-size: 11px; color: #4B5563; background: #F3F4F6; padding: 6px 8px; border-radius: 4px; font-style: italic;">${sanitizeHtml(notes)}</div>`;
  };

  const getItemPhotosHtml = (photos: any[] | undefined): string => {
    if (!photos || photos.length === 0) return "";
    const validPhotos = photos.filter((p) => p.base64);
    if (validPhotos.length === 0) return "";
    return `
      <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 8px;">
        ${validPhotos.map((photo) => `
          <div style="width: 100px; border: 1px solid #E5E7EB; border-radius: 6px; overflow: hidden; background: #F9FAFB;">
            <img src="${photo.base64}" style="width: 100%; height: 75px; object-fit: cover;" />
            ${photo.caption ? `<p style="margin: 0; padding: 4px 6px; font-size: 9px; color: #4B5563; word-break: break-word;">${sanitizeHtml(photo.caption)}</p>` : ""}
          </div>
        `).join("")}
      </div>
    `;
  };

  const hasAnyPsi = inspection.checklist.some(
    (item: any) =>
      item.psiValue ||
      item.numericFields?.some((f: any) => f.unit === "psi" && f.value)
  );

  const getPsiCellValue = (item: any): string => {
    if (item.psiValue) {
      return sanitizeHtml(item.psiValue);
    }
    const psiFields = item.numericFields?.filter((f: any) => f.unit === "psi" && f.value) || [];
    if (psiFields.length > 0) {
      return psiFields.map((f: any) => sanitizeHtml(f.value)).join(", ");
    }
    return "";
  };

  const checklistRows = inspection.checklist
    .map(
      (item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB;">
          ${sanitizeHtml(item.label)}
          ${getNumericFieldsHtml(item, hasAnyPsi)}
          ${getNotesHtml(item.notes)}
          ${getItemPhotosHtml(item.photos)}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; text-align: center; vertical-align: top;">${getChecklistValueSymbol(item.value)}</td>
        ${hasAnyPsi ? `<td style="padding: 10px; border-bottom: 1px solid #E5E7EB; text-align: center; vertical-align: top;">${getPsiCellValue(item)}</td>` : ""}
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

  const hasSignatureImage =
    typeof inspection.signature === "string" &&
    inspection.signature.startsWith("data:");
  const signatureHtml = hasSignatureImage
    ? `
    <div style="margin-top: 30px; page-break-inside: avoid;">
      <h2 style="color: #1A365D; border-bottom: 2px solid #FF6B00; padding-bottom: 8px; font-size: 16px;">${t.signature}</h2>
      <div style="margin-top: 15px; padding: 15px; background: #F9FAFB; border-radius: 8px; display: inline-block;">
        <img src="${inspection.signature}" style="max-height: 80px;" />
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #6B7280;">${sanitizeHtml(inspection.inspectorName) || "-"}</p>
        ${inspectorData?.role ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #9CA3AF;">${sanitizeHtml(inspectorData.role)}</p>` : ""}
      </div>
    </div>
  `
    : "";

  const companySection = companyData
    ? `
    <div class="section">
      <h2 class="section-title">${t.companyInformation}</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">${t.companyName}</div>
          <div class="info-value">${sanitizeHtml(companyData.name) || "-"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.cnpj}</div>
          <div class="info-value">${sanitizeHtml(companyData.cnpj) || "-"}</div>
        </div>
        <div class="info-item" style="grid-column: span 2;">
          <div class="info-label">${t.address}</div>
          <div class="info-value">${sanitizeHtml(companyAddress) || "-"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.contact}</div>
          <div class="info-value">${sanitizeHtml(companyData.contactName) || "-"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.phone}</div>
          <div class="info-value">${sanitizeHtml(companyData.contactPhone) || "-"}</div>
        </div>
        <div class="info-item" style="grid-column: span 2;">
          <div class="info-label">${t.email}</div>
          <div class="info-value">${sanitizeHtml(companyData.contactEmail) || "-"}</div>
        </div>
      </div>
    </div>
    `
    : `
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
    `;

  const inspectorSection = inspectorData
    ? `
    <div class="section">
      <h2 class="section-title">${t.inspectorInformation}</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">${t.inspector}</div>
          <div class="info-value">${sanitizeHtml(inspectorData.name) || "-"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.inspectorRole}</div>
          <div class="info-value">${sanitizeHtml(inspectorData.role) || "-"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.phone}</div>
          <div class="info-value">${sanitizeHtml(inspectorData.phone) || "-"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.email}</div>
          <div class="info-value">${sanitizeHtml(inspectorData.email) || "-"}</div>
        </div>
      </div>
    </div>
    `
    : "";

  const firePumpData = inspection.firePumpData;
  const firePumpPanelData = inspection.firePumpPanelData;

  const getPumpTypeLabel = (pumpType: string): string => {
    switch (pumpType) {
      case "electric_main":
        return t.electricMain;
      case "diesel_main":
        return t.dieselMain;
      case "jockey":
        return t.jockey;
      default:
        return pumpType;
    }
  };

  const firePumpSection = firePumpData
    ? `
    <div class="section">
      <h2 class="section-title">${t.firePumpInformation}</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">${t.pumpTag}</div>
          <div class="info-value">${sanitizeHtml(firePumpData.tag) || "-"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.pumpType}</div>
          <div class="info-value">${getPumpTypeLabel(firePumpData.type)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.manufacturer}</div>
          <div class="info-value">${sanitizeHtml(firePumpData.manufacturer) || "-"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.model}</div>
          <div class="info-value">${sanitizeHtml(firePumpData.model) || "-"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.flowRate}</div>
          <div class="info-value">${firePumpData.ratedFlowGpm ? `${firePumpData.ratedFlowGpm} GPM` : "-"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.pressure}</div>
          <div class="info-value">${firePumpData.ratedPressurePsi ? `${firePumpData.ratedPressurePsi} PSI` : "-"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.motorPower}</div>
          <div class="info-value">${firePumpData.powerHP ? `${firePumpData.powerHP} HP` : "-"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.serialNumber}</div>
          <div class="info-value">${sanitizeHtml(firePumpData.serialNumber) || "-"}</div>
        </div>
      </div>
    </div>
    `
    : "";

  const firePumpPanelSection = firePumpPanelData
    ? `
    <div class="section">
      <h2 class="section-title">${t.controlPanelInformation}</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">${t.panelTag}</div>
          <div class="info-value">${sanitizeHtml(firePumpPanelData.tag) || "-"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.manufacturer}</div>
          <div class="info-value">${sanitizeHtml(firePumpPanelData.manufacturer) || "-"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.model}</div>
          <div class="info-value">${sanitizeHtml(firePumpPanelData.model) || "-"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.startingType}</div>
          <div class="info-value">${sanitizeHtml(firePumpPanelData.startingType) || "-"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.automaticTransfer}</div>
          <div class="info-value">${firePumpPanelData.hasAutomaticTransfer ? t.yes : t.no}</div>
        </div>
      </div>
    </div>
    `
    : "";

  const extraCss = hasAnyPsi ? `
    .checklist-table th:nth-child(3) {
      text-align: center;
      width: 80px;
    }
  ` : "";

  const headerHtml = renderHeader({
    companyName,
    reportTitle: t.inspectionReport,
    badgeText: t.nfpaCompliance,
    showBadge: true,
    logoDataUri,
  });

  const bodyHtml = `
    ${companySection}

    ${inspectorSection}

    ${firePumpSection}

    ${firePumpPanelSection}

    <div class="section">
      <h2 class="section-title">${t.inspectionDetails}</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">${t.inspectionType}</div>
          <div class="info-value">${typeName}</div>
        </div>
        ${!inspectorData ? `
        <div class="info-item">
          <div class="info-label">${t.inspector}</div>
          <div class="info-value">${sanitizeHtml(inspection.inspectorName) || "-"}</div>
        </div>
        ` : `
        <div class="info-item">
          <div class="info-label">${t.contractNo}</div>
          <div class="info-value">${sanitizeHtml(inspection.contractNo) || "-"}</div>
        </div>
        `}
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
            ${hasAnyPsi ? `<th>${t.psi}</th>` : ""}
          </tr>
        </thead>
        <tbody>
          ${checklistRows}
        </tbody>
      </table>
    </div>

    ${
      inspection.geoLocation
        ? `
    <div class="section" style="page-break-inside: avoid;">
      <h2 class="section-title">${t.geolocation}</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">${t.latitude}</div>
          <div class="info-value">${inspection.geoLocation.latitude.toFixed(6)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.longitude}</div>
          <div class="info-value">${inspection.geoLocation.longitude.toFixed(6)}</div>
        </div>
        ${
          inspection.geoLocation.accuracy
            ? `
        <div class="info-item">
          <div class="info-label">${t.accuracy}</div>
          <div class="info-value">${inspection.geoLocation.accuracy.toFixed(1)} ${t.meters}</div>
        </div>
        `
            : ""
        }
      </div>
    </div>
    `
        : ""
    }

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
  `;

  const footerHtml = renderFooter({
    generatedText: t.generatedOn,
    dateText: formatDate(new Date().toISOString(), language),
    tagline: "FireSafe ITM - Fire Protection System Inspection, Testing & Maintenance",
  });

  return wrapDocument({
    title: `${t.inspectionReport} - ${inspection.propertyName || "Inspection"}`,
    headerHtml,
    bodyHtml,
    footerHtml,
    extraCss,
  });
};

// Monta o HTML COMPLETO do relatório padrão (com fotos em base64 + logo).
// É a mesma fonte usada para imprimir, compartilhar e gerar URI.
const buildInspectionPdfHtml = async (
  options: GeneratePdfOptions,
): Promise<string> => {
  const [photosWithBase64, logoDataUri] = await Promise.all([
    ensureAllPhotosBase64(options.inspection.photos || []),
    getLogoDataUri(),
  ]);

  const checklistWithPhotos = await Promise.all(
    (options.inspection.checklist || []).map(async (item) => {
      if (!item.photos || item.photos.length === 0) return item;
      const photosWithBase64Item = await ensureAllPhotosBase64(item.photos as any);
      return { ...item, photos: photosWithBase64Item };
    })
  );

  const inspectionWithProcessedPhotos = {
    ...options.inspection,
    checklist: checklistWithPhotos,
  };

  const optionsWithProcessedPhotos = {
    ...options,
    inspection: inspectionWithProcessedPhotos,
  };

  return generateInspectionPdfHtmlWithPhotos(
    optionsWithProcessedPhotos,
    photosWithBase64,
    logoDataUri,
  );
};

// Imprime o relatório completo. Web: abre o HTML formatado em nova aba e imprime.
// Native: gera arquivo PDF e abre o diálogo de impressão.
export const generateAndPrintPdf = async (options: GeneratePdfOptions): Promise<void> => {
  const html = await buildInspectionPdfHtml(options);
  await printHtml(html);
};

// Gera um URI de PDF (native). Usado, p.ex., para anexar em e-mail.
export const generatePdfUri = async (options: GeneratePdfOptions): Promise<string> => {
  const html = await buildInspectionPdfHtml(options);
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
};

// Compartilha o relatório completo. Web: nova aba + impressão. Native: share sheet.
export const generateAndSharePdf = async (options: GeneratePdfOptions): Promise<void> => {
  const html = await buildInspectionPdfHtml(options);
  await shareOrPrintHtml(
    html,
    `${options.inspection.propertyName || "Inspection"} Report`,
  );
};

export const generateInspectionPdfHtml = generateInspectionPdfHtmlWithPhotos;
