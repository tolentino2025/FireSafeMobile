export type PerformanceTestStatus = "draft" | "in_progress" | "completed";

export type DriverType = "electric" | "diesel" | "steam_turbine";
export type PumpOrientation = "horizontal_split" | "vertical_inline" | "vertical_turbine" | "end_suction";
export type SupplySource = "city_water" | "tank" | "reservoir" | "pond" | "well" | "other";
export type TestMethod = "flow_meter" | "pitot_tube" | "flow_loop" | "bypass" | "other";

export interface ContractorInfo {
  contractorId: string;
  companyName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  fax: string;
  email: string;
  licenseNumber: string;
}

export interface JobInfo {
  jobSiteId: string;
  jobName: string;
  jobNumber: string;
  address: string;
  city: string;
  state: string;
  testDate: string;
  testLocation: string;
  testMethod: TestMethod;
  testMethodOther?: string;
  weatherConditions: string;
  ambientTemperatureF: string;
}

export interface PumpEquipmentInfo {
  pumpTag: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  pumpOrientation: PumpOrientation;
  yearInstalled: string;
  ratedFlowGpm: string;
  ratedPressurePsi: string;
  ratedSpeedRpm: string;
  shutoffPressurePsi: string;
  peakFlowGpm: string;
  impellerDiameterIn: string;
  impellerType: string;
  numberOfStages: string;
  suctionSizeIn: string;
  dischargeSizeIn: string;
  rotationDirection: string;
}

export interface ElectricDriverInfo {
  driverType: "electric";
  manufacturer: string;
  model: string;
  serialNumber: string;
  horsePower: string;
  ratedRpm: string;
  ratedVoltage: string;
  phases: string;
  hertz: string;
  fullLoadAmperage: string;
  lockedRotorAmperage: string;
  serviceFactor: string;
  enclosureType: string;
  insulationClass: string;
  frameSize: string;
}

export interface DieselDriverInfo {
  driverType: "diesel";
  manufacturer: string;
  model: string;
  serialNumber: string;
  horsePower: string;
  ratedRpm: string;
  numberOfCylinders: string;
  displacement: string;
  fuelTankCapacityGal: string;
  fuelLevel: string;
  oilLevel: string;
  coolantLevel: string;
  batteryVoltage1: string;
  batteryVoltage2: string;
  engineBlockHeaterStatus: string;
  lastOilChangeDate: string;
  lastCoolantChangeDate: string;
}

export type DriverInfo = ElectricDriverInfo | DieselDriverInfo;

export interface ControllerInfo {
  manufacturer: string;
  model: string;
  serialNumber: string;
  panelTag: string;
  supplyVoltage: string;
  startingType: string;
  transferSwitchType: string;
  hasAutomaticTransfer: boolean;
  pressureSettingStart: string;
  pressureSettingStop: string;
  hasLowSuctionCutoff: boolean;
  lowSuctionCutoffPsi: string;
  hasPhaseReversal: boolean;
  hasPhaseLoss: boolean;
  hasOvercurrent: boolean;
}

export interface PowerSupplyInfo {
  normalSourceDescription: string;
  normalSourceVoltageL1L2: string;
  normalSourceVoltageL2L3: string;
  normalSourceVoltageL3L1: string;
  emergencySourceDescription: string;
  emergencySourceAvailable: boolean;
  emergencySourceVoltageL1L2: string;
  emergencySourceVoltageL2L3: string;
  emergencySourceVoltageL3L1: string;
  transferTimeSeconds: string;
}

export interface SupplyConditions {
  supplySource: SupplySource;
  supplySourceOther?: string;
  staticPressurePsi: string;
  residualPressurePsi: string;
  suctionReservoirLevel: string;
  waterTemperatureF: string;
  hasSuctionScreen: boolean;
  suctionScreenCondition: string;
}

export interface SystemDemand {
  systemDemandGpm: string;
  systemDemandPsi: string;
  hoseDemandGpm: string;
  totalDemandGpm: string;
  totalDemandPsi: string;
}

export interface TestReading {
  id: string;
  flowPercent: string;
  flowGpm: string;
  suctionPsi: string;
  dischargePsi: string;
  netPressurePsi: string;
  rpm: string;
  voltageL1L2?: string;
  voltageL2L3?: string;
  voltageL3L1?: string;
  amperageL1?: string;
  amperageL2?: string;
  amperageL3?: string;
  powerKw?: string;
  engineOilPsi?: string;
  engineTempF?: string;
  observations: string;
}

