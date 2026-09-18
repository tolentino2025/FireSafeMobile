import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import {
  PerformanceTest,
  DieselPerformanceTest,
  TestReading,
  DieselTestReading,
  Deficiency,
} from "@/types/performanceTest";
import { parseLocalYMD, getLocalTimeZone } from "@/utils/dateUtils";
import { getBaseCss, PDF_THEME } from "@/utils/pdf/pdfTheme";

const sanitizeHtml = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

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

const getResultSymbol = (pass: boolean, t: any): string => {
  return pass
    ? `<span style="color: #22863A; font-weight: bold;">${t.pass}</span>`
    : `<span style="color: #DC2626; font-weight: bold;">${t.fail}</span>`;
};

const getOverallResultBadge = (result: "pass" | "fail" | "conditional", t: any): string => {
  const colors = {
    pass: { bg: "#22863A", text: "white" },
    fail: { bg: "#DC2626", text: "white" },
    conditional: { bg: "#F59E0B", text: "white" },
  };
  const labels = {
    pass: t.pass,
    fail: t.fail,
    conditional: t.conditional,
  };
  const color = colors[result];
  return `<span style="background: ${color.bg}; color: ${color.text}; padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 14px;">${labels[result]}</span>`;
};

const translations = {
  en: {
    title: "Fire Pump Performance Test Report",
    electricPump: "Electric Fire Pump",
    dieselPump: "Diesel Fire Pump",
    nfpaCompliance: "NFPA 25 Compliant",
    contractorInfo: "Contractor Information",
    companyName: "Company Name",
    address: "Address",
    phone: "Phone",
    fax: "Fax",
    email: "Email",
    license: "License No.",
    jobInfo: "Job/Site Information",
    jobName: "Job Name",
    jobNumber: "Job Number",
    testDate: "Test Date",
    testLocation: "Test Location",
    testMethod: "Test Method",
    weather: "Weather",
    ambientTemp: "Ambient Temperature",
    pumpEquipment: "Pump Equipment",
    pumpTag: "Pump Tag",
    manufacturer: "Manufacturer",
    model: "Model",
    serialNumber: "Serial No.",
    orientation: "Orientation",
    yearInstalled: "Year Installed",
    ratedFlow: "Rated Flow",
    ratedPressure: "Rated Pressure",
    ratedSpeed: "Rated Speed",
    shutoffPressure: "Shutoff Pressure",
    peakFlow: "Peak Flow",
    driverInfo: "Driver Information",
    driverType: "Driver Type",
    horsePower: "Horsepower",
    ratedRpm: "Rated RPM",
    ratedVoltage: "Rated Voltage",
    phases: "Phases",
    hertz: "Frequency",
    fullLoadAmp: "Full Load Amperage",
    lockedRotorAmp: "Locked Rotor Amperage",
    serviceFactor: "Service Factor",
    controllerInfo: "Controller Information",
    panelTag: "Panel Tag",
    supplyVoltage: "Supply Voltage",
    startingType: "Starting Type",
    autoTransfer: "Automatic Transfer",
    pressureStart: "Pressure Start",
    pressureStop: "Pressure Stop",
    powerSupply: "Power Supply",
    normalSource: "Normal Source",
    emergencySource: "Emergency Source",
    voltageL1L2: "L1-L2",
    voltageL2L3: "L2-L3",
    voltageL3L1: "L3-L1",
    transferTime: "Transfer Time",
    supplyConditions: "Water Supply Conditions",
    supplySource: "Supply Source",
    staticPressure: "Static Pressure",
    residualPressure: "Residual Pressure",
    reservoirLevel: "Reservoir Level",
    waterTemp: "Water Temperature",
    systemDemand: "System Demand",
    demandGpm: "System Demand",
    demandPsi: "Required Pressure",
    hoseDemand: "Hose Demand",
    totalDemand: "Total Demand",
    testReadings: "Test Readings",
    flowPercent: "Flow %",
    flowGpm: "GPM",
    suctionPsi: "Suction PSI",
    dischargePsi: "Discharge PSI",
    netPsi: "Net PSI",
    rpm: "RPM",
    voltage: "Voltage",
    amperage: "Amperage",
    resultsSummary: "Results Summary",
    shutoffTest: "Shutoff (Churn) Test",
    ratedFlowTest: "Rated Flow Test",
    peakFlowTest: "Peak Flow Test",
    actual: "Actual",
    rated: "Rated",
    minimum: "Minimum",
    percent: "% of Rated",
    result: "Result",
    overallResult: "Overall Result",
    pass: "PASS",
    fail: "FAIL",
    conditional: "CONDITIONAL",
    observations: "Observations & Deficiencies",
    generalObservations: "General Observations",
    deficiencies: "Deficiencies",
    severity: "Severity",
    action: "Recommended Action",
    targetDate: "Target Date",
    resolved: "Resolved",
    recommendations: "Recommendations",
    nextTestDate: "Next Test Due Date",
    signatures: "Signatures",
    conductedBy: "Test Conducted By",
    name: "Name",
    title_label: "Title",
    company: "Company",
    date: "Date",
    signature: "Signature",
    generatedOn: "Report generated on",
    yes: "Yes",
    no: "No",
    minor: "Minor",
    major: "Major",
    critical: "Critical",
    dieselInfo: "Diesel Engine Information",
    cylinders: "Cylinders",
    displacement: "Displacement",
    fuelTankCapacity: "Fuel Tank Capacity",
    fuelLevel: "Fuel Level",
    oilLevel: "Oil Level",
    coolantLevel: "Coolant Level",
    batteryVoltage: "Battery Voltage",
    engineBlockHeater: "Engine Block Heater",
    batteryInfo: "Battery Information",
    startingBatteries: "Starting Batteries",
    chargerType: "Charger Type",
    chargerVoltage: "Charger Voltage",
    alternateSource: "Alternate Power Source",
    multiplePumpOperation: "Multiple Pump Operation",
    numberOfPumps: "Number of Pumps",
    operationSequence: "Operation Sequence",
    allPumpsTested: "All Pumps Tested Individually",
    combinedFlowTest: "Combined Flow Test",
    transferSwitchTest: "Transfer Switch Test",
    normalToEmergency: "Normal to Emergency",
    emergencyToNormal: "Emergency to Normal",
    stages: "Stages",
    impellerDiameter: "Impeller Diameter",
    testResult: "Test Result",
    notes: "Notes",
    isMultiplePumpSystem: "Multiple Pump System",
    hasTransferSwitch: "Has Transfer Switch",
  },
  "pt-BR": {
    title: "Relatório de Teste de Desempenho de Bomba de Incêndio",
    electricPump: "Bomba de Incêndio Elétrica",
    dieselPump: "Bomba de Incêndio Diesel",
    nfpaCompliance: "Conforme NFPA 25",
    contractorInfo: "Informações do Contratante",
    companyName: "Nome da Empresa",
    address: "Endereço",
    phone: "Telefone",
    fax: "Fax",
    email: "E-mail",
    license: "Licença",
    jobInfo: "Informações do Local/Obra",
    jobName: "Nome da Obra",
    jobNumber: "Número da Obra",
    testDate: "Data do Teste",
    testLocation: "Local do Teste",
    testMethod: "Método de Teste",
    weather: "Condições Climáticas",
    ambientTemp: "Temperatura Ambiente",
    pumpEquipment: "Equipamento da Bomba",
    pumpTag: "Tag da Bomba",
    manufacturer: "Fabricante",
    model: "Modelo",
    serialNumber: "Nº de Série",
    orientation: "Orientação",
    yearInstalled: "Ano de Instalação",
    ratedFlow: "Vazão Nominal",
    ratedPressure: "Pressão Nominal",
    ratedSpeed: "Velocidade Nominal",
    shutoffPressure: "Pressão de Bloqueio",
    peakFlow: "Vazão de Pico",
    driverInfo: "Informações do Acionador",
    driverType: "Tipo de Acionador",
    horsePower: "Potência (HP)",
    ratedRpm: "RPM Nominal",
    ratedVoltage: "Tensão Nominal",
    phases: "Fases",
    hertz: "Frequência",
    fullLoadAmp: "Corrente Plena Carga",
    lockedRotorAmp: "Corrente Rotor Bloqueado",
    serviceFactor: "Fator de Serviço",
    controllerInfo: "Informações do Controlador",
    panelTag: "Tag do Painel",
    supplyVoltage: "Tensão de Alimentação",
    startingType: "Tipo de Partida",
    autoTransfer: "Transferência Automática",
    pressureStart: "Pressão de Partida",
    pressureStop: "Pressão de Parada",
    powerSupply: "Alimentação Elétrica",
    normalSource: "Fonte Normal",
    emergencySource: "Fonte de Emergência",
    voltageL1L2: "L1-L2",
    voltageL2L3: "L2-L3",
    voltageL3L1: "L3-L1",
    transferTime: "Tempo de Transferência",
    supplyConditions: "Condições de Suprimento de Água",
    supplySource: "Fonte de Suprimento",
    staticPressure: "Pressão Estática",
    residualPressure: "Pressão Residual",
    reservoirLevel: "Nível do Reservatório",
    waterTemp: "Temperatura da Água",
    systemDemand: "Demanda do Sistema",
    demandGpm: "Demanda do Sistema",
    demandPsi: "Pressão Requerida",
    hoseDemand: "Demanda de Mangueiras",
    totalDemand: "Demanda Total",
    testReadings: "Leituras do Teste",
    flowPercent: "% Vazão",
    flowGpm: "GPM",
    suctionPsi: "Sucção PSI",
    dischargePsi: "Descarga PSI",
    netPsi: "Líquido PSI",
    rpm: "RPM",
    voltage: "Tensão",
    amperage: "Corrente",
    resultsSummary: "Resumo dos Resultados",
    shutoffTest: "Teste de Bloqueio (Churn)",
    ratedFlowTest: "Teste de Vazão Nominal",
    peakFlowTest: "Teste de Vazão de Pico",
    actual: "Real",
    rated: "Nominal",
    minimum: "Mínimo",
    percent: "% do Nominal",
    result: "Resultado",
    overallResult: "Resultado Geral",
    pass: "APROVADO",
    fail: "REPROVADO",
    conditional: "CONDICIONAL",
    observations: "Observações e Deficiências",
    generalObservations: "Observações Gerais",
    deficiencies: "Deficiências",
    severity: "Gravidade",
    action: "Ação Recomendada",
    targetDate: "Data Prevista",
    resolved: "Resolvido",
    recommendations: "Recomendações",
    nextTestDate: "Próximo Teste Previsto",
    signatures: "Assinaturas",
    conductedBy: "Teste Realizado Por",
    name: "Nome",
    title_label: "Cargo",
    company: "Empresa",
    date: "Data",
    signature: "Assinatura",
    generatedOn: "Relatório gerado em",
    yes: "Sim",
    no: "Não",
    minor: "Menor",
    major: "Maior",
    critical: "Crítico",
    dieselInfo: "Informações do Motor Diesel",
    cylinders: "Cilindros",
    displacement: "Cilindrada",
    fuelTankCapacity: "Capacidade do Tanque",
    fuelLevel: "Nível de Combustível",
    oilLevel: "Nível de Óleo",
    coolantLevel: "Nível de Refrigerante",
    batteryVoltage: "Tensão da Bateria",
    engineBlockHeater: "Aquecedor do Bloco",
    batteryInfo: "Informações da Bateria",
    startingBatteries: "Baterias de Partida",
    chargerType: "Tipo de Carregador",
    chargerVoltage: "Tensão do Carregador",
    alternateSource: "Fonte Alternativa",
    multiplePumpOperation: "Operação de Múltiplas Bombas",
    numberOfPumps: "Número de Bombas",
    operationSequence: "Sequência de Operação",
    allPumpsTested: "Todas Bombas Testadas Individualmente",
    combinedFlowTest: "Teste de Vazão Combinada",
    transferSwitchTest: "Teste de Chave de Transferência",
    normalToEmergency: "Normal para Emergência",
    emergencyToNormal: "Emergência para Normal",
    stages: "Estágios",
    impellerDiameter: "Diâmetro do Impelidor",
    testResult: "Resultado do Teste",
    notes: "Notas",
    isMultiplePumpSystem: "Sistema de Múltiplas Bombas",
    hasTransferSwitch: "Possui Chave de Transferência",
  },
};

