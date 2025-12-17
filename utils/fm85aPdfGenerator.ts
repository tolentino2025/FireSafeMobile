import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { FM85ACertificate } from "@/types/fm85a";

const sanitizeHtml = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const formatYesNo = (value: 'Y' | 'N' | '' | undefined, language: 'en' | 'pt-BR'): string => {
  const yesLabel = language === 'pt-BR' ? 'S' : 'Y';
  const noLabel = language === 'pt-BR' ? 'N' : 'N';
  if (value === 'Y') return `<span style="font-weight: bold;">${yesLabel}</span>`;
  if (value === 'N') return `<span style="font-weight: bold;">${noLabel}</span>`;
  return '';
};

interface FM85APdfOptions {
  certificate: FM85ACertificate;
  language: "en" | "pt-BR";
}

const translations = {
  en: {
    title: "FM GLOBAL",
    subtitle: "Certificate of Materials and Tests for Aboveground Piping",
    formNo: "Form 85A",
    date: "Date",
    contractorInfo: "Sprinkler Contractor Information",
    contractorName: "Contractor Company Name",
    contractorAddress: "Address",
    clientInfo: "FM Global Client Information",
    fmIndexNo: "FM Global Index No.",
    fmAccountNo: "FM Global Account No.",
    buildingOwnerTenant: "Is Building Owner or Tenant?",
    buildingNameNo: "Building Name/No.",
    clientName: "FM Global Client Name",
    clientAddress: "Address",
    occupancy: "Occupancy Description",
    sprinklersSection: "Automatic Sprinklers",
    manufacturer: "Manufacturer",
    modelTradeName: "Model/Trade Name",
    kFactor: "K-Factor",
    tempRating: "Temp Rating",
    sin: "SIN",
    yearMfg: "Year Mfg",
    quantity: "Qty",
    pipeSection: "Automatic Sprinkler Pipe",
    productDesc: "Product Description",
    schedule: "Schedule",
    connectionType: "Connection Type",
    maxWorkPressure: "Max Working Pressure",
    pipeConnectionsSection: "Pipe Connections (Fittings, Couplings, Joints)",
    pipeEnds: "Pipe Ends",
    pipeHangersSection: "Pipe Hangers and Components",
    hangerRodSize: "Hanger Rod Size",
    componentDesc: "Component Description",
    nominalPipeSize: "Nominal Pipe Size",
    alarmValvesSection: "Alarm Check, Dry Pipe, and Automatic Release Valves",
    type: "Type",
    model: "Model",
    serialNo: "Serial No.",
    detectionValvesSection: "Detection/Release Valves",
    protectedArea: "Protected Area",
    linearSpacing: "Linear Spacing",
    areaSpacing: "Area Spacing",
    controlValvesSection: "Control or Pressure Reducing Valves",
    checkValvesSection: "Check or Backflow Prevention Valves",
    miscComponentsSection: "Miscellaneous Components",
    waterflowAlarm: "Waterflow Alarm",
    quickOpeningDevice: "Quick Opening Device",
    pressureGauge: "Pressure Gauge",
    fireDeptConnection: "Fire Dept. Connection",
    reliefValve: "Relief Valve",
    testConnection: "Test Connection",
    drainValve: "Drain Valve",
    otherComponentsSection: "Other Components",
    component: "Component",
    autoReleaseQuestions: "Automatic Release Valve Questions",
    detectionType: "Detection Type",
    interlockArrangement: "Interlock Arrangement",
    airPressureSupervised: "Air Pressure Supervised?",
    manualOperationArranged: "Manual Operation Arranged?",
    detectionElectricQuestions: "Detection Electric Questions",
    circuitrySupervised: "Circuitry Supervised per DS 5-40?",
    controlPanelMakeModel: "Automatic Release Control Panel Make/Model",
    solenoidValveMakeModel: "Solenoid Release Valve Make/Model",
    testsSection: "Tests",
    hydrostaticTest: "Hydrostatic Test",
    pneumaticTest: "Pneumatic Test",
    testedPressure: "Tested Pressure (psi)",
    durationHours: "Duration (hours)",
    pressureDrop: "Pressure Drop (psi)",
    waterflowAlarmTest: "Waterflow Alarm Test",
    totalDevicesTested: "Total Devices Tested",
    devicesOver60Sec: "Devices >60 Seconds",
    dryPipeAutoReleaseTest: "Dry Pipe / Automatic Release Testing",
    systemNoName: "System No./Name",
    waterPressureBelow: "Water Pressure Below Valve",
    systemAirPressure: "System Air Pressure",
    minPressureReq: "Min Pressure Req at Sprinkler",
    reqWaterDelivery: "Required Water Delivery Time",
    withoutQOD: "Without QOD",
    withQOD: "With QOD",
    autoReleaseTestQuestions: "Automatic Release Valve Test Questions",
    valveOperatedManAuto: "Valve Operated Manually and Automatically?",
    allUnitsTested: "If Detection Electronic, Were All Units Tested?",
    pressureReducingTest: "Pressure Reducing Valve Testing",
    location: "Location",
    make: "Make",
    setting: "Setting",
    staticInlet: "Static Inlet",
    staticOutlet: "Static Outlet",
    residualInlet: "Residual Inlet",
    residualOutlet: "Residual Outlet",
    flowRate: "Flow Rate",
    blankTestingGaskets: "Blank Testing Gaskets",
    numberUsed: "Number Used",
    numberRemoved: "Number Removed",
    weldedPipeConnections: "Welded Pipe Connections",
    weldingProceduresComplied: "Welding Procedures Complied?",
    weldersQualified: "Welders Qualified?",
    qcProcedure: "QC Procedure Ensured Discs/Coupons Retrieved and Clean?",
    drainTests: "Drain Tests",
    staticPressure: "Static Pressure",
    residualPressure: "Residual Pressure",
    staticAfterwards: "Static Afterwards",
    undergroundMains: "Underground Mains",
    verifiedOnFM85B: "Verified on FM 85B?",
    ifNoFormUsed: "If No, What Form Used?",
    contractorFlushed: "What Contractor Flushed?",
    instructionMaterials: "Instruction Materials",
    personInstructed: "Person in Charge Instructed?",
    copiesLeft: "Copies Left on Premises?",
    ifNoExplain: "If No, Explain",
    dateSystemInService: "Date System Left in Service (All Valves Open)",
    signaturesSection: "Signatures",
    propertyOwnerAgent: "Property Owner/Authorized Agent",
    name: "Name",
    signature: "Signature",
    signatureTitle: "Title",
    sprinklerContractor: "Sprinkler Contractor",
    additionalNotes: "Additional Notes",
    generatedBy: "Generated by FireSafe ITM",
    geolocation: "Geolocation",
    latitude: "Latitude",
    longitude: "Longitude",
    accuracy: "Accuracy",
    meters: "m",
  },
  "pt-BR": {
    title: "FM GLOBAL",
    subtitle: "Certificado de Materiais e Testes para Tubulação Acima do Solo",
    formNo: "Formulário 85A",
    date: "Data",
    contractorInfo: "Informações do Contratante de Sprinklers",
    contractorName: "Nome da Empresa Contratante",
    contractorAddress: "Endereço",
    clientInfo: "Informações do Cliente FM Global",
    fmIndexNo: "Nº de Índice FM Global",
    fmAccountNo: "Nº de Conta FM Global",
    buildingOwnerTenant: "É Proprietário ou Inquilino do Edifício?",
    buildingNameNo: "Nome/Nº do Edifício",
    clientName: "Nome do Cliente FM Global",
    clientAddress: "Endereço",
    occupancy: "Descrição da Ocupação",
    sprinklersSection: "Sprinklers Automáticos",
    manufacturer: "Fabricante",
    modelTradeName: "Modelo/Nome Comercial",
    kFactor: "Fator K",
    tempRating: "Classificação Temp.",
    sin: "SIN",
    yearMfg: "Ano Fab.",
    quantity: "Qtd",
    pipeSection: "Tubulação de Sprinkler Automático",
    productDesc: "Descrição do Produto",
    schedule: "Schedule",
    connectionType: "Tipo de Conexão",
    maxWorkPressure: "Pressão Máx. de Trabalho",
    pipeConnectionsSection: "Conexões de Tubulação (Acessórios, Acoplamentos, Juntas)",
    pipeEnds: "Extremidades do Tubo",
    pipeHangersSection: "Suportes de Tubulação e Componentes",
    hangerRodSize: "Tamanho da Haste",
    componentDesc: "Descrição do Componente",
    nominalPipeSize: "Tamanho Nominal do Tubo",
    alarmValvesSection: "Válvulas de Alarme, Tubo Seco e Liberação Automática",
    type: "Tipo",
    model: "Modelo",
    serialNo: "Nº de Série",
    detectionValvesSection: "Válvulas de Detecção/Liberação",
    protectedArea: "Área Protegida",
    linearSpacing: "Espaçamento Linear",
    areaSpacing: "Espaçamento de Área",
    controlValvesSection: "Válvulas de Controle ou Redução de Pressão",
    checkValvesSection: "Válvulas de Retenção ou Prevenção de Refluxo",
    miscComponentsSection: "Componentes Diversos",
    waterflowAlarm: "Alarme de Fluxo de Água",
    quickOpeningDevice: "Dispositivo de Abertura Rápida",
    pressureGauge: "Manômetro",
    fireDeptConnection: "Conexão do Corpo de Bombeiros",
    reliefValve: "Válvula de Alívio",
    testConnection: "Conexão de Teste",
    drainValve: "Válvula de Drenagem",
    otherComponentsSection: "Outros Componentes",
    component: "Componente",
    autoReleaseQuestions: "Perguntas sobre Válvula de Liberação Automática",
    detectionType: "Tipo de Detecção",
    interlockArrangement: "Arranjo de Intertravamento",
    airPressureSupervised: "Pressão de Ar Supervisionada?",
    manualOperationArranged: "Operação Manual Organizada?",
    detectionElectricQuestions: "Perguntas sobre Detecção Elétrica",
    circuitrySupervised: "Circuito Supervisionado conforme DS 5-40?",
    controlPanelMakeModel: "Marca/Modelo do Painel de Controle de Liberação Automática",
    solenoidValveMakeModel: "Marca/Modelo da Válvula Solenoide de Liberação",
    testsSection: "Testes",
    hydrostaticTest: "Teste Hidrostático",
    pneumaticTest: "Teste Pneumático",
    testedPressure: "Pressão Testada (psi)",
    durationHours: "Duração (horas)",
    pressureDrop: "Queda de Pressão (psi)",
    waterflowAlarmTest: "Teste de Alarme de Fluxo de Água",
    totalDevicesTested: "Total de Dispositivos Testados",
    devicesOver60Sec: "Dispositivos >60 Segundos",
    dryPipeAutoReleaseTest: "Teste de Tubo Seco / Liberação Automática",
    systemNoName: "Nº/Nome do Sistema",
    waterPressureBelow: "Pressão de Água Abaixo da Válvula",
    systemAirPressure: "Pressão de Ar do Sistema",
    minPressureReq: "Pressão Mín. Req. no Sprinkler",
    reqWaterDelivery: "Tempo Req. de Entrega de Água",
    withoutQOD: "Sem QOD",
    withQOD: "Com QOD",
    autoReleaseTestQuestions: "Perguntas do Teste de Válvula de Liberação Automática",
    valveOperatedManAuto: "Válvula Operada Manual e Automaticamente?",
    allUnitsTested: "Se Detecção Eletrônica, Todas as Unidades Foram Testadas?",
    pressureReducingTest: "Teste de Válvula Redutora de Pressão",
    location: "Localização",
    make: "Marca",
    setting: "Configuração",
    staticInlet: "Estática Entrada",
    staticOutlet: "Estática Saída",
    residualInlet: "Residual Entrada",
    residualOutlet: "Residual Saída",
    flowRate: "Vazão",
    blankTestingGaskets: "Juntas de Teste em Branco",
    numberUsed: "Número Usado",
    numberRemoved: "Número Removido",
    weldedPipeConnections: "Conexões de Tubulação Soldadas",
    weldingProceduresComplied: "Procedimentos de Soldagem Cumpridos?",
    weldersQualified: "Soldadores Qualificados?",
    qcProcedure: "Procedimento de CQ Garantiu Discos/Cupons Recuperados e Limpos?",
    drainTests: "Testes de Drenagem",
    staticPressure: "Pressão Estática",
    residualPressure: "Pressão Residual",
    staticAfterwards: "Estática Depois",
    undergroundMains: "Redes Subterrâneas",
    verifiedOnFM85B: "Verificado no FM 85B?",
    ifNoFormUsed: "Se Não, Qual Formulário Usado?",
    contractorFlushed: "Qual Contratante Fez a Descarga?",
    instructionMaterials: "Materiais de Instrução",
    personInstructed: "Pessoa Responsável Instruída?",
    copiesLeft: "Cópias Deixadas no Local?",
    ifNoExplain: "Se Não, Explique",
    dateSystemInService: "Data do Sistema em Serviço (Todas as Válvulas Abertas)",
    signaturesSection: "Assinaturas",
    propertyOwnerAgent: "Proprietário/Agente Autorizado",
    name: "Nome",
    signature: "Assinatura",
    signatureTitle: "Cargo",
    sprinklerContractor: "Contratante de Sprinklers",
    additionalNotes: "Notas Adicionais",
    generatedBy: "Gerado por FireSafe ITM",
    geolocation: "Geolocalização",
    latitude: "Latitude",
    longitude: "Longitude",
    accuracy: "Precisão",
    meters: "m",
  },
};

