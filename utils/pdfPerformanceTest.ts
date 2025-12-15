import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import {
  PerformanceTest,
  TestReading,
  Deficiency,
  TestSignature,
  TestPhoto,
  DriverInfo,
  ElectricDriverInfo,
  DieselDriverInfo,
} from "@/types/performanceTest";

const sanitizeHtml = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const translations = {
  en: {
    reportTitle: "Fire Pump Performance Test Report",
    nfpaCompliance: "NFPA 25 Compliant",
    testNumber: "Test Number",
    testDate: "Test Date",
    status: "Status",
    statusLabels: {
      draft: "Draft",
      in_progress: "In Progress",
      completed: "Completed",
    },
    contractorInformation: "Contractor Information",
    companyName: "Company Name",
    address: "Address",
    phone: "Phone",
    fax: "Fax",
    email: "Email",
    licenseNumber: "License Number",
    jobInformation: "Job/Site Information",
    jobName: "Job Name",
    jobNumber: "Job Number",
    testLocation: "Test Location",
    testMethod: "Test Method",
    weatherConditions: "Weather Conditions",
    ambientTemperature: "Ambient Temperature",
    testMethods: {
      flow_meter: "Flow Meter",
      pitot_tube: "Pitot Tube",
      flow_loop: "Flow Loop",
      bypass: "Bypass",
      other: "Other",
    },
    pumpEquipment: "Pump Equipment",
    pumpTag: "Pump Tag",
    manufacturer: "Manufacturer",
    model: "Model",
    serialNumber: "Serial Number",
    pumpOrientation: "Pump Orientation",
    yearInstalled: "Year Installed",
    ratedFlow: "Rated Flow",
    ratedPressure: "Rated Pressure",
    ratedSpeed: "Rated Speed",
    shutoffPressure: "Shutoff Pressure",
    peakFlow: "Peak Flow",
    impellerDiameter: "Impeller Diameter",
    impellerType: "Impeller Type",
    numberOfStages: "Number of Stages",
    suctionSize: "Suction Size",
    dischargeSize: "Discharge Size",
    rotationDirection: "Rotation Direction",
    orientations: {
      horizontal_split: "Horizontal Split Case",
      vertical_inline: "Vertical Inline",
      vertical_turbine: "Vertical Turbine",
      end_suction: "End Suction",
    },
    driverInformation: "Driver Information",
    driverType: "Driver Type",
    driverTypes: {
      electric: "Electric Motor",
      diesel: "Diesel Engine",
      steam_turbine: "Steam Turbine",
    },
    horsePower: "Horsepower",
    ratedRpm: "Rated RPM",
    ratedVoltage: "Rated Voltage",
    phases: "Phases",
    hertz: "Frequency",
    fullLoadAmperage: "Full Load Amperage",
    lockedRotorAmperage: "Locked Rotor Amperage",
    serviceFactor: "Service Factor",
    enclosureType: "Enclosure Type",
    insulationClass: "Insulation Class",
    frameSize: "Frame Size",
    numberOfCylinders: "Number of Cylinders",
    displacement: "Displacement",
    fuelTankCapacity: "Fuel Tank Capacity",
    fuelLevel: "Fuel Level",
    oilLevel: "Oil Level",
    coolantLevel: "Coolant Level",
    batteryVoltage1: "Battery 1 Voltage",
    batteryVoltage2: "Battery 2 Voltage",
    engineBlockHeater: "Engine Block Heater",
    lastOilChange: "Last Oil Change",
    lastCoolantChange: "Last Coolant Change",
    controllerInformation: "Controller Information",
    panelTag: "Panel Tag",
    supplyVoltage: "Supply Voltage",
    startingType: "Starting Type",
    transferSwitchType: "Transfer Switch Type",
    automaticTransfer: "Automatic Transfer",
    pressureStart: "Pressure Start Setting",
    pressureStop: "Pressure Stop Setting",
    lowSuctionCutoff: "Low Suction Cutoff",
    phaseReversal: "Phase Reversal Protection",
    phaseLoss: "Phase Loss Protection",
    overcurrent: "Overcurrent Protection",
    powerSupply: "Power Supply",
    normalSource: "Normal Source",
    normalVoltage: "Normal Voltage (L1-L2, L2-L3, L3-L1)",
    emergencySource: "Emergency Source",
    emergencyAvailable: "Emergency Source Available",
    emergencyVoltage: "Emergency Voltage (L1-L2, L2-L3, L3-L1)",
    transferTime: "Transfer Time",
    supplyConditions: "Supply Conditions",
    supplySource: "Supply Source",
    staticPressure: "Static Pressure",
    residualPressure: "Residual Pressure",
    suctionReservoirLevel: "Suction Reservoir Level",
    waterTemperature: "Water Temperature",
    suctionScreen: "Suction Screen",
    suctionScreenCondition: "Suction Screen Condition",
    supplySources: {
      city_water: "City Water",
      tank: "Tank",
      reservoir: "Reservoir",
      pond: "Pond",
      well: "Well",
      other: "Other",
    },
    systemDemand: "System Demand",
    systemDemandFlow: "System Demand (GPM)",
    systemDemandPressure: "System Demand (PSI)",
    hoseDemand: "Hose Demand (GPM)",
    totalDemandFlow: "Total Demand (GPM)",
    totalDemandPressure: "Total Demand (PSI)",
    testConditions: "Test Conditions & Readings",
    suctionGauge: "Suction Gauge",
    dischargeGauge: "Discharge Gauge",
    flowMeterType: "Flow Meter Type",
    flowMeterSize: "Flow Meter Size",
    calibrationDate: "Calibration Date",
    testReadings: "Test Readings",
    flowPercent: "Flow %",
    flowGpm: "Flow (GPM)",
    suctionPsi: "Suction (PSI)",
    dischargePsi: "Discharge (PSI)",
    netPressure: "Net Pressure (PSI)",
    rpm: "RPM",
    voltage: "Voltage",
    amperage: "Amperage",
    observations: "Observations",
    noFlowChurn: "No Flow (Churn)",
    ratedFlowTest: "Rated Flow (100%)",
    peakFlowTest: "Peak Flow (150%)",
    resultsSummary: "Results Summary",
    shutoffTest: "Shutoff Pressure Test",
    ratedFlowPressureTest: "Rated Flow Pressure Test",
    peakFlowPressureTest: "Peak Flow Pressure Test",
    actual: "Actual",
    rated: "Rated",
    minimum: "Minimum",
    percentOfRated: "% of Rated",
    result: "Result",
    pass: "PASS",
    fail: "FAIL",
    conditional: "CONDITIONAL",
    overallResult: "Overall Result",
    netPressureAt: "Net Pressure at",
    speedAt: "Speed at",
    churn: "Churn",
    observationsDeficiencies: "Observations & Deficiencies",
    generalObservations: "General Observations",
    deficiencies: "Deficiencies",
    description: "Description",
    severity: "Severity",
    severityLabels: {
      minor: "Minor",
      major: "Major",
      critical: "Critical",
    },
    recommendedAction: "Recommended Action",
    targetDate: "Target Date",
    resolved: "Resolved",
    recommendedMaintenance: "Recommended Maintenance Actions",
    nextTestDue: "Next Test Due Date",
    signatures: "Signatures",
    conductedBy: "Test Conducted By",
    witnessedBy: "Witnessed By",
    ownerRepresentative: "Owner Representative",
    name: "Name",
    title: "Title",
    company: "Company",
    date: "Date",
    signature: "Signature",
    photos: "Test Photos",
    pumpCurveAttached: "Pump Curve Attached",
    previousTestAttached: "Previous Test Report Attached",
    additionalNotes: "Additional Notes",
    generatedOn: "Report generated on",
    yes: "Yes",
    no: "No",
  },
  "pt-BR": {
    reportTitle: "Relatório de Teste de Desempenho de Bomba de Incêndio",
    nfpaCompliance: "Conforme NFPA 25",
    testNumber: "Número do Teste",
    testDate: "Data do Teste",
    status: "Status",
    statusLabels: {
      draft: "Rascunho",
      in_progress: "Em Andamento",
      completed: "Concluído",
    },
    contractorInformation: "Informações do Contratante",
    companyName: "Nome da Empresa",
    address: "Endereço",
    phone: "Telefone",
    fax: "Fax",
    email: "Email",
    licenseNumber: "Número da Licença",
    jobInformation: "Informações do Local/Serviço",
    jobName: "Nome do Serviço",
    jobNumber: "Número do Serviço",
    testLocation: "Local do Teste",
    testMethod: "Método de Teste",
    weatherConditions: "Condições Climáticas",
    ambientTemperature: "Temperatura Ambiente",
    testMethods: {
      flow_meter: "Medidor de Vazão",
      pitot_tube: "Tubo de Pitot",
      flow_loop: "Loop de Vazão",
      bypass: "Bypass",
      other: "Outro",
    },
    pumpEquipment: "Equipamento da Bomba",
    pumpTag: "Tag da Bomba",
    manufacturer: "Fabricante",
    model: "Modelo",
    serialNumber: "Número de Série",
    pumpOrientation: "Orientação da Bomba",
    yearInstalled: "Ano de Instalação",
    ratedFlow: "Vazão Nominal",
    ratedPressure: "Pressão Nominal",
    ratedSpeed: "Rotação Nominal",
    shutoffPressure: "Pressão de Bloqueio",
    peakFlow: "Vazão de Pico",
    impellerDiameter: "Diâmetro do Rotor",
    impellerType: "Tipo de Rotor",
    numberOfStages: "Número de Estágios",
    suctionSize: "Diâmetro de Sucção",
    dischargeSize: "Diâmetro de Descarga",
    rotationDirection: "Sentido de Rotação",
    orientations: {
      horizontal_split: "Bipartida Horizontal",
      vertical_inline: "Vertical In-line",
      vertical_turbine: "Turbina Vertical",
      end_suction: "Sucção Final",
    },
    driverInformation: "Informações do Acionador",
    driverType: "Tipo de Acionador",
    driverTypes: {
      electric: "Motor Elétrico",
      diesel: "Motor Diesel",
      steam_turbine: "Turbina a Vapor",
    },
    horsePower: "Potência (HP)",
    ratedRpm: "RPM Nominal",
    ratedVoltage: "Tensão Nominal",
    phases: "Fases",
    hertz: "Frequência",
    fullLoadAmperage: "Corrente Plena Carga",
    lockedRotorAmperage: "Corrente Rotor Bloqueado",
    serviceFactor: "Fator de Serviço",
    enclosureType: "Tipo de Invólucro",
    insulationClass: "Classe de Isolamento",
    frameSize: "Tamanho da Carcaça",
    numberOfCylinders: "Número de Cilindros",
    displacement: "Cilindrada",
    fuelTankCapacity: "Capacidade do Tanque",
    fuelLevel: "Nível de Combustível",
    oilLevel: "Nível de Óleo",
    coolantLevel: "Nível de Refrigerante",
    batteryVoltage1: "Tensão Bateria 1",
    batteryVoltage2: "Tensão Bateria 2",
    engineBlockHeater: "Aquecedor do Bloco",
    lastOilChange: "Última Troca de Óleo",
    lastCoolantChange: "Última Troca de Refrigerante",
    controllerInformation: "Informações do Controlador",
    panelTag: "Tag do Painel",
    supplyVoltage: "Tensão de Alimentação",
    startingType: "Tipo de Partida",
    transferSwitchType: "Tipo de Chave de Transferência",
    automaticTransfer: "Transferência Automática",
    pressureStart: "Pressão de Partida",
    pressureStop: "Pressão de Parada",
    lowSuctionCutoff: "Corte por Baixa Sucção",
    phaseReversal: "Proteção Inversão de Fase",
    phaseLoss: "Proteção Falta de Fase",
    overcurrent: "Proteção Sobrecorrente",
    powerSupply: "Alimentação Elétrica",
    normalSource: "Fonte Normal",
    normalVoltage: "Tensão Normal (L1-L2, L2-L3, L3-L1)",
    emergencySource: "Fonte de Emergência",
    emergencyAvailable: "Fonte de Emergência Disponível",
    emergencyVoltage: "Tensão Emergência (L1-L2, L2-L3, L3-L1)",
    transferTime: "Tempo de Transferência",
    supplyConditions: "Condições de Suprimento",
    supplySource: "Fonte de Suprimento",
    staticPressure: "Pressão Estática",
    residualPressure: "Pressão Residual",
    suctionReservoirLevel: "Nível do Reservatório",
    waterTemperature: "Temperatura da Água",
    suctionScreen: "Tela de Sucção",
    suctionScreenCondition: "Condição da Tela",
    supplySources: {
      city_water: "Rede Pública",
      tank: "Tanque",
      reservoir: "Reservatório",
      pond: "Lago",
      well: "Poço",
      other: "Outro",
    },
    systemDemand: "Demanda do Sistema",
    systemDemandFlow: "Demanda do Sistema (GPM)",
    systemDemandPressure: "Demanda do Sistema (PSI)",
    hoseDemand: "Demanda de Mangueiras (GPM)",
    totalDemandFlow: "Demanda Total (GPM)",
    totalDemandPressure: "Demanda Total (PSI)",
    testConditions: "Condições e Leituras do Teste",
    suctionGauge: "Manômetro de Sucção",
    dischargeGauge: "Manômetro de Descarga",
    flowMeterType: "Tipo de Medidor",
    flowMeterSize: "Tamanho do Medidor",
    calibrationDate: "Data de Calibração",
    testReadings: "Leituras do Teste",
    flowPercent: "% Vazão",
    flowGpm: "Vazão (GPM)",
    suctionPsi: "Sucção (PSI)",
    dischargePsi: "Descarga (PSI)",
    netPressure: "Pressão Líquida (PSI)",
    rpm: "RPM",
    voltage: "Tensão",
    amperage: "Corrente",
    observations: "Observações",
    noFlowChurn: "Sem Vazão (Churn)",
    ratedFlowTest: "Vazão Nominal (100%)",
    peakFlowTest: "Vazão de Pico (150%)",
    resultsSummary: "Resumo dos Resultados",
    shutoffTest: "Teste de Pressão de Bloqueio",
    ratedFlowPressureTest: "Teste de Pressão na Vazão Nominal",
    peakFlowPressureTest: "Teste de Pressão na Vazão de Pico",
    actual: "Real",
    rated: "Nominal",
    minimum: "Mínimo",
    percentOfRated: "% do Nominal",
    result: "Resultado",
    pass: "APROVADO",
    fail: "REPROVADO",
    conditional: "CONDICIONAL",
    overallResult: "Resultado Geral",
    netPressureAt: "Pressão Líquida em",
    speedAt: "Rotação em",
    churn: "Bloqueio",
    observationsDeficiencies: "Observações e Deficiências",
    generalObservations: "Observações Gerais",
    deficiencies: "Deficiências",
    description: "Descrição",
    severity: "Severidade",
    severityLabels: {
      minor: "Menor",
      major: "Maior",
      critical: "Crítica",
    },
    recommendedAction: "Ação Recomendada",
    targetDate: "Data Prevista",
    resolved: "Resolvido",
    recommendedMaintenance: "Ações de Manutenção Recomendadas",
    nextTestDue: "Próximo Teste Previsto",
    signatures: "Assinaturas",
    conductedBy: "Teste Conduzido Por",
    witnessedBy: "Testemunhado Por",
    ownerRepresentative: "Representante do Proprietário",
    name: "Nome",
    title: "Cargo",
    company: "Empresa",
    date: "Data",
    signature: "Assinatura",
    photos: "Fotos do Teste",
    pumpCurveAttached: "Curva da Bomba Anexada",
    previousTestAttached: "Relatório Anterior Anexado",
    additionalNotes: "Notas Adicionais",
    generatedOn: "Relatório gerado em",
    yes: "Sim",
    no: "Não",
  },
};