export interface DieselTestReading {
  id: string;
  flowPercent: string;
  flowGpm: string;
  suctionPsi: string;
  dischargePsi: string;
  netPressurePsi: string;
  rpm: string;
  oilPressurePsi: string;
  exhaustBackPressureInHg: string;
  dieselWaterTempF: string;
  coolingLoopPressurePsi: string;
  observations: string;
}

export interface DieselBatteryInfo {
  startingBatteriesType: string;
  battery1Voltage: string;
  battery2Voltage: string;
  chargerType: string;
  chargerVoltage: string;
  alternatePowerSource: string;
}

export interface DieselVerificationItem {
  id: string;
  labelKey: string;
  value: "yes" | "no" | "na" | null;
  notes: string;
}

export interface MultiplePumpOperation {
  isMultiplePumpSystem: boolean;
  numberOfPumps: string;
  pumpOperationSequence: string;
  allPumpsTestedIndividually: boolean;
  combinedFlowTest: boolean;
  notes: string;
}

export interface TransferSwitchTest {
  hasTransferSwitch: boolean;
  transferSwitchType: string;
  normalToEmergencySeconds: string;
  emergencyToNormalSeconds: string;
  testDate: string;
  testResult: "pass" | "fail" | "na";
  notes: string;
}

export interface DieselPerformanceTest {
  id: string;
  status: PerformanceTestStatus;
  testNumber: string;
  createdAt: string;
  updatedAt: string;
  contractorInfo: ContractorInfo;
  jobInfo: JobInfo;
  pumpEquipment: PumpEquipmentInfo;
  driverInfo: DieselDriverInfo;
  controllerInfo: ControllerInfo;
  batteryInfo: DieselBatteryInfo;
  supplyConditions: SupplyConditions;
  systemDemand: SystemDemand;
  dieselReadings: DieselTestReading[];
  verificationItems: DieselVerificationItem[];
  multiplePumpOperation: MultiplePumpOperation;
  transferSwitchTest: TransferSwitchTest;
  resultsSummary: ResultsSummary;
  observationsDeficiencies: ObservationsDeficiencies;
  signatures: TestSignatures;
  attachments: TestAttachments;
}

export function createEmptyDieselTestReading(id: string, flowPercent: string): DieselTestReading {
  return {
    id,
    flowPercent,
    flowGpm: "",
    suctionPsi: "",
    dischargePsi: "",
    netPressurePsi: "",
    rpm: "",
    oilPressurePsi: "",
    exhaustBackPressureInHg: "",
    dieselWaterTempF: "",
    coolingLoopPressurePsi: "",
    observations: "",
  };
}