const generateFM85APdfHtml = (options: FM85APdfOptions): string => {
  const { certificate, language } = options;
  const t = translations[language];
  const c = certificate;

  const renderTableRows = (items: any[], minRows: number, renderRow: (item: any, idx: number) => string, emptyRow: string): string => {
    let html = items.map((item, idx) => renderRow(item, idx)).join('');
    const remaining = Math.max(0, minRows - items.length);
    for (let i = 0; i < remaining; i++) {
      html += emptyRow;
    }
    return html;
  };

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
          font-size: 10px;
          line-height: 1.4;
          color: #000;
          background: white;
        }
        .page { padding: 20px 30px; max-width: 800px; margin: 0 auto; }
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .header h1 { font-size: 18px; font-weight: bold; margin-bottom: 2px; }
        .header h2 { font-size: 12px; font-weight: normal; margin-bottom: 2px; }
        .header .form-no { font-size: 10px; color: #666; }
        .section { margin-bottom: 15px; page-break-inside: avoid; }
        .section-title {
          background: #1a365d;
          color: white;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .info-row { display: flex; margin-bottom: 4px; }
        .info-label { font-weight: bold; min-width: 180px; }
        .info-value { flex: 1; border-bottom: 1px solid #ccc; min-height: 14px; padding-left: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 9px; }
        th, td { border: 1px solid #000; padding: 3px 5px; text-align: left; }
        th { background: #e5e7eb; font-weight: bold; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .question-row { display: flex; justify-content: space-between; margin-bottom: 4px; padding: 2px 0; border-bottom: 1px dotted #ccc; }
        .question-label { flex: 1; }
        .question-value { min-width: 40px; text-align: center; font-weight: bold; }
        .signature-box { border: 1px solid #000; min-height: 60px; margin-top: 5px; padding: 5px; }
        .signature-img { max-height: 50px; max-width: 100%; }
        .footer { text-align: center; margin-top: 20px; font-size: 9px; color: #666; border-top: 1px solid #ccc; padding-top: 10px; }
        .notes-box { border: 1px solid #ccc; min-height: 60px; padding: 8px; margin-top: 5px; white-space: pre-wrap; }
        .logo-section { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 8px; }
        .logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #DC2626, #991B1B); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; }
        .geo-grid { display: flex; flex-wrap: wrap; gap: 15px; }
        .geo-item { flex: 1; min-width: 120px; }
        .geo-label { font-size: 9px; color: #666; text-transform: uppercase; }
        .geo-value { font-size: 11px; font-weight: 500; color: #000; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="logo-section">
            <div class="logo-icon">F</div>
            <div>
              <h1 style="margin: 0;">${t.title}</h1>
              <h2 style="margin: 0;">${t.subtitle}</h2>
              <div class="form-no">${t.formNo}</div>
            </div>
          </div>
        </div>

        <!-- Contractor Info -->
        <div class="section">
          <div class="section-title">${t.contractorInfo}</div>
          <div class="info-row">
            <span class="info-label">${t.date}:</span>
            <span class="info-value">${sanitizeHtml(c.contractorInfo.date)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">${t.contractorName}:</span>
            <span class="info-value">${sanitizeHtml(c.contractorInfo.contractorCompanyName)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">${t.contractorAddress}:</span>
            <span class="info-value">${sanitizeHtml(c.contractorInfo.contractorCompanyAddress)}</span>
          </div>
        </div>

        <!-- Client Info -->
        <div class="section">
          <div class="section-title">${t.clientInfo}</div>
          <div class="two-col">
            <div>
              <div class="info-row">
                <span class="info-label">${t.fmIndexNo}:</span>
                <span class="info-value">${sanitizeHtml(c.clientInfo.fmGlobalIndexNo)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${t.fmAccountNo}:</span>
                <span class="info-value">${sanitizeHtml(c.clientInfo.fmGlobalAccountNo)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${t.buildingOwnerTenant}:</span>
                <span class="info-value">${formatYesNo(c.clientInfo.isBuildingOwnerOrTenant, language)}</span>
              </div>
            </div>
            <div>
              <div class="info-row">
                <span class="info-label">${t.buildingNameNo}:</span>
                <span class="info-value">${sanitizeHtml(c.clientInfo.buildingNameOrNo)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${t.clientName}:</span>
                <span class="info-value">${sanitizeHtml(c.clientInfo.fmGlobalClientName)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${t.clientAddress}:</span>
                <span class="info-value">${sanitizeHtml(c.clientInfo.fmGlobalClientAddress)}</span>
              </div>
            </div>
          </div>
          <div class="info-row">
            <span class="info-label">${t.occupancy}:</span>
            <span class="info-value">${sanitizeHtml(c.clientInfo.occupancyDescription)}</span>
          </div>
        </div>

        <!-- Sprinklers Table -->
        <div class="section">
          <div class="section-title">${t.sprinklersSection}</div>
          <table>
            <thead>
              <tr>
                <th>${t.manufacturer}</th>
                <th>${t.modelTradeName}</th>
                <th>${t.kFactor}</th>
                <th>${t.tempRating}</th>
                <th>${t.sin}</th>
                <th>${t.yearMfg}</th>
                <th>${t.quantity}</th>
              </tr>
            </thead>
            <tbody>
              ${renderTableRows(c.sprinklers, 3,
                (item) => `<tr>
                  <td>${sanitizeHtml(item.manufacturer)}</td>
                  <td>${sanitizeHtml(item.modelTradeName)}</td>
                  <td>${sanitizeHtml(item.kFactor)}</td>
                  <td>${sanitizeHtml(item.temperatureRating)}</td>
                  <td>${sanitizeHtml(item.sin)}</td>
                  <td>${sanitizeHtml(item.yearOfManufacture)}</td>
                  <td>${sanitizeHtml(item.quantity)}</td>
                </tr>`,
                '<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'
              )}
            </tbody>
          </table>
        </div>

        <!-- Pipe Table -->
        <div class="section">
          <div class="section-title">${t.pipeSection}</div>
          <table>
            <thead>
              <tr>
                <th>${t.manufacturer}</th>
                <th>${t.modelTradeName}</th>
                <th>${t.productDesc}</th>
                <th>${t.schedule}</th>
                <th>${t.connectionType}</th>
                <th>${t.maxWorkPressure}</th>
              </tr>
            </thead>
            <tbody>
              ${renderTableRows(c.pipe, 3,
                (item) => `<tr>
                  <td>${sanitizeHtml(item.manufacturer)}</td>
                  <td>${sanitizeHtml(item.modelTradeName)}</td>
                  <td>${sanitizeHtml(item.productDescription)}</td>
                  <td>${sanitizeHtml(item.schedule)}</td>
                  <td>${sanitizeHtml(item.connectionType)}</td>
                  <td>${sanitizeHtml(item.maxWorkingPressure)}</td>
                </tr>`,
                '<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>'
              )}
            </tbody>
          </table>
        </div>

        <!-- Pipe Connections Table -->
        <div class="section">
          <div class="section-title">${t.pipeConnectionsSection}</div>
          <table>
            <thead>
              <tr>
                <th>${t.manufacturer}</th>
                <th>${t.modelTradeName}</th>
                <th>${t.productDesc}</th>
                <th>${t.pipeEnds}</th>
                <th>${t.maxWorkPressure}</th>
              </tr>
            </thead>
            <tbody>
              ${renderTableRows(c.pipeConnections, 2,
                (item) => `<tr>
                  <td>${sanitizeHtml(item.manufacturer)}</td>
                  <td>${sanitizeHtml(item.modelTradeName)}</td>
                  <td>${sanitizeHtml(item.productDescription)}</td>
                  <td>${sanitizeHtml(item.pipeEnds)}</td>
                  <td>${sanitizeHtml(item.maxWorkingPressure)}</td>
                </tr>`,
                '<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>'
              )}
            </tbody>
          </table>
        </div>

        <!-- Pipe Hangers Table -->
        <div class="section">
          <div class="section-title">${t.pipeHangersSection}</div>
          <table>
            <thead>
              <tr>
                <th>${t.manufacturer}</th>
                <th>${t.modelTradeName}</th>
                <th>${t.productDesc}</th>
                <th>${t.hangerRodSize}</th>
                <th>${t.componentDesc}</th>
                <th>${t.nominalPipeSize}</th>
              </tr>
            </thead>
            <tbody>
              ${renderTableRows(c.pipeHangers, 2,
                (item) => `<tr>
                  <td>${sanitizeHtml(item.manufacturer)}</td>
                  <td>${sanitizeHtml(item.modelTradeName)}</td>
                  <td>${sanitizeHtml(item.productDescription)}</td>
                  <td>${sanitizeHtml(item.hangerRodSize)}</td>
                  <td>${sanitizeHtml(item.componentDescription)}</td>
                  <td>${sanitizeHtml(item.nominalPipeSize)}</td>
                </tr>`,
                '<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>'
              )}
            </tbody>
          </table>
        </div>

        <!-- Alarm/Dry Pipe/Release Valves Table -->
        <div class="section">
          <div class="section-title">${t.alarmValvesSection}</div>
          <table>
            <thead>
              <tr>
                <th>${t.type}</th>
                <th>${t.manufacturer}</th>
                <th>${t.model}</th>
                <th>${t.serialNo}</th>
                <th>${t.quantity}</th>
              </tr>
            </thead>
            <tbody>
              ${renderTableRows(c.alarmCheckDryPipeReleaseValves, 2,
                (item) => `<tr>
                  <td>${sanitizeHtml(item.type)}</td>
                  <td>${sanitizeHtml(item.manufacturer)}</td>
                  <td>${sanitizeHtml(item.model)}</td>
                  <td>${sanitizeHtml(item.serialNumber)}</td>
                  <td>${sanitizeHtml(item.quantity)}</td>
                </tr>`,
                '<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>'
              )}
            </tbody>
          </table>
        </div>

        <!-- Detection/Release Valves Table -->
        <div class="section">
          <div class="section-title">${t.detectionValvesSection}</div>
          <table>
            <thead>
              <tr>
                <th>${t.type}</th>
                <th>${t.manufacturer}</th>
                <th>${t.model}</th>
                <th>${t.protectedArea}</th>
                <th>${t.linearSpacing}</th>
                <th>${t.areaSpacing}</th>
                <th>${t.quantity}</th>
              </tr>
            </thead>
            <tbody>
              ${renderTableRows(c.detectionReleaseValves, 2,
                (item) => `<tr>
                  <td>${sanitizeHtml(item.type)}</td>
                  <td>${sanitizeHtml(item.manufacturer)}</td>
                  <td>${sanitizeHtml(item.model)}</td>
                  <td>${sanitizeHtml(item.protectedArea)}</td>
                  <td>${sanitizeHtml(item.linearSpacing)}</td>
                  <td>${sanitizeHtml(item.areaSpacing)}</td>
                  <td>${sanitizeHtml(item.quantity)}</td>
                </tr>`,
                '<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'
              )}
            </tbody>
          </table>
        </div>

        <!-- Control/Pressure Reducing Valves Table -->
        <div class="section">
          <div class="section-title">${t.controlValvesSection}</div>
          <table>
            <thead>
              <tr>
                <th>${t.type}</th>
                <th>${t.manufacturer}</th>
                <th>${t.model}</th>
                <th>${t.serialNo}</th>
                <th>${t.quantity}</th>
              </tr>
            </thead>
            <tbody>
              ${renderTableRows(c.controlOrPressureReducingValves, 2,
                (item) => `<tr>
                  <td>${sanitizeHtml(item.type)}</td>
                  <td>${sanitizeHtml(item.manufacturer)}</td>
                  <td>${sanitizeHtml(item.model)}</td>
                  <td>${sanitizeHtml(item.serialNumber)}</td>
                  <td>${sanitizeHtml(item.quantity)}</td>
                </tr>`,
                '<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>'
              )}
            </tbody>
          </table>
        </div>

        <!-- Check/Backflow Valves Table -->
        <div class="section">
          <div class="section-title">${t.checkValvesSection}</div>
          <table>
            <thead>
              <tr>
                <th>${t.type}</th>
                <th>${t.manufacturer}</th>
                <th>${t.model}</th>
                <th>${t.serialNo}</th>
                <th>${t.quantity}</th>
              </tr>
            </thead>
            <tbody>
              ${renderTableRows(c.checkOrBackflowValves, 2,
                (item) => `<tr>
                  <td>${sanitizeHtml(item.type)}</td>
                  <td>${sanitizeHtml(item.manufacturer)}</td>
                  <td>${sanitizeHtml(item.model)}</td>
                  <td>${sanitizeHtml(item.serialNumber)}</td>
                  <td>${sanitizeHtml(item.quantity)}</td>
                </tr>`,
                '<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>'
              )}
            </tbody>
          </table>
        </div>

        <!-- Miscellaneous Components Table -->
        <div class="section">
          <div class="section-title">${t.miscComponentsSection}</div>
          <table>
            <thead>
              <tr>
                <th>${t.component}</th>
                <th>${t.manufacturer}</th>
                <th>${t.model}</th>
                <th>${t.quantity}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${t.waterflowAlarm}</td>
                <td>${sanitizeHtml(c.miscComponents.waterflowAlarm.manufacturer)}</td>
                <td>${sanitizeHtml(c.miscComponents.waterflowAlarm.model)}</td>
                <td>${sanitizeHtml(c.miscComponents.waterflowAlarm.quantity)}</td>
              </tr>
              <tr>
                <td>${t.quickOpeningDevice}</td>
                <td>${sanitizeHtml(c.miscComponents.quickOpeningDevice.manufacturer)}</td>
                <td>${sanitizeHtml(c.miscComponents.quickOpeningDevice.model)}</td>
                <td>${sanitizeHtml(c.miscComponents.quickOpeningDevice.quantity)}</td>
              </tr>
              <tr>
                <td>${t.pressureGauge}</td>
                <td>${sanitizeHtml(c.miscComponents.pressureGauge.manufacturer)}</td>
                <td>${sanitizeHtml(c.miscComponents.pressureGauge.model)}</td>
                <td>${sanitizeHtml(c.miscComponents.pressureGauge.quantity)}</td>
              </tr>
              <tr>
                <td>${t.fireDeptConnection}</td>
                <td>${sanitizeHtml(c.miscComponents.fireDepartmentConnection.manufacturer)}</td>
                <td>${sanitizeHtml(c.miscComponents.fireDepartmentConnection.model)}</td>
                <td>${sanitizeHtml(c.miscComponents.fireDepartmentConnection.quantity)}</td>
              </tr>
              <tr>
                <td>${t.reliefValve}</td>
                <td>${sanitizeHtml(c.miscComponents.reliefValve.manufacturer)}</td>
                <td>${sanitizeHtml(c.miscComponents.reliefValve.model)}</td>
                <td>${sanitizeHtml(c.miscComponents.reliefValve.quantity)}</td>
              </tr>
              <tr>
                <td>${t.testConnection}</td>
                <td>${sanitizeHtml(c.miscComponents.testConnection.manufacturer)}</td>
                <td>${sanitizeHtml(c.miscComponents.testConnection.model)}</td>
                <td>${sanitizeHtml(c.miscComponents.testConnection.quantity)}</td>
              </tr>
              <tr>
                <td>${t.drainValve}</td>
                <td>${sanitizeHtml(c.miscComponents.drainValve.manufacturer)}</td>
                <td>${sanitizeHtml(c.miscComponents.drainValve.model)}</td>
                <td>${sanitizeHtml(c.miscComponents.drainValve.quantity)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Other Components Table -->
        ${c.otherComponents.length > 0 ? `
        <div class="section">
          <div class="section-title">${t.otherComponentsSection}</div>
          <table>
            <thead>
              <tr>
                <th>${t.component}</th>
                <th>${t.manufacturer}</th>
                <th>${t.model}</th>
                <th>${t.quantity}</th>
              </tr>
            </thead>
            <tbody>
              ${c.otherComponents.map(item => `<tr>
                <td>${sanitizeHtml(item.component)}</td>
                <td>${sanitizeHtml(item.manufacturer)}</td>
                <td>${sanitizeHtml(item.model)}</td>
                <td>${sanitizeHtml(item.quantity)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <!-- Automatic Release Valve Questions -->
        <div class="section">
          <div class="section-title">${t.autoReleaseQuestions}</div>
          <div class="question-row">
            <span class="question-label">${t.detectionType}:</span>
            <span class="question-value">${sanitizeHtml(c.automaticReleaseValveQuestions.detectionType)}</span>
          </div>
          <div class="question-row">
            <span class="question-label">${t.interlockArrangement}:</span>
            <span class="question-value">${sanitizeHtml(c.automaticReleaseValveQuestions.interlockArrangement)}</span>
          </div>
          <div class="question-row">
            <span class="question-label">${t.airPressureSupervised}:</span>
            <span class="question-value">${formatYesNo(c.automaticReleaseValveQuestions.airPressureSupervised, language)}</span>
          </div>
          <div class="question-row">
            <span class="question-label">${t.manualOperationArranged}:</span>
            <span class="question-value">${formatYesNo(c.automaticReleaseValveQuestions.manualOperationArranged, language)}</span>
          </div>
        </div>

        <!-- Detection Electric Questions -->
        <div class="section">
          <div class="section-title">${t.detectionElectricQuestions}</div>
          <div class="question-row">
            <span class="question-label">${t.circuitrySupervised}:</span>
            <span class="question-value">${formatYesNo(c.detectionElectricQuestions.circuitrySupervisedPerDS540, language)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">${t.controlPanelMakeModel}:</span>
            <span class="info-value">${sanitizeHtml(c.detectionElectricQuestions.automaticReleaseControlPanelMakeModel)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">${t.solenoidValveMakeModel}:</span>
            <span class="info-value">${sanitizeHtml(c.detectionElectricQuestions.solenoidReleaseValveMakeModel)}</span>
          </div>
        </div>

        <!-- Tests Section -->
        <div class="section">
          <div class="section-title">${t.testsSection}</div>
          
          <!-- Hydrostatic & Pneumatic Tests -->
          <div class="two-col" style="margin-bottom: 10px;">
            <div>
              <strong>${t.hydrostaticTest}</strong>
              <table>
                <tr><td>${t.testedPressure}</td><td>${sanitizeHtml(c.tests.hydrostatic.testedPressurePsi)}</td></tr>
                <tr><td>${t.durationHours}</td><td>${sanitizeHtml(c.tests.hydrostatic.durationHours)}</td></tr>
                <tr><td>${t.pressureDrop}</td><td>${sanitizeHtml(c.tests.hydrostatic.pressureDropPsi)}</td></tr>
              </table>
            </div>
            <div>
              <strong>${t.pneumaticTest}</strong>
              <table>
                <tr><td>${t.testedPressure}</td><td>${sanitizeHtml(c.tests.pneumatic.testedPressurePsi)}</td></tr>
                <tr><td>${t.durationHours}</td><td>${sanitizeHtml(c.tests.pneumatic.durationHours)}</td></tr>
                <tr><td>${t.pressureDrop}</td><td>${sanitizeHtml(c.tests.pneumatic.pressureDropPsi)}</td></tr>
              </table>
            </div>
          </div>

          <!-- Waterflow Alarm Test -->
          <strong>${t.waterflowAlarmTest}</strong>
          <div class="two-col" style="margin-bottom: 10px;">
            <div class="info-row">
              <span class="info-label">${t.totalDevicesTested}:</span>
              <span class="info-value">${sanitizeHtml(c.tests.waterflowAlarm.totalDevicesTested)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t.devicesOver60Sec}:</span>
              <span class="info-value">${sanitizeHtml(c.tests.waterflowAlarm.devicesOver60Seconds)}</span>
            </div>
          </div>

          <!-- Dry Pipe/Auto Release Testing -->
          ${c.tests.dryPipeOrAutoReleaseTesting.length > 0 ? `
          <strong>${t.dryPipeAutoReleaseTest}</strong>
          <table>
            <thead>
              <tr>
                <th>${t.systemNoName}</th>
                <th>${t.waterPressureBelow}</th>
                <th>${t.systemAirPressure}</th>
                <th>${t.minPressureReq}</th>
                <th>${t.reqWaterDelivery}</th>
                <th>${t.withoutQOD}</th>
                <th>${t.withQOD}</th>
              </tr>
            </thead>
            <tbody>
              ${c.tests.dryPipeOrAutoReleaseTesting.map(item => `<tr>
                <td>${sanitizeHtml(item.systemNoName)}</td>
                <td>${sanitizeHtml(item.waterPressureBelowValve)}</td>
                <td>${sanitizeHtml(item.systemAirPressure)}</td>
                <td>${sanitizeHtml(item.minPressureReqAtSprinkler)}</td>
                <td>${sanitizeHtml(item.requiredWaterDeliveryTime)}</td>
                <td>${sanitizeHtml(item.withoutQOD)}</td>
                <td>${sanitizeHtml(item.withQOD)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
          ` : ''}

          <!-- Auto Release Valve Test Questions -->
          <div class="question-row">
            <span class="question-label">${t.valveOperatedManAuto}:</span>
            <span class="question-value">${formatYesNo(c.tests.autoReleaseValveTestQuestions.valveOperatedManuallyAndAutomatically, language)}</span>
          </div>
          <div class="question-row">
            <span class="question-label">${t.allUnitsTested}:</span>
            <span class="question-value">${formatYesNo(c.tests.autoReleaseValveTestQuestions.ifDetectionElectronicWereAllUnitsTested, language)}</span>
          </div>

          <!-- Pressure Reducing Valve Testing -->
          ${c.tests.pressureReducingValveTesting.length > 0 ? `
          <strong style="margin-top: 10px; display: block;">${t.pressureReducingTest}</strong>
          <table>
            <thead>
              <tr>
                <th>${t.location}</th>
                <th>${t.make}</th>
                <th>${t.model}</th>
                <th>${t.setting}</th>
                <th>${t.staticInlet}</th>
                <th>${t.staticOutlet}</th>
                <th>${t.residualInlet}</th>
                <th>${t.residualOutlet}</th>
                <th>${t.flowRate}</th>
              </tr>
            </thead>
            <tbody>
              ${c.tests.pressureReducingValveTesting.map(item => `<tr>
                <td>${sanitizeHtml(item.location)}</td>
                <td>${sanitizeHtml(item.make)}</td>
                <td>${sanitizeHtml(item.model)}</td>
                <td>${sanitizeHtml(item.setting)}</td>
                <td>${sanitizeHtml(item.staticPressureInlet)}</td>
                <td>${sanitizeHtml(item.staticPressureOutlet)}</td>
                <td>${sanitizeHtml(item.residualPressureInlet)}</td>
                <td>${sanitizeHtml(item.residualPressureOutlet)}</td>
                <td>${sanitizeHtml(item.flowRate)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
          ` : ''}

          <!-- Blank Testing Gaskets -->
          ${c.tests.blankTestingGaskets.length > 0 ? `
          <strong style="margin-top: 10px; display: block;">${t.blankTestingGaskets}</strong>
          <table>
            <thead>
              <tr>
                <th>${t.numberUsed}</th>
                <th>${t.location}</th>
                <th>${t.numberRemoved}</th>
              </tr>
            </thead>
            <tbody>
              ${c.tests.blankTestingGaskets.map(item => `<tr>
                <td>${sanitizeHtml(item.numberUsed)}</td>
                <td>${sanitizeHtml(item.location)}</td>
                <td>${sanitizeHtml(item.numberRemoved)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
          ` : ''}

          <!-- Welded Pipe Connections -->
          <strong style="margin-top: 10px; display: block;">${t.weldedPipeConnections}</strong>
          <div class="question-row">
            <span class="question-label">${t.weldingProceduresComplied}:</span>
            <span class="question-value">${formatYesNo(c.tests.weldedPipeConnectionsYesNo.weldingProceduresComplied, language)}</span>
          </div>
          <div class="question-row">
            <span class="question-label">${t.weldersQualified}:</span>
            <span class="question-value">${formatYesNo(c.tests.weldedPipeConnectionsYesNo.weldersQualified, language)}</span>
          </div>
          <div class="question-row">
            <span class="question-label">${t.qcProcedure}:</span>
            <span class="question-value">${formatYesNo(c.tests.weldedPipeConnectionsYesNo.qcProcedureEnsuredDiscsCouponsRetrievedAndClean, language)}</span>
          </div>

          <!-- Drain Tests -->
          ${c.tests.drainTests.length > 0 ? `
          <strong style="margin-top: 10px; display: block;">${t.drainTests}</strong>
          <table>
            <thead>
              <tr>
                <th>${t.systemNoName}</th>
                <th>${t.staticPressure}</th>
                <th>${t.residualPressure}</th>
                <th>${t.staticAfterwards}</th>
              </tr>
            </thead>
            <tbody>
              ${c.tests.drainTests.map(item => `<tr>
                <td>${sanitizeHtml(item.systemNameNo)}</td>
                <td>${sanitizeHtml(item.staticPressure)}</td>
                <td>${sanitizeHtml(item.residualPressure)}</td>
                <td>${sanitizeHtml(item.staticPressureAfterwards)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
          ` : ''}

          <!-- Underground Mains -->
          <strong style="margin-top: 10px; display: block;">${t.undergroundMains}</strong>
          <div class="question-row">
            <span class="question-label">${t.verifiedOnFM85B}:</span>
            <span class="question-value">${formatYesNo(c.tests.undergroundMains.verifiedOnFM85B, language)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">${t.ifNoFormUsed}:</span>
            <span class="info-value">${sanitizeHtml(c.tests.undergroundMains.ifNoWhatFormUsed)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">${t.contractorFlushed}:</span>
            <span class="info-value">${sanitizeHtml(c.tests.undergroundMains.whatContractorFlushed)}</span>
          </div>

          <!-- Instruction Materials -->
          <strong style="margin-top: 10px; display: block;">${t.instructionMaterials}</strong>
          <div class="question-row">
            <span class="question-label">${t.personInstructed}:</span>
            <span class="question-value">${formatYesNo(c.tests.instructionMaterialsYesNo.personInChargeInstructed, language)}</span>
          </div>
          <div class="question-row">
            <span class="question-label">${t.copiesLeft}:</span>
            <span class="question-value">${formatYesNo(c.tests.instructionMaterialsYesNo.copiesLeftOnPremises, language)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">${t.ifNoExplain}:</span>
            <span class="info-value">${sanitizeHtml(c.tests.instructionMaterialsYesNo.ifNoExplain)}</span>
          </div>

          <!-- Date System In Service -->
          <div class="info-row" style="margin-top: 10px;">
            <span class="info-label">${t.dateSystemInService}:</span>
            <span class="info-value">${sanitizeHtml(c.tests.dateSystemLeftInServiceAllValvesOpen)}</span>
          </div>
        </div>

        <!-- Signatures Section -->
        <div class="section">
          <div class="section-title">${t.signaturesSection}</div>
          <div class="two-col">
            <div>
              <strong>${t.propertyOwnerAgent}</strong>
              <div class="info-row">
                <span class="info-label">${t.name}:</span>
                <span class="info-value">${sanitizeHtml(c.signatures.propertyOwnerAuthorizedAgentName)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${t.signatureTitle}:</span>
                <span class="info-value">${sanitizeHtml(c.signatures.propertyOwnerSignatureTitle)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${t.date}:</span>
                <span class="info-value">${sanitizeHtml(c.signatures.propertyOwnerDate)}</span>
              </div>
              <div>${t.signature}:</div>
              <div class="signature-box">
                ${c.signatures.propertyOwnerSignature ? `<img class="signature-img" src="${c.signatures.propertyOwnerSignature}" />` : ''}
              </div>
            </div>
            <div>
              <strong>${t.sprinklerContractor}</strong>
              <div class="info-row">
                <span class="info-label">${t.name}:</span>
                <span class="info-value">${sanitizeHtml(c.signatures.sprinklerContractorName)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${t.signatureTitle}:</span>
                <span class="info-value">${sanitizeHtml(c.signatures.sprinklerContractorSignatureTitle)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${t.date}:</span>
                <span class="info-value">${sanitizeHtml(c.signatures.sprinklerContractorDate)}</span>
              </div>
              <div>${t.signature}:</div>
              <div class="signature-box">
                ${c.signatures.sprinklerContractorSignature ? `<img class="signature-img" src="${c.signatures.sprinklerContractorSignature}" />` : ''}
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Notes -->
        ${c.additionalNotes ? `
        <div class="section">
          <div class="section-title">${t.additionalNotes}</div>
          <div class="notes-box">${sanitizeHtml(c.additionalNotes)}</div>
        </div>
        ` : ''}

        ${c.geoLocation && typeof c.geoLocation.latitude === 'number' && typeof c.geoLocation.longitude === 'number' ? `
        <div class="section">
          <div class="section-title">${t.geolocation}</div>
          <div class="geo-grid">
            <div class="geo-item">
              <div class="geo-label">${t.latitude}</div>
              <div class="geo-value">${c.geoLocation.latitude.toFixed(6)}</div>
            </div>
            <div class="geo-item">
              <div class="geo-label">${t.longitude}</div>
              <div class="geo-value">${c.geoLocation.longitude.toFixed(6)}</div>
            </div>
            ${typeof c.geoLocation.accuracy === 'number' ? `
            <div class="geo-item">
              <div class="geo-label">${t.accuracy}</div>
              <div class="geo-value">${c.geoLocation.accuracy.toFixed(1)} ${t.meters}</div>
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}

        <div class="footer">
          <p>${t.generatedBy}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateFM85APdfUri = async (options: FM85APdfOptions): Promise<string> => {
  const html = generateFM85APdfHtml(options);
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
};

export const generateAndPrintFM85APdf = async (options: FM85APdfOptions): Promise<void> => {
  const uri = await generateFM85APdfUri(options);
  await Print.printAsync({ uri });
};

export const generateAndShareFM85APdf = async (options: FM85APdfOptions): Promise<void> => {
  const uri = await generateFM85APdfUri(options);
  
  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "FM Global Certificate FM85A",
      UTI: "com.adobe.pdf",
    });
  } else {
    await Print.printAsync({ uri });
  }
};