interface GeneratePerformanceTestPdfOptions {
  test: PerformanceTest;
  language: "en" | "pt-BR";
}

const getLocalTimeZone = (): string | undefined => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
};

const formatDate = (dateString: string, language: string): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
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

const getResultBadge = (pass: boolean, t: typeof translations["en"]): string => {
  if (pass) {
    return `<span style="background: #22863A; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600;">${t.pass}</span>`;
  }
  return `<span style="background: #DC2626; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600;">${t.fail}</span>`;
};

const getOverallResultBadge = (result: "pass" | "fail" | "conditional", t: typeof translations["en"]): string => {
  const colors = {
    pass: "#22863A",
    fail: "#DC2626",
    conditional: "#F59E0B",
  };
  const labels = {
    pass: t.pass,
    fail: t.fail,
    conditional: t.conditional,
  };
  return `<span style="background: ${colors[result]}; color: white; padding: 6px 16px; border-radius: 16px; font-size: 14px; font-weight: 600;">${labels[result]}</span>`;
};

const getSeverityBadge = (severity: "minor" | "major" | "critical", t: typeof translations["en"]): string => {
  const colors = {
    minor: "#F59E0B",
    major: "#EA580C",
    critical: "#DC2626",
  };
  return `<span style="background: ${colors[severity]}; color: white; padding: 2px 8px; border-radius: 8px; font-size: 10px; font-weight: 600;">${t.severityLabels[severity]}</span>`;
};