// Usa o sistema visual compartilhado (utils/pdf/pdfTheme) e acrescenta só o que
// é específico do teste de desempenho: leituras, deficiências e resultado geral.
// Enumerações do formulário saíam cruas no PDF ("flow_meter", "city_water").
const TEST_METHOD_LABELS: Record<string, { en: string; "pt-BR": string }> = {
  flow_meter: { en: "Flow meter", "pt-BR": "Medidor de vazão" },
  pitot_tube: { en: "Pitot tube", "pt-BR": "Tubo de Pitot" },
  flow_loop: { en: "Flow loop", "pt-BR": "Circuito de vazão" },
  bypass: { en: "Bypass", "pt-BR": "Bypass" },
  other: { en: "Other", "pt-BR": "Outro" },
};

const SUPPLY_SOURCE_LABELS: Record<string, { en: string; "pt-BR": string }> = {
  city_water: { en: "City water", "pt-BR": "Rede pública" },
  tank: { en: "Tank", "pt-BR": "Reservatório elevado" },
  reservoir: { en: "Reservoir", "pt-BR": "Reservatório" },
  pond: { en: "Pond", "pt-BR": "Lago/açude" },
  well: { en: "Well", "pt-BR": "Poço" },
  other: { en: "Other", "pt-BR": "Outro" },
};