export function createEmptyDieselPerformanceTest(): Partial<DieselPerformanceTest> {
  const now = new Date().toISOString();
  return {
    id: Date.now().toString(),
    status: "draft",
    testNumber: "",
    createdAt: now,
    updatedAt: now,
    contractorInfo: {
      contractorId: "",
      companyName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      fax: "",
      email: "",
      licenseNumber: "",
    },
    jobInfo: {
      jobSiteId: "",
      jobName: "",
      jobNumber: "",
      address: "",
      city: "",
      state: "",
      testDate: now.split("T")[0],
      testLocation: "",
      testMethod: "flow_meter",
      weatherConditions: "",
      ambientTemperatureF: "",
    },
    pumpEquipment: {
      pumpTag: "",
      manufacturer: "",
      model: "",
      serialNumber: "",
      pumpOrientation: "horizontal_split",
      yearInstalled: "",
      ratedFlowGpm: "",
      ratedPressurePsi: "",
      ratedSpeedRpm: "",
      shutoffPressurePsi: "",
      peakFlowGpm: "",
      impellerDiameterIn: "",
      impellerType: "",
      numberOfStages: "",
      suctionSizeIn: "",
      dischargeSizeIn: "",
      rotationDirection: "",
    },
    driverInfo: {
      driverType: "diesel",
      manufacturer: "",
      model: "",
      serialNumber: "",
      horsePower: "",
      ratedRpm: "",
      numberOfCylinders: "",
      displacement: "",
      fuelTankCapacityGal: "",
      fuelLevel: "",
      oilLevel: "",
      coolantLevel: "",
      batteryVoltage1: "",
      batteryVoltage2: "",
      engineBlockHeaterStatus: "",
      lastOilChangeDate: "",
      lastCoolantChangeDate: "",
    },
    controllerInfo: {
      manufacturer: "",
      model: "",
      serialNumber: "",
      panelTag: "",
      supplyVoltage: "",
      startingType: "",
      transferSwitchType: "",
      hasAutomaticTransfer: false,
      pressureSettingStart: "",
      pressureSettingStop: "",
      hasLowSuctionCutoff: false,
      lowSuctionCutoffPsi: "",
      hasPhaseReversal: false,
      hasPhaseLoss: false,
      hasOvercurrent: false,
    },
    batteryInfo: {
      startingBatteriesType: "",
      battery1Voltage: "",
      battery2Voltage: "",
      chargerType: "",
      chargerVoltage: "",
      alternatePowerSource: "",
    },
    supplyConditions: {
      supplySource: "city_water",
      staticPressurePsi: "",
      residualPressurePsi: "",
      suctionReservoirLevel: "",
      waterTemperatureF: "",
      hasSuctionScreen: false,
      suctionScreenCondition: "",
    },
    systemDemand: {
      systemDemandGpm: "",
      systemDemandPsi: "",
      hoseDemandGpm: "",
      totalDemandGpm: "",
      totalDemandPsi: "",
    },
    dieselReadings: [
      createEmptyDieselTestReading("1", "0"),
      createEmptyDieselTestReading("2", "25"),
      createEmptyDieselTestReading("3", "50"),
      createEmptyDieselTestReading("4", "75"),
      createEmptyDieselTestReading("5", "100"),
      createEmptyDieselTestReading("6", "125"),
      createEmptyDieselTestReading("7", "150"),
      createEmptyDieselTestReading("8", "0"),
      createEmptyDieselTestReading("9", "100"),
      createEmptyDieselTestReading("10", "150"),
    ],
    verificationItems: [],
    multiplePumpOperation: {
      isMultiplePumpSystem: false,
      numberOfPumps: "",
      pumpOperationSequence: "",
      allPumpsTestedIndividually: false,
      combinedFlowTest: false,
      notes: "",
    },
    transferSwitchTest: {
      hasTransferSwitch: false,
      transferSwitchType: "",
      normalToEmergencySeconds: "",
      emergencyToNormalSeconds: "",
      testDate: "",
      testResult: "na",
      notes: "",
    },
    resultsSummary: {
      shutoffPressureActual: "",
      shutoffPressureRated: "",
      shutoffPressurePercent: "",
      shutoffPressurePass: false,
      ratedFlowPressureActual: "",
      ratedFlowPressureRated: "",
      ratedFlowPressurePercent: "",
      ratedFlowPass: false,
      peakFlowPressureActual: "",
      peakFlowPressureMin: "",
      peakFlowPressurePercent: "",
      peakFlowPass: false,
      overallResult: "fail",
      netPressureAtChurn: "",
      netPressureAtRated: "",
      netPressureAtPeak: "",
      speedAtChurn: "",
      speedAtRated: "",
      speedAtPeak: "",
    },
    observationsDeficiencies: {
      generalObservations: "",
      deficiencies: [],
      recommendedMaintenanceActions: "",
      nextTestDueDate: "",
    },
    signatures: {
      conductedBy: {
        name: "",
        title: "",
        company: "",
        date: "",
        signatureData: null,
      },
    },
    attachments: {
      photos: [],
      pumpCurveAttached: false,
      previousTestReportAttached: false,
      additionalNotes: "",
    },
  };
}

export interface TestConditions {
  suctionGaugePsi: string;
  dischargeGaugePsi: string;
  flowMeterType: string;
  flowMeterSize: string;
  flowMeterCalibrationDate: string;
  readings: TestReading[];
  noFlowReading: TestReading;
  ratedFlowReading: TestReading;
  peakFlowReading: TestReading;
}

export interface ResultsSummary {
  shutoffPressureActual: string;
  shutoffPressureRated: string;
  shutoffPressurePercent: string;
  shutoffPressurePass: boolean;
  ratedFlowPressureActual: string;
  ratedFlowPressureRated: string;
  ratedFlowPressurePercent: string;
  ratedFlowPass: boolean;
  peakFlowPressureActual: string;
  peakFlowPressureMin: string;
  peakFlowPressurePercent: string;
  peakFlowPass: boolean;
  overallResult: "pass" | "fail" | "conditional";
  netPressureAtChurn: string;
  netPressureAtRated: string;
  netPressureAtPeak: string;
  speedAtChurn: string;
  speedAtRated: string;
  speedAtPeak: string;
}

