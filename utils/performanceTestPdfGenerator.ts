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

const getCommonStyles = (): string => `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 11px;
    line-height: 1.4;
    color: #1F2937;
    background: white;
  }
  .page {
    padding: 30px;
    max-width: 800px;
    margin: 0 auto;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 3px solid #DC2626;
    padding-bottom: 15px;
    margin-bottom: 20px;
  }
  .logo-section {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    font-weight: bold;
  }
  .company-name {
    font-size: 20px;
    font-weight: bold;
    color: #1A365D;
  }
  .report-title {
    font-size: 12px;
    color: #6B7280;
    margin-top: 4px;
  }
  .compliance-badge {
    background: #22863A;
    color: white;
    padding: 6px 12px;
    border-radius: 15px;
    font-size: 10px;
    font-weight: 600;
  }
  .section {
    margin-bottom: 20px;
    page-break-inside: avoid;
  }
  .section-title {
    color: #1A365D;
    font-size: 14px;
    font-weight: 600;
    border-bottom: 2px solid #DC2626;
    padding-bottom: 6px;
    margin-bottom: 12px;
  }
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .info-grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
  }
  .info-item {
    padding: 8px;
    background: #F9FAFB;
    border-radius: 4px;
    border: 1px solid #E5E7EB;
  }
  .info-label {
    font-size: 9px;
    color: #6B7280;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .info-value {
    font-size: 11px;
    color: #1F2937;
    font-weight: 500;
  }
  .readings-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }
  .readings-table th {
    background: #1A365D;
    color: white;
    padding: 8px 6px;
    font-size: 10px;
    text-align: center;
    font-weight: 600;
  }
  .readings-table td {
    padding: 6px;
    border-bottom: 1px solid #E5E7EB;
    text-align: center;
    font-size: 10px;
  }
  .readings-table tr:nth-child(even) {
    background: #F9FAFB;
  }
  .results-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }
  .results-table th {
    background: #F3F4F6;
    padding: 8px;
    font-size: 10px;
    text-align: left;
    border-bottom: 2px solid #E5E7EB;
  }
  .results-table td {
    padding: 8px;
    border-bottom: 1px solid #E5E7EB;
    font-size: 10px;
  }
  .deficiency-card {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 10px;
  }
  .deficiency-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  .severity-badge {
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 9px;
    font-weight: 600;
  }
  .severity-minor { background: #FEF3C7; color: #92400E; }
  .severity-major { background: #FED7AA; color: #9A3412; }
  .severity-critical { background: #FECACA; color: #991B1B; }
  .signature-box {
    border: 1px solid #E5E7EB;
    border-radius: 6px;
    padding: 15px;
    margin-top: 10px;
  }
  .signature-image {
    max-height: 60px;
    margin-top: 10px;
  }
  .footer {
    margin-top: 30px;
    padding-top: 15px;
    border-top: 1px solid #E5E7EB;
    text-align: center;
    font-size: 9px;
    color: #6B7280;
  }
  .overall-result-box {
    background: #F9FAFB;
    border: 2px solid #E5E7EB;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    margin-top: 15px;
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

        <div class="section">
          <h2 class="section-title">${t.contractorInfo}</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">${t.companyName}</div>
              <div class="info-value">${sanitizeHtml(test.contractorInfo?.companyName) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.license}</div>
              <div class="info-value">${sanitizeHtml(test.contractorInfo?.licenseNumber) || "-"}</div>
            </div>
            <div class="info-item" style="grid-column: span 2;">
              <div class="info-label">${t.address}</div>
              <div class="info-value">${sanitizeHtml(contractorAddress) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.phone}</div>
              <div class="info-value">${sanitizeHtml(test.contractorInfo?.phone) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.email}</div>
              <div class="info-value">${sanitizeHtml(test.contractorInfo?.email) || "-"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.jobInfo}</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">${t.jobName}</div>
              <div class="info-value">${sanitizeHtml(test.jobInfo?.jobName) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.jobNumber}</div>
              <div class="info-value">${sanitizeHtml(test.jobInfo?.jobNumber) || "-"}</div>
            </div>
            <div class="info-item" style="grid-column: span 2;">
              <div class="info-label">${t.address}</div>
              <div class="info-value">${sanitizeHtml(jobAddress) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.testDate}</div>
              <div class="info-value">${formatDate(test.jobInfo?.testDate || "", language)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.testMethod}</div>
              <div class="info-value">${sanitizeHtml(test.jobInfo?.testMethod) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.weather}</div>
              <div class="info-value">${sanitizeHtml(test.jobInfo?.weatherConditions) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.ambientTemp}</div>
              <div class="info-value">${test.jobInfo?.ambientTemperatureF ? `${sanitizeHtml(test.jobInfo.ambientTemperatureF)} °F` : "-"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.pumpEquipment}</h2>
          <div class="info-grid-3">
            <div class="info-item">
              <div class="info-label">${t.pumpTag}</div>
              <div class="info-value">${sanitizeHtml(test.pumpEquipment?.pumpTag) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.manufacturer}</div>
              <div class="info-value">${sanitizeHtml(test.pumpEquipment?.manufacturer) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.model}</div>
              <div class="info-value">${sanitizeHtml(test.pumpEquipment?.model) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.serialNumber}</div>
              <div class="info-value">${sanitizeHtml(test.pumpEquipment?.serialNumber) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.ratedFlow}</div>
              <div class="info-value">${test.pumpEquipment?.ratedFlowGpm ? `${sanitizeHtml(test.pumpEquipment.ratedFlowGpm)} GPM` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.ratedPressure}</div>
              <div class="info-value">${test.pumpEquipment?.ratedPressurePsi ? `${sanitizeHtml(test.pumpEquipment.ratedPressurePsi)} PSI` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.ratedSpeed}</div>
              <div class="info-value">${test.pumpEquipment?.ratedSpeedRpm ? `${sanitizeHtml(test.pumpEquipment.ratedSpeedRpm)} RPM` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.shutoffPressure}</div>
              <div class="info-value">${test.pumpEquipment?.shutoffPressurePsi ? `${sanitizeHtml(test.pumpEquipment.shutoffPressurePsi)} PSI` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.peakFlow}</div>
              <div class="info-value">${test.pumpEquipment?.peakFlowGpm ? `${sanitizeHtml(test.pumpEquipment.peakFlowGpm)} GPM` : "-"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.driverInfo}</h2>
          <div class="info-grid-3">
            <div class="info-item">
              <div class="info-label">${t.driverType}</div>
              <div class="info-value">${t.electricPump}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.manufacturer}</div>
              <div class="info-value">${sanitizeHtml((test.driverInfo as any)?.manufacturer) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.model}</div>
              <div class="info-value">${sanitizeHtml((test.driverInfo as any)?.model) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.horsePower}</div>
              <div class="info-value">${(test.driverInfo as any)?.horsePower ? `${sanitizeHtml((test.driverInfo as any).horsePower)} HP` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.ratedVoltage}</div>
              <div class="info-value">${(test.driverInfo as any)?.ratedVoltage ? `${sanitizeHtml((test.driverInfo as any).ratedVoltage)} V` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.fullLoadAmp}</div>
              <div class="info-value">${(test.driverInfo as any)?.fullLoadAmperage ? `${sanitizeHtml((test.driverInfo as any).fullLoadAmperage)} A` : "-"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.controllerInfo}</h2>
          <div class="info-grid-3">
            <div class="info-item">
              <div class="info-label">${t.panelTag}</div>
              <div class="info-value">${sanitizeHtml(test.controllerInfo?.panelTag) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.manufacturer}</div>
              <div class="info-value">${sanitizeHtml(test.controllerInfo?.manufacturer) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.model}</div>
              <div class="info-value">${sanitizeHtml(test.controllerInfo?.model) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.startingType}</div>
              <div class="info-value">${sanitizeHtml(test.controllerInfo?.startingType) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.supplyVoltage}</div>
              <div class="info-value">${sanitizeHtml(test.controllerInfo?.supplyVoltage) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.autoTransfer}</div>
              <div class="info-value">${test.controllerInfo?.hasAutomaticTransfer ? t.yes : t.no}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.supplyConditions}</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">${t.supplySource}</div>
              <div class="info-value">${sanitizeHtml(test.supplyConditions?.supplySource) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.staticPressure}</div>
              <div class="info-value">${test.supplyConditions?.staticPressurePsi ? `${sanitizeHtml(test.supplyConditions.staticPressurePsi)} PSI` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.residualPressure}</div>
              <div class="info-value">${test.supplyConditions?.residualPressurePsi ? `${sanitizeHtml(test.supplyConditions.residualPressurePsi)} PSI` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.waterTemp}</div>
              <div class="info-value">${test.supplyConditions?.waterTemperatureF ? `${sanitizeHtml(test.supplyConditions.waterTemperatureF)} °F` : "-"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.systemDemand}</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">${t.demandGpm}</div>
              <div class="info-value">${test.systemDemand?.systemDemandGpm ? `${sanitizeHtml(test.systemDemand.systemDemandGpm)} GPM` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.demandPsi}</div>
              <div class="info-value">${test.systemDemand?.systemDemandPsi ? `${sanitizeHtml(test.systemDemand.systemDemandPsi)} PSI` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.totalDemand}</div>
              <div class="info-value">${test.systemDemand?.totalDemandGpm ? `${sanitizeHtml(test.systemDemand.totalDemandGpm)} GPM @ ${sanitizeHtml(test.systemDemand?.totalDemandPsi || "")} PSI` : "-"}</div>
            </div>
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
              <div class="info-item">
                <div class="info-label">${t.name}</div>
                <div class="info-value">${sanitizeHtml(test.signatures?.conductedBy?.name) || "-"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">${t.title_label}</div>
                <div class="info-value">${sanitizeHtml(test.signatures?.conductedBy?.title) || "-"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">${t.company}</div>
                <div class="info-value">${sanitizeHtml(test.signatures?.conductedBy?.company) || "-"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">${t.date}</div>
                <div class="info-value">${formatDate(test.signatures?.conductedBy?.date || "", language)}</div>
              </div>
            </div>
            <div style="margin-top: 15px;">
              <div style="font-size: 10px; color: #6B7280; margin-bottom: 5px;">${t.signature}</div>
              ${signatureHtml}
            </div>
          </div>
        </div>

        <div class="footer">
          <p>${t.generatedOn} ${formatDate(new Date().toISOString(), language)}</p>
          <p style="margin-top: 5px;">FireSafe ITM - Fire Protection Systems Inspection, Testing & Maintenance</p>
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

        <div class="section">
          <h2 class="section-title">${t.contractorInfo}</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">${t.companyName}</div>
              <div class="info-value">${sanitizeHtml(test.contractorInfo?.companyName) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.license}</div>
              <div class="info-value">${sanitizeHtml(test.contractorInfo?.licenseNumber) || "-"}</div>
            </div>
            <div class="info-item" style="grid-column: span 2;">
              <div class="info-label">${t.address}</div>
              <div class="info-value">${sanitizeHtml(contractorAddress) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.phone}</div>
              <div class="info-value">${sanitizeHtml(test.contractorInfo?.phone) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.email}</div>
              <div class="info-value">${sanitizeHtml(test.contractorInfo?.email) || "-"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.jobInfo}</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">${t.jobName}</div>
              <div class="info-value">${sanitizeHtml(test.jobInfo?.jobName) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.jobNumber}</div>
              <div class="info-value">${sanitizeHtml(test.jobInfo?.jobNumber) || "-"}</div>
            </div>
            <div class="info-item" style="grid-column: span 2;">
              <div class="info-label">${t.address}</div>
              <div class="info-value">${sanitizeHtml(jobAddress) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.testDate}</div>
              <div class="info-value">${formatDate(test.jobInfo?.testDate || "", language)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.testMethod}</div>
              <div class="info-value">${sanitizeHtml(test.jobInfo?.testMethod) || "-"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.pumpEquipment}</h2>
          <div class="info-grid-3">
            <div class="info-item">
              <div class="info-label">${t.pumpTag}</div>
              <div class="info-value">${sanitizeHtml(test.pumpEquipment?.pumpTag) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.manufacturer}</div>
              <div class="info-value">${sanitizeHtml(test.pumpEquipment?.manufacturer) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.model}</div>
              <div class="info-value">${sanitizeHtml(test.pumpEquipment?.model) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.serialNumber}</div>
              <div class="info-value">${sanitizeHtml(test.pumpEquipment?.serialNumber) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.ratedFlow}</div>
              <div class="info-value">${test.pumpEquipment?.ratedFlowGpm ? `${sanitizeHtml(test.pumpEquipment.ratedFlowGpm)} GPM` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.ratedPressure}</div>
              <div class="info-value">${test.pumpEquipment?.ratedPressurePsi ? `${sanitizeHtml(test.pumpEquipment.ratedPressurePsi)} PSI` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.ratedSpeed}</div>
              <div class="info-value">${test.pumpEquipment?.ratedSpeedRpm ? `${sanitizeHtml(test.pumpEquipment.ratedSpeedRpm)} RPM` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.shutoffPressure}</div>
              <div class="info-value">${test.pumpEquipment?.shutoffPressurePsi ? `${sanitizeHtml(test.pumpEquipment.shutoffPressurePsi)} PSI` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.peakFlow}</div>
              <div class="info-value">${test.pumpEquipment?.peakFlowGpm ? `${sanitizeHtml(test.pumpEquipment.peakFlowGpm)} GPM` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.stages}</div>
              <div class="info-value">${sanitizeHtml(test.pumpEquipment?.numberOfStages) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.impellerDiameter}</div>
              <div class="info-value">${test.pumpEquipment?.impellerDiameterIn ? `${sanitizeHtml(test.pumpEquipment.impellerDiameterIn)} in` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.yearInstalled}</div>
              <div class="info-value">${sanitizeHtml(test.pumpEquipment?.yearInstalled) || "-"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.dieselInfo}</h2>
          <div class="info-grid-3">
            <div class="info-item">
              <div class="info-label">${t.manufacturer}</div>
              <div class="info-value">${sanitizeHtml(test.driverInfo?.manufacturer) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.model}</div>
              <div class="info-value">${sanitizeHtml(test.driverInfo?.model) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.serialNumber}</div>
              <div class="info-value">${sanitizeHtml(test.driverInfo?.serialNumber) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.horsePower}</div>
              <div class="info-value">${test.driverInfo?.horsePower ? `${sanitizeHtml(test.driverInfo.horsePower)} HP` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.ratedRpm}</div>
              <div class="info-value">${test.driverInfo?.ratedRpm ? `${sanitizeHtml(test.driverInfo.ratedRpm)} RPM` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.cylinders}</div>
              <div class="info-value">${sanitizeHtml(test.driverInfo?.numberOfCylinders) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.displacement}</div>
              <div class="info-value">${sanitizeHtml(test.driverInfo?.displacement) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.fuelTankCapacity}</div>
              <div class="info-value">${test.driverInfo?.fuelTankCapacityGal ? `${sanitizeHtml(test.driverInfo.fuelTankCapacityGal)} gal` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.fuelLevel}</div>
              <div class="info-value">${sanitizeHtml(test.driverInfo?.fuelLevel) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.oilLevel}</div>
              <div class="info-value">${sanitizeHtml(test.driverInfo?.oilLevel) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.coolantLevel}</div>
              <div class="info-value">${sanitizeHtml(test.driverInfo?.coolantLevel) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.batteryVoltage} 1</div>
              <div class="info-value">${test.driverInfo?.batteryVoltage1 ? `${sanitizeHtml(test.driverInfo.batteryVoltage1)} V` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.batteryVoltage} 2</div>
              <div class="info-value">${test.driverInfo?.batteryVoltage2 ? `${sanitizeHtml(test.driverInfo.batteryVoltage2)} V` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.engineBlockHeater}</div>
              <div class="info-value">${sanitizeHtml(test.driverInfo?.engineBlockHeaterStatus) || "-"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.batteryInfo}</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">${t.startingBatteries}</div>
              <div class="info-value">${sanitizeHtml(test.batteryInfo?.startingBatteriesType) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.chargerType}</div>
              <div class="info-value">${sanitizeHtml(test.batteryInfo?.chargerType) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.chargerVoltage}</div>
              <div class="info-value">${test.batteryInfo?.chargerVoltage ? `${sanitizeHtml(test.batteryInfo.chargerVoltage)} V` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.alternateSource}</div>
              <div class="info-value">${sanitizeHtml(test.batteryInfo?.alternatePowerSource) || "-"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.controllerInfo}</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">${t.panelTag}</div>
              <div class="info-value">${sanitizeHtml(test.controllerInfo?.panelTag) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.manufacturer}</div>
              <div class="info-value">${sanitizeHtml(test.controllerInfo?.manufacturer) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.model}</div>
              <div class="info-value">${sanitizeHtml(test.controllerInfo?.model) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.serialNumber}</div>
              <div class="info-value">${sanitizeHtml(test.controllerInfo?.serialNumber) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.supplyVoltage}</div>
              <div class="info-value">${sanitizeHtml(test.controllerInfo?.supplyVoltage) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.startingType}</div>
              <div class="info-value">${sanitizeHtml(test.controllerInfo?.startingType) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.autoTransfer}</div>
              <div class="info-value">${test.controllerInfo?.hasAutomaticTransfer ? t.yes : t.no}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.pressureStart}</div>
              <div class="info-value">${test.controllerInfo?.pressureSettingStart ? `${sanitizeHtml(test.controllerInfo.pressureSettingStart)} PSI` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.pressureStop}</div>
              <div class="info-value">${test.controllerInfo?.pressureSettingStop ? `${sanitizeHtml(test.controllerInfo.pressureSettingStop)} PSI` : "-"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.supplyConditions}</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">${t.supplySource}</div>
              <div class="info-value">${sanitizeHtml(test.supplyConditions?.supplySource) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.staticPressure}</div>
              <div class="info-value">${test.supplyConditions?.staticPressurePsi ? `${sanitizeHtml(test.supplyConditions.staticPressurePsi)} PSI` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.residualPressure}</div>
              <div class="info-value">${test.supplyConditions?.residualPressurePsi ? `${sanitizeHtml(test.supplyConditions.residualPressurePsi)} PSI` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.waterTemp}</div>
              <div class="info-value">${test.supplyConditions?.waterTemperatureF ? `${sanitizeHtml(test.supplyConditions.waterTemperatureF)} °F` : "-"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.systemDemand}</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">${t.demandGpm}</div>
              <div class="info-value">${test.systemDemand?.systemDemandGpm ? `${sanitizeHtml(test.systemDemand.systemDemandGpm)} GPM` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.demandPsi}</div>
              <div class="info-value">${test.systemDemand?.systemDemandPsi ? `${sanitizeHtml(test.systemDemand.systemDemandPsi)} PSI` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.hoseDemand}</div>
              <div class="info-value">${test.systemDemand?.hoseDemandGpm ? `${sanitizeHtml(test.systemDemand.hoseDemandGpm)} GPM` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.totalDemand}</div>
              <div class="info-value">${test.systemDemand?.totalDemandGpm ? `${sanitizeHtml(test.systemDemand.totalDemandGpm)} GPM` : "-"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.multiplePumpOperation}</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">${t.isMultiplePumpSystem}</div>
              <div class="info-value">${test.multiplePumpOperation?.isMultiplePumpSystem ? t.yes : t.no}</div>
            </div>
            ${test.multiplePumpOperation?.isMultiplePumpSystem ? `
            <div class="info-item">
              <div class="info-label">${t.numberOfPumps}</div>
              <div class="info-value">${sanitizeHtml(test.multiplePumpOperation?.numberOfPumps) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.operationSequence}</div>
              <div class="info-value">${sanitizeHtml(test.multiplePumpOperation?.pumpOperationSequence) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.allPumpsTested}</div>
              <div class="info-value">${test.multiplePumpOperation?.allPumpsTestedIndividually ? t.yes : t.no}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.combinedFlowTest}</div>
              <div class="info-value">${test.multiplePumpOperation?.combinedFlowTest ? t.yes : t.no}</div>
            </div>
            ` : ""}
            ${test.multiplePumpOperation?.notes ? `
            <div class="info-item" style="grid-column: span 2;">
              <div class="info-label">${t.notes}</div>
              <div class="info-value">${sanitizeHtml(test.multiplePumpOperation.notes)}</div>
            </div>
            ` : ""}
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.transferSwitchTest}</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">${t.hasTransferSwitch}</div>
              <div class="info-value">${test.transferSwitchTest?.hasTransferSwitch ? t.yes : t.no}</div>
            </div>
            ${test.transferSwitchTest?.hasTransferSwitch ? `
            <div class="info-item">
              <div class="info-label">${t.startingType}</div>
              <div class="info-value">${sanitizeHtml(test.transferSwitchTest?.transferSwitchType) || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.normalToEmergency}</div>
              <div class="info-value">${test.transferSwitchTest?.normalToEmergencySeconds ? `${sanitizeHtml(test.transferSwitchTest.normalToEmergencySeconds)} sec` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.emergencyToNormal}</div>
              <div class="info-value">${test.transferSwitchTest?.emergencyToNormalSeconds ? `${sanitizeHtml(test.transferSwitchTest.emergencyToNormalSeconds)} sec` : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.testDate}</div>
              <div class="info-value">${test.transferSwitchTest?.testDate ? formatDate(test.transferSwitchTest.testDate, language) : "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t.testResult}</div>
              <div class="info-value">${test.transferSwitchTest?.testResult === "pass" ? t.pass : test.transferSwitchTest?.testResult === "fail" ? t.fail : "-"}</div>
            </div>
            ` : ""}
            ${test.transferSwitchTest?.notes ? `
            <div class="info-item" style="grid-column: span 2;">
              <div class="info-label">${t.notes}</div>
              <div class="info-value">${sanitizeHtml(test.transferSwitchTest.notes)}</div>
            </div>
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
              <div class="info-item">
                <div class="info-label">${t.name}</div>
                <div class="info-value">${sanitizeHtml(test.signatures?.conductedBy?.name) || "-"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">${t.title_label}</div>
                <div class="info-value">${sanitizeHtml(test.signatures?.conductedBy?.title) || "-"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">${t.company}</div>
                <div class="info-value">${sanitizeHtml(test.signatures?.conductedBy?.company) || "-"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">${t.date}</div>
                <div class="info-value">${formatDate(test.signatures?.conductedBy?.date || "", language)}</div>
              </div>
            </div>
            <div style="margin-top: 15px;">
              <div style="font-size: 10px; color: #6B7280; margin-bottom: 5px;">${t.signature}</div>
              ${signatureHtml}
            </div>
          </div>
        </div>

        <div class="footer">
          <p>${t.generatedOn} ${formatDate(new Date().toISOString(), language)}</p>
          <p style="margin-top: 5px;">FireSafe ITM - Fire Protection Systems Inspection, Testing & Maintenance</p>
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