const labelFor = (
  dict: Record<string, { en: string; "pt-BR": string }>,
  value: string | undefined,
  language: "en" | "pt-BR",
  otherText?: string,
): string => {
  if (!value) return "";
  const label = dict[value]?.[language] ?? value;
  return value === "other" && otherText ? `${label}: ${sanitizeHtml(otherText)}` : label;
};

// Seção sem nenhum campo preenchido não renderiza — barra de título sozinha,
// sem conteúdo embaixo, parecia defeito.
const infoSection = (title: string, items: string, gridClass = "info-grid"): string => {
  if (!items.trim()) return "";
  return [
    `<div class="section">`,
    `<h2 class="section-title">${title}</h2>`,
    `<div class="${gridClass}">${items}</div>`,
    `</div>`,
  ].join("");
};

// Campo sem valor não renderiza. Um teste parcial — o normal em campo — saía
// com dezenas de "-" na página, escondendo o que de fato foi medido.
const infoItem = (label: string, value: string, span?: number): string => {
  const v = (value ?? "").trim();
  if (!v || v === "-") return "";
  const spanStyle = span ? ` style="grid-column: span ${span};"` : "";
  return [
    `<div class="info-item"${spanStyle}>`,
    `<div class="info-label">${label}</div>`,
    `<div class="info-value">${v}</div>`,
    `</div>`,
  ].join("");
};

const getCommonStyles = (): string => `
  ${getBaseCss()}

  .info-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5mm; }

  /* Leituras: é tabela de números — tudo centralizado e em coluna. */
  .readings-table, .results-table { width: 100%; border-collapse: collapse; margin-top: 2mm; }
  .readings-table th { text-align: center; }
  .readings-table td { text-align: center; }
  .results-table th { text-align: left; }

  /* Deficiência é desvio: fundo neutro, faixa vermelha marcando o que importa. */
  .deficiency-card {
    background: ${PDF_THEME.surface};
    border: .25mm solid ${PDF_THEME.line};
    border-left: .8mm solid ${PDF_THEME.danger};
    border-radius: 1.5mm;
    padding: 2.4mm 3mm;
    margin-bottom: 2.4mm;
    break-inside: avoid;
  }
  .deficiency-header { display: flex; justify-content: space-between; gap: 3mm; margin-bottom: 1.4mm; }

  /* Severidade por peso de traço, não por semáforo de cores. */
  .severity-badge {
    display: inline-block;
    padding: .6mm 2mm; border-radius: 1mm;
    font-size: 6pt; font-weight: 800;
    text-transform: uppercase; letter-spacing: .04em;
  }
  .severity-minor { border: .25mm solid ${PDF_THEME.line}; color: ${PDF_THEME.text}; }
  .severity-major { border: .3mm solid ${PDF_THEME.danger}; color: ${PDF_THEME.danger}; }
  .severity-critical { background: ${PDF_THEME.danger}; color: ${PDF_THEME.white}; }

  .signature-image { max-height: 15mm; margin-top: 2mm; }

  .overall-result-box {
    border: .6mm solid ${PDF_THEME.ink};
    border-radius: 1.5mm;
    padding: 3mm;
    text-align: center;
    margin-top: 3mm;
    break-inside: avoid;
  }
`;

interface GenerateElectricPdfOptions {
  test: Partial<PerformanceTest>;
  language: "en" | "pt-BR";
}