export interface Deficiency {
  id: string;
  description: string;
  severity: "minor" | "major" | "critical";
  recommendedAction: string;
  targetCompletionDate: string;
  resolved: boolean;
  resolvedDate?: string;
}

export interface ObservationsDeficiencies {
  generalObservations: string;
  deficiencies: Deficiency[];
  recommendedMaintenanceActions: string;
  nextTestDueDate: string;
}

export interface TestSignature {
  name: string;
  title: string;
  company: string;
  date: string;
  signatureData: string | null;
}

export interface TestSignatures {
  conductedBy: TestSignature;
  witnessedBy?: TestSignature;
  ownerRepresentative?: TestSignature;
}

export interface TestPhoto {
  id: string;
  uri: string;
  base64?: string;
  caption: string;
  category: "pump" | "controller" | "driver" | "gauges" | "readings" | "deficiency" | "general";
  timestamp: string;
}

export interface TestAttachments {
  photos: TestPhoto[];
  pumpCurveAttached: boolean;
  previousTestReportAttached: boolean;
  additionalNotes: string;
}

export interface PerformanceTest {
  id: string;
  status: PerformanceTestStatus;
  testNumber: string;
  createdAt: string;
  updatedAt: string;
  contractorInfo: ContractorInfo;
  jobInfo: JobInfo;
  pumpEquipment: PumpEquipmentInfo;
  driverInfo: DriverInfo;
  controllerInfo: ControllerInfo;
  powerSupply: PowerSupplyInfo;
  supplyConditions: SupplyConditions;
  systemDemand: SystemDemand;
  testConditions: TestConditions;
  resultsSummary: ResultsSummary;
  observationsDeficiencies: ObservationsDeficiencies;
  signatures: TestSignatures;
  attachments: TestAttachments;
}

export function createEmptyTestReading(id: string, flowPercent: string): TestReading {
  return {
    id,
    flowPercent,
    flowGpm: "",
    suctionPsi: "",
    dischargePsi: "",
    netPressurePsi: "",
    rpm: "",
    observations: "",
  };
}