const isElectricDriver = (driver: DriverInfo): driver is ElectricDriverInfo => {
  return driver.driverType === "electric";
};

const isDieselDriver = (driver: DriverInfo): driver is DieselDriverInfo => {
  return driver.driverType === "diesel";
};

const generatePerformanceTestPdfHtml = (options: GeneratePerformanceTestPdfOptions): string => {
  const { test, language } = options;
  const t = translations[language];

  const contractorAddress = [
    test.contractorInfo.address,
    test.contractorInfo.city,
    test.contractorInfo.state,
    test.contractorInfo.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  const jobAddress = [
    test.jobInfo.address,
    test.jobInfo.city,
    test.jobInfo.state,
  ]
    .filter(Boolean)
    .join(", ");

  const renderInfoItem = (label: string, value: string | number | undefined, unit?: string): string => {
    const displayValue = value ? `${sanitizeHtml(String(value))}${unit ? ` ${unit}` : ""}` : "-";
    return `
      <div class="info-item">
        <div class="info-label">${label}</div>
        <div class="info-value">${displayValue}</div>
      </div>
    `;
  };

  const renderBooleanItem = (label: string, value: boolean): string => {
    return `
      <div class="info-item">
        <div class="info-label">${label}</div>
        <div class="info-value">${value ? t.yes : t.no}</div>
      </div>
    `;
  };

  const renderReadingRow = (reading: TestReading, label?: string): string => {
    const hasVoltage = reading.voltageL1L2 || reading.voltageL2L3 || reading.voltageL3L1;
    const hasAmperage = reading.amperageL1 || reading.amperageL2 || reading.amperageL3;
    const voltageStr = hasVoltage
      ? [reading.voltageL1L2, reading.voltageL2L3, reading.voltageL3L1].filter(Boolean).join("/")
      : "-";
    const amperageStr = hasAmperage
      ? [reading.amperageL1, reading.amperageL2, reading.amperageL3].filter(Boolean).join("/")
      : "-";

    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #E5E7EB; text-align: center;">${label || reading.flowPercent}%</td>
        <td style="padding: 8px; border: 1px solid #E5E7EB; text-align: center;">${sanitizeHtml(reading.flowGpm) || "-"}</td>
        <td style="padding: 8px; border: 1px solid #E5E7EB; text-align: center;">${sanitizeHtml(reading.suctionPsi) || "-"}</td>
        <td style="padding: 8px; border: 1px solid #E5E7EB; text-align: center;">${sanitizeHtml(reading.dischargePsi) || "-"}</td>
        <td style="padding: 8px; border: 1px solid #E5E7EB; text-align: center;">${sanitizeHtml(reading.netPressurePsi) || "-"}</td>
        <td style="padding: 8px; border: 1px solid #E5E7EB; text-align: center;">${sanitizeHtml(reading.rpm) || "-"}</td>
        <td style="padding: 8px; border: 1px solid #E5E7EB; text-align: center; font-size: 10px;">${voltageStr}</td>
        <td style="padding: 8px; border: 1px solid #E5E7EB; text-align: center; font-size: 10px;">${amperageStr}</td>
      </tr>
    `;
  };

  const renderSignatureBlock = (sig: TestSignature | undefined, label: string): string => {
    if (!sig || (!sig.name && !sig.signatureData)) return "";
    return `
      <div style="flex: 1; min-width: 200px; padding: 15px; background: #F9FAFB; border-radius: 8px; margin: 5px;">
        <h4 style="margin: 0 0 10px 0; color: #6B7280; font-size: 11px;">${label}</h4>
        ${sig.signatureData ? `<img src="${sig.signatureData}" style="max-height: 60px; margin-bottom: 8px;" />` : ""}
        <div style="font-size: 12px;"><strong>${sanitizeHtml(sig.name)}</strong></div>
        ${sig.title ? `<div style="font-size: 11px; color: #6B7280;">${sanitizeHtml(sig.title)}</div>` : ""}
        ${sig.company ? `<div style="font-size: 11px; color: #6B7280;">${sanitizeHtml(sig.company)}</div>` : ""}
        ${sig.date ? `<div style="font-size: 11px; color: #9CA3AF;">${formatDate(sig.date, language)}</div>` : ""}
      </div>
    `;
  };

  const driverSection = (): string => {
    const driver = test.driverInfo;
    if (isElectricDriver(driver)) {
      return `
        <div class="section">
          <h2 class="section-title">${t.driverInformation}</h2>
          <div class="info-grid">
            ${renderInfoItem(t.driverType, t.driverTypes.electric)}
            ${renderInfoItem(t.manufacturer, driver.manufacturer)}
            ${renderInfoItem(t.model, driver.model)}
            ${renderInfoItem(t.serialNumber, driver.serialNumber)}
            ${renderInfoItem(t.horsePower, driver.horsePower, "HP")}
            ${renderInfoItem(t.ratedRpm, driver.ratedRpm, "RPM")}
            ${renderInfoItem(t.ratedVoltage, driver.ratedVoltage, "V")}
            ${renderInfoItem(t.phases, driver.phases)}
            ${renderInfoItem(t.hertz, driver.hertz, "Hz")}
            ${renderInfoItem(t.fullLoadAmperage, driver.fullLoadAmperage, "A")}
            ${renderInfoItem(t.lockedRotorAmperage, driver.lockedRotorAmperage, "A")}
            ${renderInfoItem(t.serviceFactor, driver.serviceFactor)}
            ${renderInfoItem(t.enclosureType, driver.enclosureType)}
            ${renderInfoItem(t.insulationClass, driver.insulationClass)}
            ${renderInfoItem(t.frameSize, driver.frameSize)}
          </div>
        </div>
      `;
    } else if (isDieselDriver(driver)) {
      return `
        <div class="section">
          <h2 class="section-title">${t.driverInformation}</h2>
          <div class="info-grid">
            ${renderInfoItem(t.driverType, t.driverTypes.diesel)}
            ${renderInfoItem(t.manufacturer, driver.manufacturer)}
            ${renderInfoItem(t.model, driver.model)}
            ${renderInfoItem(t.serialNumber, driver.serialNumber)}
            ${renderInfoItem(t.horsePower, driver.horsePower, "HP")}
            ${renderInfoItem(t.ratedRpm, driver.ratedRpm, "RPM")}
            ${renderInfoItem(t.numberOfCylinders, driver.numberOfCylinders)}
            ${renderInfoItem(t.displacement, driver.displacement)}
            ${renderInfoItem(t.fuelTankCapacity, driver.fuelTankCapacityGal, "gal")}
            ${renderInfoItem(t.fuelLevel, driver.fuelLevel)}
            ${renderInfoItem(t.oilLevel, driver.oilLevel)}
            ${renderInfoItem(t.coolantLevel, driver.coolantLevel)}
            ${renderInfoItem(t.batteryVoltage1, driver.batteryVoltage1, "V")}
            ${renderInfoItem(t.batteryVoltage2, driver.batteryVoltage2, "V")}
            ${renderInfoItem(t.engineBlockHeater, driver.engineBlockHeaterStatus)}
            ${renderInfoItem(t.lastOilChange, driver.lastOilChangeDate)}
            ${renderInfoItem(t.lastCoolantChange, driver.lastCoolantChangeDate)}
          </div>
        </div>
      `;
    } else {
      const driverTypeLabel = (t.driverTypes as Record<string, string>)[driver.driverType] || driver.driverType;
      return `
        <div class="section">
          <h2 class="section-title">${t.driverInformation}</h2>
          <div class="info-grid">
            ${renderInfoItem(t.driverType, driverTypeLabel)}
            ${renderInfoItem(t.manufacturer, (driver as any).manufacturer)}
            ${renderInfoItem(t.model, (driver as any).model)}
            ${renderInfoItem(t.serialNumber, (driver as any).serialNumber)}
            ${renderInfoItem(t.horsePower, (driver as any).horsePower, "HP")}
            ${renderInfoItem(t.ratedRpm, (driver as any).ratedRpm, "RPM")}
          </div>
        </div>
      `;
    }
  };

  const deficienciesRows = test.observationsDeficiencies.deficiencies
    .map(
      (def: Deficiency) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #E5E7EB;">${sanitizeHtml(def.description)}</td>
        <td style="padding: 10px; border: 1px solid #E5E7EB; text-align: center;">${getSeverityBadge(def.severity, t)}</td>
        <td style="padding: 10px; border: 1px solid #E5E7EB;">${sanitizeHtml(def.recommendedAction)}</td>
        <td style="padding: 10px; border: 1px solid #E5E7EB; text-align: center;">${formatDate(def.targetCompletionDate, language)}</td>
        <td style="padding: 10px; border: 1px solid #E5E7EB; text-align: center;">${def.resolved ? t.yes : t.no}</td>
      </tr>
    `
    )
    .join("");

  const validPhotos = test.attachments.photos.filter((p: TestPhoto) => p.base64);
  const photosHtml =
    validPhotos.length > 0
      ? `
    <div class="section" style="page-break-inside: avoid;">
      <h2 class="section-title">${t.photos}</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px;">
        ${validPhotos
          .map(
            (photo: TestPhoto) => `
          <div style="width: 180px; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
            <img src="${photo.base64}" style="width: 100%; height: 120px; object-fit: cover;" />
            ${photo.caption ? `<p style="margin: 0; padding: 8px; font-size: 10px; color: #4B5563;">${sanitizeHtml(photo.caption)}</p>` : ""}
          </div>
        `
          )
          .join("")}
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
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: #1F2937;
          background: white;
        }
        .page { padding: 40px; max-width: 900px; margin: 0 auto; }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #DC2626;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo-section { display: flex; align-items: center; gap: 12px; }
        .logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
        .company-name { font-size: 24px; font-weight: bold; color: #111827; }
        .report-title { font-size: 14px; color: #6B7280; margin-top: 5px; }
        .compliance-badge {
          background: #22863A;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        .section { margin-bottom: 25px; }
        .section-title {
          color: #111827;
          font-size: 16px;
          font-weight: 600;
          border-bottom: 2px solid #DC2626;
          padding-bottom: 8px;
          margin-bottom: 15px;
        }
        .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .info-item { padding: 8px; background: #F9FAFB; border-radius: 6px; }
        .info-label { font-size: 10px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
        .info-value { font-size: 12px; color: #111827; font-weight: 500; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #111827; color: white; padding: 10px; text-align: center; font-size: 11px; }
        .footer { margin-top: 40px; text-align: center; color: #9CA3AF; font-size: 10px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
        @media print { .page { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="logo-section">
            <div class="logo-icon">FS</div>
            <div>
              <div class="company-name">FireSafe ITM</div>
              <div class="report-title">${t.reportTitle}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div class="compliance-badge">${t.nfpaCompliance}</div>
            <div style="margin-top: 10px; font-size: 12px; color: #6B7280;">
              ${t.testNumber}: <strong>${sanitizeHtml(test.testNumber) || "-"}</strong>
            </div>
            <div style="font-size: 12px; color: #6B7280;">
              ${t.testDate}: <strong>${formatDate(test.jobInfo.testDate, language)}</strong>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.contractorInformation}</h2>
          <div class="info-grid">
            ${renderInfoItem(t.companyName, test.contractorInfo.companyName)}
            ${renderInfoItem(t.licenseNumber, test.contractorInfo.licenseNumber)}
            ${renderInfoItem(t.phone, test.contractorInfo.phone)}
            ${renderInfoItem(t.fax, test.contractorInfo.fax)}
            <div class="info-item" style="grid-column: span 2;">
              <div class="info-label">${t.address}</div>
              <div class="info-value">${sanitizeHtml(contractorAddress) || "-"}</div>
            </div>
            <div class="info-item" style="grid-column: span 2;">
              <div class="info-label">${t.email}</div>
              <div class="info-value">${sanitizeHtml(test.contractorInfo.email) || "-"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.jobInformation}</h2>
          <div class="info-grid">
            ${renderInfoItem(t.jobName, test.jobInfo.jobName)}
            ${renderInfoItem(t.jobNumber, test.jobInfo.jobNumber)}
            <div class="info-item" style="grid-column: span 2;">
              <div class="info-label">${t.address}</div>
              <div class="info-value">${sanitizeHtml(jobAddress) || "-"}</div>
            </div>
            ${renderInfoItem(t.testLocation, test.jobInfo.testLocation)}
            ${renderInfoItem(t.testMethod, t.testMethods[test.jobInfo.testMethod] || test.jobInfo.testMethod)}
            ${renderInfoItem(t.weatherConditions, test.jobInfo.weatherConditions)}
            ${renderInfoItem(t.ambientTemperature, test.jobInfo.ambientTemperatureF, "°F")}
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.pumpEquipment}</h2>
          <div class="info-grid">
            ${renderInfoItem(t.pumpTag, test.pumpEquipment.pumpTag)}
            ${renderInfoItem(t.manufacturer, test.pumpEquipment.manufacturer)}
            ${renderInfoItem(t.model, test.pumpEquipment.model)}
            ${renderInfoItem(t.serialNumber, test.pumpEquipment.serialNumber)}
            ${renderInfoItem(t.pumpOrientation, t.orientations[test.pumpEquipment.pumpOrientation])}
            ${renderInfoItem(t.yearInstalled, test.pumpEquipment.yearInstalled)}
            ${renderInfoItem(t.ratedFlow, test.pumpEquipment.ratedFlowGpm, "GPM")}
            ${renderInfoItem(t.ratedPressure, test.pumpEquipment.ratedPressurePsi, "PSI")}
            ${renderInfoItem(t.ratedSpeed, test.pumpEquipment.ratedSpeedRpm, "RPM")}
            ${renderInfoItem(t.shutoffPressure, test.pumpEquipment.shutoffPressurePsi, "PSI")}
            ${renderInfoItem(t.peakFlow, test.pumpEquipment.peakFlowGpm, "GPM")}
            ${renderInfoItem(t.impellerDiameter, test.pumpEquipment.impellerDiameterIn, "in")}
            ${renderInfoItem(t.impellerType, test.pumpEquipment.impellerType)}
            ${renderInfoItem(t.numberOfStages, test.pumpEquipment.numberOfStages)}
            ${renderInfoItem(t.suctionSize, test.pumpEquipment.suctionSizeIn, "in")}
            ${renderInfoItem(t.dischargeSize, test.pumpEquipment.dischargeSizeIn, "in")}
          </div>
        </div>

        ${driverSection()}

        <div class="section">
          <h2 class="section-title">${t.controllerInformation}</h2>
          <div class="info-grid">
            ${renderInfoItem(t.panelTag, test.controllerInfo.panelTag)}
            ${renderInfoItem(t.manufacturer, test.controllerInfo.manufacturer)}
            ${renderInfoItem(t.model, test.controllerInfo.model)}
            ${renderInfoItem(t.serialNumber, test.controllerInfo.serialNumber)}
            ${renderInfoItem(t.supplyVoltage, test.controllerInfo.supplyVoltage, "V")}
            ${renderInfoItem(t.startingType, test.controllerInfo.startingType)}
            ${renderInfoItem(t.transferSwitchType, test.controllerInfo.transferSwitchType)}
            ${renderBooleanItem(t.automaticTransfer, test.controllerInfo.hasAutomaticTransfer)}
            ${renderInfoItem(t.pressureStart, test.controllerInfo.pressureSettingStart, "PSI")}
            ${renderInfoItem(t.pressureStop, test.controllerInfo.pressureSettingStop, "PSI")}
            ${renderBooleanItem(t.lowSuctionCutoff, test.controllerInfo.hasLowSuctionCutoff)}
            ${test.controllerInfo.hasLowSuctionCutoff ? renderInfoItem("", test.controllerInfo.lowSuctionCutoffPsi, "PSI") : '<div class="info-item"></div>'}
            ${renderBooleanItem(t.phaseReversal, test.controllerInfo.hasPhaseReversal)}
            ${renderBooleanItem(t.phaseLoss, test.controllerInfo.hasPhaseLoss)}
            ${renderBooleanItem(t.overcurrent, test.controllerInfo.hasOvercurrent)}
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.powerSupply}</h2>
          <div class="info-grid">
            ${renderInfoItem(t.normalSource, test.powerSupply.normalSourceDescription)}
            <div class="info-item" style="grid-column: span 3;">
              <div class="info-label">${t.normalVoltage}</div>
              <div class="info-value">${[test.powerSupply.normalSourceVoltageL1L2, test.powerSupply.normalSourceVoltageL2L3, test.powerSupply.normalSourceVoltageL3L1].filter(Boolean).join(" / ") || "-"} V</div>
            </div>
            ${renderBooleanItem(t.emergencyAvailable, test.powerSupply.emergencySourceAvailable)}
            ${renderInfoItem(t.emergencySource, test.powerSupply.emergencySourceDescription)}
            <div class="info-item" style="grid-column: span 2;">
              <div class="info-label">${t.emergencyVoltage}</div>
              <div class="info-value">${[test.powerSupply.emergencySourceVoltageL1L2, test.powerSupply.emergencySourceVoltageL2L3, test.powerSupply.emergencySourceVoltageL3L1].filter(Boolean).join(" / ") || "-"} V</div>
            </div>
            ${renderInfoItem(t.transferTime, test.powerSupply.transferTimeSeconds, "s")}
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.supplyConditions}</h2>
          <div class="info-grid">
            ${renderInfoItem(t.supplySource, test.supplyConditions.supplySource === "other" && test.supplyConditions.supplySourceOther ? `${t.supplySources.other}: ${test.supplyConditions.supplySourceOther}` : (t.supplySources[test.supplyConditions.supplySource] || test.supplyConditions.supplySource))}
            ${renderInfoItem(t.staticPressure, test.supplyConditions.staticPressurePsi, "PSI")}
            ${renderInfoItem(t.residualPressure, test.supplyConditions.residualPressurePsi, "PSI")}
            ${renderInfoItem(t.suctionReservoirLevel, test.supplyConditions.suctionReservoirLevel)}
            ${renderInfoItem(t.waterTemperature, test.supplyConditions.waterTemperatureF, "°F")}
            ${renderBooleanItem(t.suctionScreen, test.supplyConditions.hasSuctionScreen)}
            ${renderInfoItem(t.suctionScreenCondition, test.supplyConditions.suctionScreenCondition)}
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.systemDemand}</h2>
          <div class="info-grid">
            ${renderInfoItem(t.systemDemandFlow, test.systemDemand.systemDemandGpm, "GPM")}
            ${renderInfoItem(t.systemDemandPressure, test.systemDemand.systemDemandPsi, "PSI")}
            ${renderInfoItem(t.hoseDemand, test.systemDemand.hoseDemandGpm, "GPM")}
            ${renderInfoItem(t.totalDemandFlow, test.systemDemand.totalDemandGpm, "GPM")}
          </div>
        </div>

        <div class="section" style="page-break-before: always;">
          <h2 class="section-title">${t.testConditions}</h2>
          <div class="info-grid" style="margin-bottom: 20px;">
            ${renderInfoItem(t.suctionGauge, test.testConditions.suctionGaugePsi, "PSI")}
            ${renderInfoItem(t.dischargeGauge, test.testConditions.dischargeGaugePsi, "PSI")}
            ${renderInfoItem(t.flowMeterType, test.testConditions.flowMeterType)}
            ${renderInfoItem(t.flowMeterSize, test.testConditions.flowMeterSize)}
            ${renderInfoItem(t.calibrationDate, test.testConditions.flowMeterCalibrationDate)}
          </div>

          <h3 style="font-size: 14px; color: #111827; margin-bottom: 10px;">${t.testReadings}</h3>
          <table>
            <thead>
              <tr>
                <th>${t.flowPercent}</th>
                <th>${t.flowGpm}</th>
                <th>${t.suctionPsi}</th>
                <th>${t.dischargePsi}</th>
                <th>${t.netPressure}</th>
                <th>${t.rpm}</th>
                <th>${t.voltage}</th>
                <th>${t.amperage}</th>
              </tr>
            </thead>
            <tbody>
              ${renderReadingRow(test.testConditions.noFlowReading, "0 (Churn)")}
              ${test.testConditions.readings.map((r: TestReading) => renderReadingRow(r)).join("")}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">${t.resultsSummary}</h2>
          <div style="display: flex; justify-content: center; margin-bottom: 20px;">
            <div style="text-align: center;">
              <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">${t.overallResult}</div>
              ${getOverallResultBadge(test.resultsSummary.overallResult, t)}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Test</th>
                <th>${t.actual}</th>
                <th>${t.rated}/${t.minimum}</th>
                <th>${t.percentOfRated}</th>
                <th>${t.result}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px; border: 1px solid #E5E7EB; font-weight: 500;">${t.shutoffTest}</td>
                <td style="padding: 10px; border: 1px solid #E5E7EB; text-align: center;">${sanitizeHtml(test.resultsSummary.shutoffPressureActual) || "-"} PSI</td>
                <td style="padding: 10px; border: 1px solid #E5E7EB; text-align: center;">${sanitizeHtml(test.resultsSummary.shutoffPressureRated) || "-"} PSI</td>
                <td style="padding: 10px; border: 1px solid #E5E7EB; text-align: center;">${sanitizeHtml(test.resultsSummary.shutoffPressurePercent) || "-"}%</td>
                <td style="padding: 10px; border: 1px solid #E5E7EB; text-align: center;">${getResultBadge(test.resultsSummary.shutoffPressurePass, t)}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #E5E7EB; font-weight: 500;">${t.ratedFlowPressureTest}</td>
                <td style="padding: 10px; border: 1px solid #E5E7EB; text-align: center;">${sanitizeHtml(test.resultsSummary.ratedFlowPressureActual) || "-"} PSI</td>
                <td style="padding: 10px; border: 1px solid #E5E7EB; text-align: center;">${sanitizeHtml(test.resultsSummary.ratedFlowPressureRated) || "-"} PSI</td>
                <td style="padding: 10px; border: 1px solid #E5E7EB; text-align: center;">${sanitizeHtml(test.resultsSummary.ratedFlowPressurePercent) || "-"}%</td>
                <td style="padding: 10px; border: 1px solid #E5E7EB; text-align: center;">${getResultBadge(test.resultsSummary.ratedFlowPass, t)}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #E5E7EB; font-weight: 500;">${t.peakFlowPressureTest}</td>
                <td style="padding: 10px; border: 1px solid #E5E7EB; text-align: center;">${sanitizeHtml(test.resultsSummary.peakFlowPressureActual) || "-"} PSI</td>
                <td style="padding: 10px; border: 1px solid #E5E7EB; text-align: center;">${sanitizeHtml(test.resultsSummary.peakFlowPressureMin) || "-"} PSI</td>
                <td style="padding: 10px; border: 1px solid #E5E7EB; text-align: center;">${sanitizeHtml(test.resultsSummary.peakFlowPressurePercent) || "-"}%</td>
                <td style="padding: 10px; border: 1px solid #E5E7EB; text-align: center;">${getResultBadge(test.resultsSummary.peakFlowPass, t)}</td>
              </tr>
            </tbody>
          </table>
          <div class="info-grid" style="margin-top: 15px;">
            ${renderInfoItem(`${t.netPressureAt} ${t.churn}`, test.resultsSummary.netPressureAtChurn, "PSI")}
            ${renderInfoItem(`${t.netPressureAt} 100%`, test.resultsSummary.netPressureAtRated, "PSI")}
            ${renderInfoItem(`${t.netPressureAt} 150%`, test.resultsSummary.netPressureAtPeak, "PSI")}
            ${renderInfoItem(`${t.speedAt} ${t.churn}`, test.resultsSummary.speedAtChurn, "RPM")}
            ${renderInfoItem(`${t.speedAt} 100%`, test.resultsSummary.speedAtRated, "RPM")}
            ${renderInfoItem(`${t.speedAt} 150%`, test.resultsSummary.speedAtPeak, "RPM")}
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t.observationsDeficiencies}</h2>
          ${test.observationsDeficiencies.generalObservations ? `
            <div style="margin-bottom: 15px;">
              <h4 style="font-size: 12px; color: #6B7280; margin-bottom: 5px;">${t.generalObservations}</h4>
              <div style="padding: 12px; background: #F9FAFB; border-radius: 8px; font-size: 12px;">${sanitizeHtml(test.observationsDeficiencies.generalObservations)}</div>
            </div>
          ` : ""}
          ${test.observationsDeficiencies.deficiencies.length > 0 ? `
            <h4 style="font-size: 12px; color: #6B7280; margin-bottom: 10px;">${t.deficiencies}</h4>
            <table>
              <thead>
                <tr>
                  <th style="text-align: left;">${t.description}</th>
                  <th>${t.severity}</th>
                  <th style="text-align: left;">${t.recommendedAction}</th>
                  <th>${t.targetDate}</th>
                  <th>${t.resolved}</th>
                </tr>
              </thead>
              <tbody>${deficienciesRows}</tbody>
            </table>
          ` : ""}
          ${test.observationsDeficiencies.recommendedMaintenanceActions ? `
            <div style="margin-top: 15px;">
              <h4 style="font-size: 12px; color: #6B7280; margin-bottom: 5px;">${t.recommendedMaintenance}</h4>
              <div style="padding: 12px; background: #F9FAFB; border-radius: 8px; font-size: 12px;">${sanitizeHtml(test.observationsDeficiencies.recommendedMaintenanceActions)}</div>
            </div>
          ` : ""}
          ${test.observationsDeficiencies.nextTestDueDate ? `
            <div style="margin-top: 15px;">
              <strong>${t.nextTestDue}:</strong> ${formatDate(test.observationsDeficiencies.nextTestDueDate, language)}
            </div>
          ` : ""}
        </div>

        <div class="section" style="page-break-inside: avoid;">
          <h2 class="section-title">${t.signatures}</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${renderSignatureBlock(test.signatures.conductedBy, t.conductedBy)}
            ${renderSignatureBlock(test.signatures.witnessedBy, t.witnessedBy)}
            ${renderSignatureBlock(test.signatures.ownerRepresentative, t.ownerRepresentative)}
          </div>
        </div>

        ${photosHtml}

        ${test.attachments.additionalNotes ? `
          <div class="section">
            <h2 class="section-title">${t.additionalNotes}</h2>
            <div style="padding: 12px; background: #F9FAFB; border-radius: 8px; font-size: 12px;">${sanitizeHtml(test.attachments.additionalNotes)}</div>
          </div>
        ` : ""}

        <div class="footer">
          <p>${t.generatedOn} ${formatDate(new Date().toISOString(), language)}</p>
          <p style="margin-top: 5px;">FireSafe ITM - ${t.nfpaCompliance}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generatePerformanceTestPdf = async (
  options: GeneratePerformanceTestPdfOptions
): Promise<{ success: boolean; uri?: string; error?: string }> => {
  try {
    const html = generatePerformanceTestPdfHtml(options);
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });
    return { success: true, uri };
  } catch (error) {
    console.error("Error generating performance test PDF:", error);
    return { success: false, error: String(error) };
  }
};

export const sharePerformanceTestPdf = async (
  options: GeneratePerformanceTestPdfOptions
): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await generatePerformanceTestPdf(options);
    if (!result.success || !result.uri) {
      return { success: false, error: result.error || "Failed to generate PDF" };
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      return { success: false, error: "Sharing is not available on this device" };
    }

    await Sharing.shareAsync(result.uri, {
      mimeType: "application/pdf",
      dialogTitle: options.language === "pt-BR" 
        ? "Compartilhar Relatório de Teste" 
        : "Share Test Report",
      UTI: "com.adobe.pdf",
    });

    return { success: true };
  } catch (error) {
    console.error("Error sharing performance test PDF:", error);
    return { success: false, error: String(error) };
  }
};