export const generateElectricPumpPdfHtml = (options: GenerateElectricPdfOptions): string => {
  const { test, language } = options;
  const t = translations[language];

  const contractorAddress = [
    test.contractorInfo?.address,
    test.contractorInfo?.city,
    test.contractorInfo?.state,
    test.contractorInfo?.zipCode,
  ].filter(Boolean).join(", ");

  const jobAddress = [
    test.jobInfo?.address,
    test.jobInfo?.city,
    test.jobInfo?.state,
  ].filter(Boolean).join(", ");

  const testReadingsHtml = (test.testConditions?.readings || []).map((reading: TestReading) => `
    <tr>
      <td>${sanitizeHtml(reading.flowPercent)}%</td>
      <td>${sanitizeHtml(reading.flowGpm) || "-"}</td>
      <td>${sanitizeHtml(reading.suctionPsi) || "-"}</td>
      <td>${sanitizeHtml(reading.dischargePsi) || "-"}</td>
      <td style="font-weight: bold;">${sanitizeHtml(reading.netPressurePsi) || "-"}</td>
      <td>${sanitizeHtml(reading.rpm) || "-"}</td>
      <td>${sanitizeHtml(reading.voltageL1L2) || "-"}</td>
      <td>${sanitizeHtml(reading.amperageL1) || "-"}</td>
    </tr>
  `).join("");

  const deficienciesHtml = (test.observationsDeficiencies?.deficiencies || []).map((d: Deficiency) => `
    <div class="deficiency-card">
      <div class="deficiency-header">
        <span class="severity-badge severity-${d.severity}">${t[d.severity as keyof typeof t] || d.severity}</span>
        ${d.resolved ? `<span style="color: #22863A; font-weight: bold;">${t.resolved}: ${t.yes}</span>` : ""}
      </div>
      <p style="margin-bottom: 6px;"><strong>${sanitizeHtml(d.description)}</strong></p>
      ${d.recommendedAction ? `<p style="font-size: 10px; color: #4B5563;">${t.action}: ${sanitizeHtml(d.recommendedAction)}</p>` : ""}
      ${d.targetCompletionDate ? `<p style="font-size: 10px; color: #4B5563;">${t.targetDate}: ${formatDate(d.targetCompletionDate, language)}</p>` : ""}
    </div>
  `).join("");

  const signatureHtml = test.signatures?.conductedBy?.signatureData
    ? `<img src="${test.signatures.conductedBy.signatureData}" class="signature-image" />`
    : `<div style="border-bottom: 1px solid #1F2937; width: 200px; height: 40px; margin-top: 10px;"></div>`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getCommonStyles()}</style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="logo-section">
            <div class="logo-icon">F</div>
            <div>
              <div class="company-name">FireSafe ITM</div>
              <div class="report-title">${t.electricPump} - ${t.title}</div>
            </div>
          </div>
          <div class="compliance-badge">${t.nfpaCompliance}</div>
        </div>

        ${infoSection(`${t.contractorInfo}`, `${infoItem(`${t.companyName}`, `${sanitizeHtml(test.contractorInfo?.companyName) || "-"}`)}
            ${infoItem(`${t.license}`, `${sanitizeHtml(test.contractorInfo?.licenseNumber) || "-"}`)}
            ${infoItem(`${t.address}`, `${sanitizeHtml(contractorAddress) || "-"}`, 2)}
            ${infoItem(`${t.phone}`, `${sanitizeHtml(test.contractorInfo?.phone) || "-"}`)}
            ${infoItem(`${t.email}`, `${sanitizeHtml(test.contractorInfo?.email) || "-"}`)}`)}

        ${infoSection(`${t.jobInfo}`, `${infoItem(`${t.jobName}`, `${sanitizeHtml(test.jobInfo?.jobName) || "-"}`)}
            ${infoItem(`${t.jobNumber}`, `${sanitizeHtml(test.jobInfo?.jobNumber) || "-"}`)}
            ${infoItem(`${t.address}`, `${sanitizeHtml(jobAddress) || "-"}`, 2)}
            ${infoItem(`${t.testDate}`, `${formatDate(test.jobInfo?.testDate || "", language)}`)}
            ${infoItem(`${t.testMethod}`, `${labelFor(TEST_METHOD_LABELS, test.jobInfo?.testMethod, language, test.jobInfo?.testMethodOther)}`)}
            ${infoItem(`${t.weather}`, `${sanitizeHtml(test.jobInfo?.weatherConditions) || "-"}`)}
            ${infoItem(`${t.ambientTemp}`, `${test.jobInfo?.ambientTemperatureF ? `${sanitizeHtml(test.jobInfo.ambientTemperatureF)} °F` : "-"}`)}`)}

        ${infoSection(`${t.pumpEquipment}`, `${infoItem(`${t.pumpTag}`, `${sanitizeHtml(test.pumpEquipment?.pumpTag) || "-"}`)}
            ${infoItem(`${t.manufacturer}`, `${sanitizeHtml(test.pumpEquipment?.manufacturer) || "-"}`)}
            ${infoItem(`${t.model}`, `${sanitizeHtml(test.pumpEquipment?.model) || "-"}`)}
            ${infoItem(`${t.serialNumber}`, `${sanitizeHtml(test.pumpEquipment?.serialNumber) || "-"}`)}
            ${infoItem(`${t.ratedFlow}`, `${test.pumpEquipment?.ratedFlowGpm ? `${sanitizeHtml(test.pumpEquipment.ratedFlowGpm)} GPM` : "-"}`)}
            ${infoItem(`${t.ratedPressure}`, `${test.pumpEquipment?.ratedPressurePsi ? `${sanitizeHtml(test.pumpEquipment.ratedPressurePsi)} PSI` : "-"}`)}
            ${infoItem(`${t.ratedSpeed}`, `${test.pumpEquipment?.ratedSpeedRpm ? `${sanitizeHtml(test.pumpEquipment.ratedSpeedRpm)} RPM` : "-"}`)}
            ${infoItem(`${t.shutoffPressure}`, `${test.pumpEquipment?.shutoffPressurePsi ? `${sanitizeHtml(test.pumpEquipment.shutoffPressurePsi)} PSI` : "-"}`)}
            ${infoItem(`${t.peakFlow}`, `${test.pumpEquipment?.peakFlowGpm ? `${sanitizeHtml(test.pumpEquipment.peakFlowGpm)} GPM` : "-"}`)}`, "info-grid-3")}

        ${infoSection(`${t.driverInfo}`, `${infoItem(`${t.driverType}`, `${t.electricPump}`)}
            ${infoItem(`${t.manufacturer}`, `${sanitizeHtml((test.driverInfo as any)?.manufacturer) || "-"}`)}
            ${infoItem(`${t.model}`, `${sanitizeHtml((test.driverInfo as any)?.model) || "-"}`)}
            ${infoItem(`${t.horsePower}`, `${(test.driverInfo as any)?.horsePower ? `${sanitizeHtml((test.driverInfo as any).horsePower)} HP` : "-"}`)}
            ${infoItem(`${t.ratedVoltage}`, `${(test.driverInfo as any)?.ratedVoltage ? `${sanitizeHtml((test.driverInfo as any).ratedVoltage)} V` : "-"}`)}
            ${infoItem(`${t.fullLoadAmp}`, `${(test.driverInfo as any)?.fullLoadAmperage ? `${sanitizeHtml((test.driverInfo as any).fullLoadAmperage)} A` : "-"}`)}`, "info-grid-3")}

        ${infoSection(`${t.controllerInfo}`, `${infoItem(`${t.panelTag}`, `${sanitizeHtml(test.controllerInfo?.panelTag) || "-"}`)}
            ${infoItem(`${t.manufacturer}`, `${sanitizeHtml(test.controllerInfo?.manufacturer) || "-"}`)}
            ${infoItem(`${t.model}`, `${sanitizeHtml(test.controllerInfo?.model) || "-"}`)}
            ${infoItem(`${t.startingType}`, `${sanitizeHtml(test.controllerInfo?.startingType) || "-"}`)}
            ${infoItem(`${t.supplyVoltage}`, `${sanitizeHtml(test.controllerInfo?.supplyVoltage) || "-"}`)}
            ${infoItem(`${t.autoTransfer}`, `${test.controllerInfo?.hasAutomaticTransfer ? t.yes : t.no}`)}`, "info-grid-3")}

        ${infoSection(`${t.supplyConditions}`, `${infoItem(`${t.supplySource}`, `${labelFor(SUPPLY_SOURCE_LABELS, test.supplyConditions?.supplySource, language, test.supplyConditions?.supplySourceOther)}`)}
            ${infoItem(`${t.staticPressure}`, `${test.supplyConditions?.staticPressurePsi ? `${sanitizeHtml(test.supplyConditions.staticPressurePsi)} PSI` : "-"}`)}
            ${infoItem(`${t.residualPressure}`, `${test.supplyConditions?.residualPressurePsi ? `${sanitizeHtml(test.supplyConditions.residualPressurePsi)} PSI` : "-"}`)}
            ${infoItem(`${t.waterTemp}`, `${test.supplyConditions?.waterTemperatureF ? `${sanitizeHtml(test.supplyConditions.waterTemperatureF)} °F` : "-"}`)}`)}

        ${infoSection(`${t.systemDemand}`, `${infoItem(`${t.demandGpm}`, `${test.systemDemand?.systemDemandGpm ? `${sanitizeHtml(test.systemDemand.systemDemandGpm)} GPM` : "-"}`)}
            ${infoItem(`${t.demandPsi}`, `${test.systemDemand?.systemDemandPsi ? `${sanitizeHtml(test.systemDemand.systemDemandPsi)} PSI` : "-"}`)}
            ${infoItem(`${t.totalDemand}`, `${test.systemDemand?.totalDemandGpm ? `${sanitizeHtml(test.systemDemand.totalDemandGpm)} GPM @ ${sanitizeHtml(test.systemDemand?.totalDemandPsi || "")} PSI` : "-"}`)}`)}

        <div class="section">
          <h2 class="section-title">${t.testReadings}</h2>
          <table class="readings-table">
            <thead>
              <tr>
                <th>${t.flowPercent}</th>
                <th>${t.flowGpm}</th>
                <th>${t.suctionPsi}</th>
                <th>${t.dischargePsi}</th>
                <th>${t.netPsi}</th>
                <th>${t.rpm}</th>
                <th>${t.voltage}</th>
                <th>${t.amperage}</th>
              </tr>
            </thead>
            <tbody>
              ${testReadingsHtml}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">${t.resultsSummary}</h2>
          <table class="results-table">
            <thead>
              <tr>
                <th>Test</th>
                <th>${t.actual}</th>
                <th>${t.rated}/${t.minimum}</th>
                <th>${t.percent}</th>
                <th>${t.result}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${t.shutoffTest}</strong></td>
                <td>${sanitizeHtml(test.resultsSummary?.shutoffPressureActual) || "-"} PSI</td>
                <td>${sanitizeHtml(test.resultsSummary?.shutoffPressureRated) || "-"} PSI</td>
                <td>${sanitizeHtml(test.resultsSummary?.shutoffPressurePercent) || "-"}%</td>
                <td>${getResultSymbol(test.resultsSummary?.shutoffPressurePass || false, t)}</td>
              </tr>
              <tr>
                <td><strong>${t.ratedFlowTest}</strong></td>
                <td>${sanitizeHtml(test.resultsSummary?.ratedFlowPressureActual) || "-"} PSI</td>
                <td>${sanitizeHtml(test.resultsSummary?.ratedFlowPressureRated) || "-"} PSI</td>
                <td>${sanitizeHtml(test.resultsSummary?.ratedFlowPressurePercent) || "-"}%</td>
                <td>${getResultSymbol(test.resultsSummary?.ratedFlowPass || false, t)}</td>
              </tr>
              <tr>
                <td><strong>${t.peakFlowTest}</strong></td>
                <td>${sanitizeHtml(test.resultsSummary?.peakFlowPressureActual) || "-"} PSI</td>
                <td>${sanitizeHtml(test.resultsSummary?.peakFlowPressureMin) || "-"} PSI</td>
                <td>${sanitizeHtml(test.resultsSummary?.peakFlowPressurePercent) || "-"}%</td>
                <td>${getResultSymbol(test.resultsSummary?.peakFlowPass || false, t)}</td>
              </tr>
            </tbody>
          </table>
          <div class="overall-result-box">
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">${t.overallResult}</div>
            ${getOverallResultBadge(test.resultsSummary?.overallResult || "fail", t)}
          </div>
        </div>

        ${test.observationsDeficiencies?.generalObservations || deficienciesHtml ? `
        <div class="section">
          <h2 class="section-title">${t.observations}</h2>
          ${test.observationsDeficiencies?.generalObservations ? `
            <div style="margin-bottom: 15px;">
              <div style="font-weight: 600; margin-bottom: 6px;">${t.generalObservations}</div>
              <p style="background: #F9FAFB; padding: 10px; border-radius: 4px; font-size: 10px;">${sanitizeHtml(test.observationsDeficiencies.generalObservations)}</p>
            </div>
          ` : ""}
          ${deficienciesHtml ? `
            <div style="font-weight: 600; margin-bottom: 6px;">${t.deficiencies}</div>
            ${deficienciesHtml}
          ` : ""}
          ${test.observationsDeficiencies?.recommendedMaintenanceActions ? `
            <div style="margin-top: 15px;">
              <div style="font-weight: 600; margin-bottom: 6px;">${t.recommendations}</div>
              <p style="background: #F9FAFB; padding: 10px; border-radius: 4px; font-size: 10px;">${sanitizeHtml(test.observationsDeficiencies.recommendedMaintenanceActions)}</p>
            </div>
          ` : ""}
          ${test.observationsDeficiencies?.nextTestDueDate ? `
            <div style="margin-top: 10px;">
              <span style="font-weight: 600;">${t.nextTestDate}:</span> ${formatDate(test.observationsDeficiencies.nextTestDueDate, language)}
            </div>
          ` : ""}
        </div>
        ` : ""}

        <div class="section">
          <h2 class="section-title">${t.signatures}</h2>
          <div class="signature-box">
            <div style="font-weight: 600; margin-bottom: 10px;">${t.conductedBy}</div>
            <div class="info-grid">
              ${infoItem(`${t.name}`, `${sanitizeHtml(test.signatures?.conductedBy?.name) || "-"}`)}
              ${infoItem(`${t.title_label}`, `${sanitizeHtml(test.signatures?.conductedBy?.title) || "-"}`)}
              ${infoItem(`${t.company}`, `${sanitizeHtml(test.signatures?.conductedBy?.company) || "-"}`)}
              ${infoItem(`${t.date}`, `${formatDate(test.signatures?.conductedBy?.date || "", language)}`)}
            </div>
            <div style="margin-top: 15px;">
              <div style="font-size: 10px; color: #6B7280; margin-bottom: 5px;">${t.signature}</div>
              ${signatureHtml}
            </div>
          </div>
        </div>

        <div class="footer">
          <p>${t.generatedOn} ${formatDate(new Date().toISOString(), language)}</p>
          <span>${language === "pt-BR" ? "FireSafe ITM — Inspeção, Teste e Manutenção de Sistemas de Proteção contra Incêndio" : "FireSafe ITM — Inspection, Testing & Maintenance of Fire Protection Systems"}</span>
        </div>
      </div>
    </body>
    </html>
  `;
};

interface GenerateDieselPdfOptions {
  test: Partial<DieselPerformanceTest>;
  language: "en" | "pt-BR";
}

export const generateDieselPumpPdfHtml = (options: GenerateDieselPdfOptions): string => {
  const { test, language } = options;
  const t = translations[language];

  const contractorAddress = [
    test.contractorInfo?.address,
    test.contractorInfo?.city,
    test.contractorInfo?.state,
    test.contractorInfo?.zipCode,
  ].filter(Boolean).join(", ");

  const jobAddress = [
    test.jobInfo?.address,
    test.jobInfo?.city,
    test.jobInfo?.state,
  ].filter(Boolean).join(", ");

  const testReadingsHtml = (test.dieselReadings || []).map((reading: DieselTestReading) => `
    <tr>
      <td>${sanitizeHtml(reading.flowPercent)}%</td>
      <td>${sanitizeHtml(reading.flowGpm) || "-"}</td>
      <td>${sanitizeHtml(reading.suctionPsi) || "-"}</td>
      <td>${sanitizeHtml(reading.dischargePsi) || "-"}</td>
      <td style="font-weight: bold;">${sanitizeHtml(reading.netPressurePsi) || "-"}</td>
    </tr>
  `).join("");

  const deficienciesHtml = (test.observationsDeficiencies?.deficiencies || []).map((d: Deficiency) => `
    <div class="deficiency-card">
      <div class="deficiency-header">
        <span class="severity-badge severity-${d.severity}">${t[d.severity as keyof typeof t] || d.severity}</span>
        ${d.resolved ? `<span style="color: #22863A; font-weight: bold;">${t.resolved}: ${t.yes}</span>` : ""}
      </div>
      <p style="margin-bottom: 6px;"><strong>${sanitizeHtml(d.description)}</strong></p>
      ${d.recommendedAction ? `<p style="font-size: 10px; color: #4B5563;">${t.action}: ${sanitizeHtml(d.recommendedAction)}</p>` : ""}
      ${d.targetCompletionDate ? `<p style="font-size: 10px; color: #4B5563;">${t.targetDate}: ${formatDate(d.targetCompletionDate, language)}</p>` : ""}
    </div>
  `).join("");

  const signatureHtml = test.signatures?.conductedBy?.signatureData
    ? `<img src="${test.signatures.conductedBy.signatureData}" class="signature-image" />`
    : `<div style="border-bottom: 1px solid #1F2937; width: 200px; height: 40px; margin-top: 10px;"></div>`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getCommonStyles()}</style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="logo-section">
            <div class="logo-icon">F</div>
            <div>
              <div class="company-name">FireSafe ITM</div>
              <div class="report-title">${t.dieselPump} - ${t.title}</div>
            </div>
          </div>
          <div class="compliance-badge">${t.nfpaCompliance}</div>
        </div>

        ${infoSection(`${t.contractorInfo}`, `${infoItem(`${t.companyName}`, `${sanitizeHtml(test.contractorInfo?.companyName) || "-"}`)}
            ${infoItem(`${t.license}`, `${sanitizeHtml(test.contractorInfo?.licenseNumber) || "-"}`)}
            ${infoItem(`${t.address}`, `${sanitizeHtml(contractorAddress) || "-"}`, 2)}
            ${infoItem(`${t.phone}`, `${sanitizeHtml(test.contractorInfo?.phone) || "-"}`)}
            ${infoItem(`${t.email}`, `${sanitizeHtml(test.contractorInfo?.email) || "-"}`)}`)}

        ${infoSection(`${t.jobInfo}`, `${infoItem(`${t.jobName}`, `${sanitizeHtml(test.jobInfo?.jobName) || "-"}`)}
            ${infoItem(`${t.jobNumber}`, `${sanitizeHtml(test.jobInfo?.jobNumber) || "-"}`)}
            ${infoItem(`${t.address}`, `${sanitizeHtml(jobAddress) || "-"}`, 2)}
            ${infoItem(`${t.testDate}`, `${formatDate(test.jobInfo?.testDate || "", language)}`)}
            ${infoItem(`${t.testMethod}`, `${labelFor(TEST_METHOD_LABELS, test.jobInfo?.testMethod, language, test.jobInfo?.testMethodOther)}`)}`)}

        ${infoSection(`${t.pumpEquipment}`, `${infoItem(`${t.pumpTag}`, `${sanitizeHtml(test.pumpEquipment?.pumpTag) || "-"}`)}
            ${infoItem(`${t.manufacturer}`, `${sanitizeHtml(test.pumpEquipment?.manufacturer) || "-"}`)}
            ${infoItem(`${t.model}`, `${sanitizeHtml(test.pumpEquipment?.model) || "-"}`)}
            ${infoItem(`${t.serialNumber}`, `${sanitizeHtml(test.pumpEquipment?.serialNumber) || "-"}`)}
            ${infoItem(`${t.ratedFlow}`, `${test.pumpEquipment?.ratedFlowGpm ? `${sanitizeHtml(test.pumpEquipment.ratedFlowGpm)} GPM` : "-"}`)}
            ${infoItem(`${t.ratedPressure}`, `${test.pumpEquipment?.ratedPressurePsi ? `${sanitizeHtml(test.pumpEquipment.ratedPressurePsi)} PSI` : "-"}`)}
            ${infoItem(`${t.ratedSpeed}`, `${test.pumpEquipment?.ratedSpeedRpm ? `${sanitizeHtml(test.pumpEquipment.ratedSpeedRpm)} RPM` : "-"}`)}
            ${infoItem(`${t.shutoffPressure}`, `${test.pumpEquipment?.shutoffPressurePsi ? `${sanitizeHtml(test.pumpEquipment.shutoffPressurePsi)} PSI` : "-"}`)}
            ${infoItem(`${t.peakFlow}`, `${test.pumpEquipment?.peakFlowGpm ? `${sanitizeHtml(test.pumpEquipment.peakFlowGpm)} GPM` : "-"}`)}
            ${infoItem(`${t.stages}`, `${sanitizeHtml(test.pumpEquipment?.numberOfStages) || "-"}`)}
            ${infoItem(`${t.impellerDiameter}`, `${test.pumpEquipment?.impellerDiameterIn ? `${sanitizeHtml(test.pumpEquipment.impellerDiameterIn)} in` : "-"}`)}
            ${infoItem(`${t.yearInstalled}`, `${sanitizeHtml(test.pumpEquipment?.yearInstalled) || "-"}`)}`, "info-grid-3")}

        ${infoSection(`${t.dieselInfo}`, `${infoItem(`${t.manufacturer}`, `${sanitizeHtml(test.driverInfo?.manufacturer) || "-"}`)}
            ${infoItem(`${t.model}`, `${sanitizeHtml(test.driverInfo?.model) || "-"}`)}
            ${infoItem(`${t.serialNumber}`, `${sanitizeHtml(test.driverInfo?.serialNumber) || "-"}`)}
            ${infoItem(`${t.horsePower}`, `${test.driverInfo?.horsePower ? `${sanitizeHtml(test.driverInfo.horsePower)} HP` : "-"}`)}
            ${infoItem(`${t.ratedRpm}`, `${test.driverInfo?.ratedRpm ? `${sanitizeHtml(test.driverInfo.ratedRpm)} RPM` : "-"}`)}
            ${infoItem(`${t.cylinders}`, `${sanitizeHtml(test.driverInfo?.numberOfCylinders) || "-"}`)}
            ${infoItem(`${t.displacement}`, `${sanitizeHtml(test.driverInfo?.displacement) || "-"}`)}
            ${infoItem(`${t.fuelTankCapacity}`, `${test.driverInfo?.fuelTankCapacityGal ? `${sanitizeHtml(test.driverInfo.fuelTankCapacityGal)} gal` : "-"}`)}
            ${infoItem(`${t.fuelLevel}`, `${sanitizeHtml(test.driverInfo?.fuelLevel) || "-"}`)}
            ${infoItem(`${t.oilLevel}`, `${sanitizeHtml(test.driverInfo?.oilLevel) || "-"}`)}
            ${infoItem(`${t.coolantLevel}`, `${sanitizeHtml(test.driverInfo?.coolantLevel) || "-"}`)}
            ${infoItem(`${t.batteryVoltage} 1`, `${test.driverInfo?.batteryVoltage1 ? `${sanitizeHtml(test.driverInfo.batteryVoltage1)} V` : "-"}`)}
            ${infoItem(`${t.batteryVoltage} 2`, `${test.driverInfo?.batteryVoltage2 ? `${sanitizeHtml(test.driverInfo.batteryVoltage2)} V` : "-"}`)}
            ${infoItem(`${t.engineBlockHeater}`, `${sanitizeHtml(test.driverInfo?.engineBlockHeaterStatus) || "-"}`)}`, "info-grid-3")}

        ${infoSection(`${t.batteryInfo}`, `${infoItem(`${t.startingBatteries}`, `${sanitizeHtml(test.batteryInfo?.startingBatteriesType) || "-"}`)}
            ${infoItem(`${t.chargerType}`, `${sanitizeHtml(test.batteryInfo?.chargerType) || "-"}`)}
            ${infoItem(`${t.chargerVoltage}`, `${test.batteryInfo?.chargerVoltage ? `${sanitizeHtml(test.batteryInfo.chargerVoltage)} V` : "-"}`)}
            ${infoItem(`${t.alternateSource}`, `${sanitizeHtml(test.batteryInfo?.alternatePowerSource) || "-"}`)}`)}

        ${infoSection(`${t.controllerInfo}`, `${infoItem(`${t.panelTag}`, `${sanitizeHtml(test.controllerInfo?.panelTag) || "-"}`)}
            ${infoItem(`${t.manufacturer}`, `${sanitizeHtml(test.controllerInfo?.manufacturer) || "-"}`)}
            ${infoItem(`${t.model}`, `${sanitizeHtml(test.controllerInfo?.model) || "-"}`)}
            ${infoItem(`${t.serialNumber}`, `${sanitizeHtml(test.controllerInfo?.serialNumber) || "-"}`)}
            ${infoItem(`${t.supplyVoltage}`, `${sanitizeHtml(test.controllerInfo?.supplyVoltage) || "-"}`)}
            ${infoItem(`${t.startingType}`, `${sanitizeHtml(test.controllerInfo?.startingType) || "-"}`)}
            ${infoItem(`${t.autoTransfer}`, `${test.controllerInfo?.hasAutomaticTransfer ? t.yes : t.no}`)}
            ${infoItem(`${t.pressureStart}`, `${test.controllerInfo?.pressureSettingStart ? `${sanitizeHtml(test.controllerInfo.pressureSettingStart)} PSI` : "-"}`)}
            ${infoItem(`${t.pressureStop}`, `${test.controllerInfo?.pressureSettingStop ? `${sanitizeHtml(test.controllerInfo.pressureSettingStop)} PSI` : "-"}`)}`)}

        ${infoSection(`${t.supplyConditions}`, `${infoItem(`${t.supplySource}`, `${labelFor(SUPPLY_SOURCE_LABELS, test.supplyConditions?.supplySource, language, test.supplyConditions?.supplySourceOther)}`)}
            ${infoItem(`${t.staticPressure}`, `${test.supplyConditions?.staticPressurePsi ? `${sanitizeHtml(test.supplyConditions.staticPressurePsi)} PSI` : "-"}`)}
            ${infoItem(`${t.residualPressure}`, `${test.supplyConditions?.residualPressurePsi ? `${sanitizeHtml(test.supplyConditions.residualPressurePsi)} PSI` : "-"}`)}
            ${infoItem(`${t.waterTemp}`, `${test.supplyConditions?.waterTemperatureF ? `${sanitizeHtml(test.supplyConditions.waterTemperatureF)} °F` : "-"}`)}`)}

        ${infoSection(`${t.systemDemand}`, `${infoItem(`${t.demandGpm}`, `${test.systemDemand?.systemDemandGpm ? `${sanitizeHtml(test.systemDemand.systemDemandGpm)} GPM` : "-"}`)}
            ${infoItem(`${t.demandPsi}`, `${test.systemDemand?.systemDemandPsi ? `${sanitizeHtml(test.systemDemand.systemDemandPsi)} PSI` : "-"}`)}
            ${infoItem(`${t.hoseDemand}`, `${test.systemDemand?.hoseDemandGpm ? `${sanitizeHtml(test.systemDemand.hoseDemandGpm)} GPM` : "-"}`)}
            ${infoItem(`${t.totalDemand}`, `${test.systemDemand?.totalDemandGpm ? `${sanitizeHtml(test.systemDemand.totalDemandGpm)} GPM` : "-"}`)}`)}

        <div class="section">
          <h2 class="section-title">${t.multiplePumpOperation}</h2>
          <div class="info-grid">
            ${infoItem(`${t.isMultiplePumpSystem}`, `${test.multiplePumpOperation?.isMultiplePumpSystem ? t.yes : t.no}`)}
            ${test.multiplePumpOperation?.isMultiplePumpSystem ? `
            ${infoItem(`${t.numberOfPumps}`, `${sanitizeHtml(test.multiplePumpOperation?.numberOfPumps) || "-"}`)}
            ${infoItem(`${t.operationSequence}`, `${sanitizeHtml(test.multiplePumpOperation?.pumpOperationSequence) || "-"}`)}
            ${infoItem(`${t.allPumpsTested}`, `${test.multiplePumpOperation?.allPumpsTestedIndividually ? t.yes : t.no}`)}
            ${infoItem(`${t.combinedFlowTest}`, `${test.multiplePumpOperation?.combinedFlowTest ? t.yes : t.no}`)}
            ` : ""}
            ${test.multiplePumpOperation?.notes ? `
            ${infoItem(`${t.notes}`, `${sanitizeHtml(test.multiplePumpOperation.notes)}`, 2)}
            ` : ""}
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.transferSwitchTest}</h2>
          <div class="info-grid">
            ${infoItem(`${t.hasTransferSwitch}`, `${test.transferSwitchTest?.hasTransferSwitch ? t.yes : t.no}`)}
            ${test.transferSwitchTest?.hasTransferSwitch ? `
            ${infoItem(`${t.startingType}`, `${sanitizeHtml(test.transferSwitchTest?.transferSwitchType) || "-"}`)}
            ${infoItem(`${t.normalToEmergency}`, `${test.transferSwitchTest?.normalToEmergencySeconds ? `${sanitizeHtml(test.transferSwitchTest.normalToEmergencySeconds)} sec` : "-"}`)}
            ${infoItem(`${t.emergencyToNormal}`, `${test.transferSwitchTest?.emergencyToNormalSeconds ? `${sanitizeHtml(test.transferSwitchTest.emergencyToNormalSeconds)} sec` : "-"}`)}
            ${infoItem(`${t.testDate}`, `${test.transferSwitchTest?.testDate ? formatDate(test.transferSwitchTest.testDate, language) : "-"}`)}
            ${infoItem(`${t.testResult}`, `${test.transferSwitchTest?.testResult === "pass" ? t.pass : test.transferSwitchTest?.testResult === "fail" ? t.fail : "-"}`)}
            ` : ""}
            ${test.transferSwitchTest?.notes ? `
            ${infoItem(`${t.notes}`, `${sanitizeHtml(test.transferSwitchTest.notes)}`, 2)}
            ` : ""}
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.testReadings}</h2>
          <table class="readings-table">
            <thead>
              <tr>
                <th>${t.flowPercent}</th>
                <th>${t.flowGpm}</th>
                <th>${t.suctionPsi}</th>
                <th>${t.dischargePsi}</th>
                <th>${t.netPsi}</th>
              </tr>
            </thead>
            <tbody>
              ${testReadingsHtml}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">${t.resultsSummary}</h2>
          <table class="results-table">
            <thead>
              <tr>
                <th>Test</th>
                <th>${t.actual}</th>
                <th>${t.rated}/${t.minimum}</th>
                <th>${t.percent}</th>
                <th>${t.result}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${t.shutoffTest}</strong></td>
                <td>${sanitizeHtml(test.resultsSummary?.shutoffPressureActual) || "-"} PSI</td>
                <td>${sanitizeHtml(test.resultsSummary?.shutoffPressureRated) || "-"} PSI</td>
                <td>${sanitizeHtml(test.resultsSummary?.shutoffPressurePercent) || "-"}%</td>
                <td>${getResultSymbol(test.resultsSummary?.shutoffPressurePass || false, t)}</td>
              </tr>
              <tr>
                <td><strong>${t.ratedFlowTest}</strong></td>
                <td>${sanitizeHtml(test.resultsSummary?.ratedFlowPressureActual) || "-"} PSI</td>
                <td>${sanitizeHtml(test.resultsSummary?.ratedFlowPressureRated) || "-"} PSI</td>
                <td>${sanitizeHtml(test.resultsSummary?.ratedFlowPressurePercent) || "-"}%</td>
                <td>${getResultSymbol(test.resultsSummary?.ratedFlowPass || false, t)}</td>
              </tr>
              <tr>
                <td><strong>${t.peakFlowTest}</strong></td>
                <td>${sanitizeHtml(test.resultsSummary?.peakFlowPressureActual) || "-"} PSI</td>
                <td>${sanitizeHtml(test.resultsSummary?.peakFlowPressureMin) || "-"} PSI</td>
                <td>${sanitizeHtml(test.resultsSummary?.peakFlowPressurePercent) || "-"}%</td>
                <td>${getResultSymbol(test.resultsSummary?.peakFlowPass || false, t)}</td>
              </tr>
            </tbody>
          </table>
          <div class="overall-result-box">
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">${t.overallResult}</div>
            ${getOverallResultBadge(test.resultsSummary?.overallResult || "fail", t)}
          </div>
        </div>

        ${test.observationsDeficiencies?.generalObservations || deficienciesHtml ? `
        <div class="section">
          <h2 class="section-title">${t.observations}</h2>
          ${test.observationsDeficiencies?.generalObservations ? `
            <div style="margin-bottom: 15px;">
              <div style="font-weight: 600; margin-bottom: 6px;">${t.generalObservations}</div>
              <p style="background: #F9FAFB; padding: 10px; border-radius: 4px; font-size: 10px;">${sanitizeHtml(test.observationsDeficiencies.generalObservations)}</p>
            </div>
          ` : ""}
          ${deficienciesHtml ? `
            <div style="font-weight: 600; margin-bottom: 6px;">${t.deficiencies}</div>
            ${deficienciesHtml}
          ` : ""}
        </div>
        ` : ""}

        <div class="section">
          <h2 class="section-title">${t.signatures}</h2>
          <div class="signature-box">
            <div style="font-weight: 600; margin-bottom: 10px;">${t.conductedBy}</div>
            <div class="info-grid">
              ${infoItem(`${t.name}`, `${sanitizeHtml(test.signatures?.conductedBy?.name) || "-"}`)}
              ${infoItem(`${t.title_label}`, `${sanitizeHtml(test.signatures?.conductedBy?.title) || "-"}`)}
              ${infoItem(`${t.company}`, `${sanitizeHtml(test.signatures?.conductedBy?.company) || "-"}`)}
              ${infoItem(`${t.date}`, `${formatDate(test.signatures?.conductedBy?.date || "", language)}`)}
            </div>
            <div style="margin-top: 15px;">
              <div style="font-size: 10px; color: #6B7280; margin-bottom: 5px;">${t.signature}</div>
              ${signatureHtml}
            </div>
          </div>
        </div>

        <div class="footer">
          <p>${t.generatedOn} ${formatDate(new Date().toISOString(), language)}</p>
          <span>${language === "pt-BR" ? "FireSafe ITM — Inspeção, Teste e Manutenção de Sistemas de Proteção contra Incêndio" : "FireSafe ITM — Inspection, Testing & Maintenance of Fire Protection Systems"}</span>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateElectricPumpPdf = async (
  test: Partial<PerformanceTest>,
  language: "en" | "pt-BR"
): Promise<{ success: boolean; message?: string }> => {
  try {
    const html = generateElectricPumpPdfHtml({ test, language });

    if (Platform.OS === "web") {
      try {
        const { uri } = await Print.printToFileAsync({ html });
        const link = document.createElement("a");
        link.href = uri;
        link.download = `electric-pump-test-${test.pumpEquipment?.pumpTag || "report"}-${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (webError) {
        console.error("Error downloading PDF on web:", webError);
        return {
          success: false,
          message: webError instanceof Error ? webError.message : "Failed to download PDF",
        };
      }
    } else {
      try {
        const { uri } = await Print.printToFileAsync({
          html,
          base64: false,
        });

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: "Electric Pump Performance Test Report",
            UTI: "com.adobe.pdf",
          });
        } else {
          return {
            success: false,
            message: "Sharing is not available on this device",
          };
        }
      } catch (shareError) {
        console.error("Error sharing PDF:", shareError);
        return {
          success: false,
          message: shareError instanceof Error ? shareError.message : "Failed to share PDF",
        };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error generating electric pump PDF:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const generateDieselPumpPdf = async (
  test: Partial<DieselPerformanceTest>,
  language: "en" | "pt-BR"
): Promise<{ success: boolean; message?: string }> => {
  try {
    const html = generateDieselPumpPdfHtml({ test, language });

    if (Platform.OS === "web") {
      try {
        const { uri } = await Print.printToFileAsync({ html });
        const link = document.createElement("a");
        link.href = uri;
        link.download = `diesel-pump-test-${test.pumpEquipment?.pumpTag || "report"}-${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (webError) {
        console.error("Error downloading PDF on web:", webError);
        return {
          success: false,
          message: webError instanceof Error ? webError.message : "Failed to download PDF",
        };
      }
    } else {
      try {
        const { uri } = await Print.printToFileAsync({
          html,
          base64: false,
        });

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: "Diesel Pump Performance Test Report",
            UTI: "com.adobe.pdf",
          });
        } else {
          return {
            success: false,
            message: "Sharing is not available on this device",
          };
        }
      } catch (shareError) {
        console.error("Error sharing PDF:", shareError);
        return {
          success: false,
          message: shareError instanceof Error ? shareError.message : "Failed to share PDF",
        };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error generating diesel pump PDF:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