export function createEmptyPerformanceTest(): Partial<PerformanceTest> {
  const now = new Date().toISOString();
  return {
    id: Date.now().toString(),
    status: "draft",
    testNumber: "",
    createdAt: now,
    updatedAt: now,
    contractorInfo: {
      contractorId: "",
      companyName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      fax: "",
      email: "",
      licenseNumber: "",
    },
    jobInfo: {
      jobSiteId: "",
      jobName: "",
      jobNumber: "",
      address: "",
      city: "",
      state: "",
      testDate: now.split("T")[0],
      testLocation: "",
      testMethod: "flow_meter",
      weatherConditions: "",
      ambientTemperatureF: "",
    },
    pumpEquipment: {
      pumpTag: "",
      manufacturer: "",
      model: "",
      serialNumber: "",
      pumpOrientation: "horizontal_split",
      yearInstalled: "",
      ratedFlowGpm: "",
      ratedPressurePsi: "",
      ratedSpeedRpm: "",
      shutoffPressurePsi: "",
      peakFlowGpm: "",
      impellerDiameterIn: "",
      impellerType: "",
      numberOfStages: "",
      suctionSizeIn: "",
      dischargeSizeIn: "",
      rotationDirection: "",
    },
    driverInfo: {
      driverType: "electric",
      manufacturer: "",
      model: "",
      serialNumber: "",
      horsePower: "",
      ratedRpm: "",
      ratedVoltage: "",
      phases: "",
      hertz: "",
      fullLoadAmperage: "",
      lockedRotorAmperage: "",
      serviceFactor: "",
      enclosureType: "",
      insulationClass: "",
      frameSize: "",
    },
    controllerInfo: {
      manufacturer: "",
      model: "",
      serialNumber: "",
      panelTag: "",
      supplyVoltage: "",
      startingType: "",
      transferSwitchType: "",
      hasAutomaticTransfer: false,
      pressureSettingStart: "",
      pressureSettingStop: "",
      hasLowSuctionCutoff: false,
      lowSuctionCutoffPsi: "",
      hasPhaseReversal: false,
      hasPhaseLoss: false,
      hasOvercurrent: false,
    },
    powerSupply: {
      normalSourceDescription: "",
      normalSourceVoltageL1L2: "",
      normalSourceVoltageL2L3: "",
      normalSourceVoltageL3L1: "",
      emergencySourceDescription: "",
      emergencySourceAvailable: false,
      emergencySourceVoltageL1L2: "",
      emergencySourceVoltageL2L3: "",
      emergencySourceVoltageL3L1: "",
      transferTimeSeconds: "",
    },
    supplyConditions: {
      supplySource: "city_water",
      staticPressurePsi: "",
      residualPressurePsi: "",
      suctionReservoirLevel: "",
      waterTemperatureF: "",
      hasSuctionScreen: false,
      suctionScreenCondition: "",
    },
    systemDemand: {
      systemDemandGpm: "",
      systemDemandPsi: "",
      hoseDemandGpm: "",
      totalDemandGpm: "",
      totalDemandPsi: "",
    },
    testConditions: {
      suctionGaugePsi: "",
      dischargeGaugePsi: "",
      flowMeterType: "",
      flowMeterSize: "",
      flowMeterCalibrationDate: "",
      readings: [
        createEmptyTestReading("1", "0"),
        createEmptyTestReading("2", "50"),
        createEmptyTestReading("3", "75"),
        createEmptyTestReading("4", "100"),
        createEmptyTestReading("5", "150"),
      ],
      noFlowReading: createEmptyTestReading("churn", "0"),
      ratedFlowReading: createEmptyTestReading("rated", "100"),
      peakFlowReading: createEmptyTestReading("peak", "150"),
    },
    resultsSummary: {
      shutoffPressureActual: "",
      shutoffPressureRated: "",
      shutoffPressurePercent: "",
      shutoffPressurePass: false,
      ratedFlowPressureActual: "",
      ratedFlowPressureRated: "",
      ratedFlowPressurePercent: "",
      ratedFlowPass: false,
      peakFlowPressureActual: "",
      peakFlowPressureMin: "",
      peakFlowPressurePercent: "",
      peakFlowPass: false,
      overallResult: "fail",
      netPressureAtChurn: "",
      netPressureAtRated: "",
      netPressureAtPeak: "",
      speedAtChurn: "",
      speedAtRated: "",
      speedAtPeak: "",
    },
    observationsDeficiencies: {
      generalObservations: "",
      deficiencies: [],
      recommendedMaintenanceActions: "",
      nextTestDueDate: "",
    },
    signatures: {
      conductedBy: {
        name: "",
        title: "",
        company: "",
        date: "",
        signatureData: null,
      },
    },
    attachments: {
      photos: [],
      pumpCurveAttached: false,
      previousTestReportAttached: false,
      additionalNotes: "",
    },
  };
}

export function calculateNetPressure(dischargePsi: string, suctionPsi: string): string {
  const discharge = parseFloat(dischargePsi);
  const suction = parseFloat(suctionPsi);
  if (isNaN(discharge) || isNaN(suction)) return "";
  return (discharge - suction).toFixed(1);
}

export function calculatePercentOfRated(actual: string, rated: string): string {
  const actualNum = parseFloat(actual);
  const ratedNum = parseFloat(rated);
  if (isNaN(actualNum) || isNaN(ratedNum) || ratedNum === 0) return "";
  return ((actualNum / ratedNum) * 100).toFixed(1);
}

export function evaluateShutoffTest(actualPsi: string, ratedPsi: string): boolean {
  const actual = parseFloat(actualPsi);
  const rated = parseFloat(ratedPsi);
  if (isNaN(actual) || isNaN(rated)) return false;
  const percent = (actual / rated) * 100;
  return percent >= 100 && percent <= 140;
}

export function evaluateRatedFlowTest(actualPsi: string, ratedPsi: string): boolean {
  const actual = parseFloat(actualPsi);
  const rated = parseFloat(ratedPsi);
  if (isNaN(actual) || isNaN(rated)) return false;
  const percent = (actual / rated) * 100;
  return percent >= 95;
}

export function evaluatePeakFlowTest(actualPsi: string, minPsi: string): boolean {
  const actual = parseFloat(actualPsi);
  const min = parseFloat(minPsi);
  if (isNaN(actual) || isNaN(min)) return false;
  return actual >= min * 0.65;
}
