import { GeoLocation } from "./inspection";

export interface FM85AContractorInfo {
  date: string;
  contractorCompanyName: string;
  contractorCompanyAddress: string;
}

export interface FM85AClientInfo {
  fmGlobalIndexNo: string;
  fmGlobalAccountNo: string;
  isBuildingOwnerOrTenant: 'Y' | 'N' | '';
  buildingNameOrNo: string;
  fmGlobalClientName: string;
  fmGlobalClientAddress: string;
  occupancyDescription: string;
}

export interface FM85ASprinkler {
  manufacturer: string;
  modelTradeName: string;
  kFactor: string;
  temperatureRating: string;
  sin: string;
  yearOfManufacture: string;
  quantity: string;
}

export interface FM85APipe {
  manufacturer: string;
  modelTradeName: string;
  productDescription: string;
  schedule: string;
  connectionType: string;
  maxWorkingPressure: string;
}

export interface FM85APipeConnection {
  manufacturer: string;
  modelTradeName: string;
  productDescription: string;
  pipeEnds: string;
  maxWorkingPressure: string;
}

export interface FM85APipeHanger {
  manufacturer: string;
  modelTradeName: string;
  productDescription: string;
  hangerRodSize: string;
  componentDescription: string;
  nominalPipeSize: string;
}

export interface FM85AAlarmCheckDryPipeReleaseValve {
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  quantity: string;
}

export interface FM85ADetectionReleaseValve {
  type: string;
  manufacturer: string;
  model: string;
  protectedArea: string;
  linearSpacing: string;
  areaSpacing: string;
  quantity: string;
}

export interface FM85AControlOrPressureReducingValve {
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  quantity: string;
}

export interface FM85ACheckOrBackflowValve {
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  quantity: string;
}

export interface FM85AMiscComponentItem {
  manufacturer: string;
  model: string;
  quantity: string;
}

export interface FM85AMiscComponents {
  waterflowAlarm: FM85AMiscComponentItem;
  quickOpeningDevice: FM85AMiscComponentItem;
  pressureGauge: FM85AMiscComponentItem;
  fireDepartmentConnection: FM85AMiscComponentItem;
  reliefValve: FM85AMiscComponentItem;
  testConnection: FM85AMiscComponentItem;
  drainValve: FM85AMiscComponentItem;
}

export interface FM85AOtherComponent {
  component: string;
  manufacturer: string;
  model: string;
  quantity: string;
}

export interface FM85AAutomaticReleaseValveQuestions {
  detectionType: 'electronic' | 'hydraulic' | 'pneumatic' | '';
  interlockArrangement: 'single' | 'double' | 'non-interlock' | '';
  airPressureSupervised: 'Y' | 'N' | '';
  manualOperationArranged: 'Y' | 'N' | '';
}

export interface FM85ADetectionElectricQuestions {
  circuitrySupervisedPerDS540: 'Y' | 'N' | '';
  automaticReleaseControlPanelMakeModel: string;
  solenoidReleaseValveMakeModel: string;
}

export interface FM85AHydrostaticTest {
  testedPressurePsi: string;
  durationHours: string;
  pressureDropPsi: string;
}

export interface FM85APneumaticTest {
  testedPressurePsi: string;
  durationHours: string;
  pressureDropPsi: string;
}

export interface FM85AWaterflowAlarmTest {
  totalDevicesTested: string;
  devicesOver60Seconds: string;
}

export interface FM85ADryPipeOrAutoReleaseTesting {
  systemNoName: string;
  waterPressureBelowValve: string;
  systemAirPressure: string;
  minPressureReqAtSprinkler: string;
  requiredWaterDeliveryTime: string;
  withoutQOD: string;
  withQOD: string;
}

export interface FM85AAutoReleaseValveTestQuestions {
  valveOperatedManuallyAndAutomatically: 'Y' | 'N' | '';
  ifDetectionElectronicWereAllUnitsTested: 'Y' | 'N' | '';
}

export interface FM85APressureReducingValveTesting {
  location: string;
  make: string;
  model: string;
  setting: string;
  staticPressureInlet: string;
  staticPressureOutlet: string;
  residualPressureInlet: string;
  residualPressureOutlet: string;
  flowRate: string;
}

export interface FM85ABlankTestingGasket {
  numberUsed: string;
  location: string;
  numberRemoved: string;
}

export interface FM85AWeldedPipeConnectionsYesNo {
  weldingProceduresComplied: 'Y' | 'N' | '';
  weldersQualified: 'Y' | 'N' | '';
  qcProcedureEnsuredDiscsCouponsRetrievedAndClean: 'Y' | 'N' | '';
}

export interface FM85ADrainTest {
  systemNameNo: string;
  staticPressure: string;
  residualPressure: string;
  staticPressureAfterwards: string;
}

export interface FM85AUndergroundMains {
  verifiedOnFM85B: 'Y' | 'N' | '';
  ifNoWhatFormUsed: string;
  whatContractorFlushed: string;
}

export interface FM85AInstructionMaterialsYesNo {
  personInChargeInstructed: 'Y' | 'N' | '';
  copiesLeftOnPremises: 'Y' | 'N' | '';
  ifNoExplain: string;
}

export interface FM85ATests {
  hydrostatic: FM85AHydrostaticTest;
  pneumatic: FM85APneumaticTest;
  waterflowAlarm: FM85AWaterflowAlarmTest;
  dryPipeOrAutoReleaseTesting: FM85ADryPipeOrAutoReleaseTesting[];
  autoReleaseValveTestQuestions: FM85AAutoReleaseValveTestQuestions;
  pressureReducingValveTesting: FM85APressureReducingValveTesting[];
  blankTestingGaskets: FM85ABlankTestingGasket[];
  weldedPipeConnectionsYesNo: FM85AWeldedPipeConnectionsYesNo;
  drainTests: FM85ADrainTest[];
  undergroundMains: FM85AUndergroundMains;
  instructionMaterialsYesNo: FM85AInstructionMaterialsYesNo;
  dateSystemLeftInServiceAllValvesOpen: string;
}

export interface FM85ASignatures {
  propertyOwnerAuthorizedAgentName: string;
  propertyOwnerSignature: string;
  propertyOwnerSignatureTitle: string;
  propertyOwnerDate: string;
  sprinklerContractorName: string;
  sprinklerContractorSignature: string;
  sprinklerContractorSignatureTitle: string;
  sprinklerContractorDate: string;
}

export interface FM85ACertificate {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'in_progress' | 'completed';
  
  contractorInfo: FM85AContractorInfo;
  clientInfo: FM85AClientInfo;
  
  sprinklers: FM85ASprinkler[];
  pipe: FM85APipe[];
  pipeConnections: FM85APipeConnection[];
  pipeHangers: FM85APipeHanger[];
  alarmCheckDryPipeReleaseValves: FM85AAlarmCheckDryPipeReleaseValve[];
  detectionReleaseValves: FM85ADetectionReleaseValve[];
  controlOrPressureReducingValves: FM85AControlOrPressureReducingValve[];
  checkOrBackflowValves: FM85ACheckOrBackflowValve[];
  miscComponents: FM85AMiscComponents;
  otherComponents: FM85AOtherComponent[];
  
  automaticReleaseValveQuestions: FM85AAutomaticReleaseValveQuestions;
  detectionElectricQuestions: FM85ADetectionElectricQuestions;
  
  tests: FM85ATests;
  
  signatures: FM85ASignatures;
  
  additionalNotes: string;
  
  geoLocation?: GeoLocation;
}

export const createEmptyFM85ACertificate = (): FM85ACertificate => ({
  id: '',
  createdAt: '',
  updatedAt: '',
  status: 'draft',
  
  contractorInfo: {
    date: '',
    contractorCompanyName: '',
    contractorCompanyAddress: '',
  },
  
  clientInfo: {
    fmGlobalIndexNo: '',
    fmGlobalAccountNo: '',
    isBuildingOwnerOrTenant: '',
    buildingNameOrNo: '',
    fmGlobalClientName: '',
    fmGlobalClientAddress: '',
    occupancyDescription: '',
  },
  
  sprinklers: [],
  pipe: [],
  pipeConnections: [],
  pipeHangers: [],
  alarmCheckDryPipeReleaseValves: [],
  detectionReleaseValves: [],
  controlOrPressureReducingValves: [],
  checkOrBackflowValves: [],
  
  miscComponents: {
    waterflowAlarm: { manufacturer: '', model: '', quantity: '' },
    quickOpeningDevice: { manufacturer: '', model: '', quantity: '' },
    pressureGauge: { manufacturer: '', model: '', quantity: '' },
    fireDepartmentConnection: { manufacturer: '', model: '', quantity: '' },
    reliefValve: { manufacturer: '', model: '', quantity: '' },
    testConnection: { manufacturer: '', model: '', quantity: '' },
    drainValve: { manufacturer: '', model: '', quantity: '' },
  },
  
  otherComponents: [],
  
  automaticReleaseValveQuestions: {
    detectionType: '',
    interlockArrangement: '',
    airPressureSupervised: '',
    manualOperationArranged: '',
  },
  
  detectionElectricQuestions: {
    circuitrySupervisedPerDS540: '',
    automaticReleaseControlPanelMakeModel: '',
    solenoidReleaseValveMakeModel: '',
  },
  
  tests: {
    hydrostatic: { testedPressurePsi: '', durationHours: '', pressureDropPsi: '' },
    pneumatic: { testedPressurePsi: '', durationHours: '', pressureDropPsi: '' },
    waterflowAlarm: { totalDevicesTested: '', devicesOver60Seconds: '' },
    dryPipeOrAutoReleaseTesting: [],
    autoReleaseValveTestQuestions: {
      valveOperatedManuallyAndAutomatically: '',
      ifDetectionElectronicWereAllUnitsTested: '',
    },
    pressureReducingValveTesting: [],
    blankTestingGaskets: [],
    weldedPipeConnectionsYesNo: {
      weldingProceduresComplied: '',
      weldersQualified: '',
      qcProcedureEnsuredDiscsCouponsRetrievedAndClean: '',
    },
    drainTests: [],
    undergroundMains: {
      verifiedOnFM85B: '',
      ifNoWhatFormUsed: '',
      whatContractorFlushed: '',
    },
    instructionMaterialsYesNo: {
      personInChargeInstructed: '',
      copiesLeftOnPremises: '',
      ifNoExplain: '',
    },
    dateSystemLeftInServiceAllValvesOpen: '',
  },
  
  signatures: {
    propertyOwnerAuthorizedAgentName: '',
    propertyOwnerSignature: '',
    propertyOwnerSignatureTitle: '',
    propertyOwnerDate: '',
    sprinklerContractorName: '',
    sprinklerContractorSignature: '',
    sprinklerContractorSignatureTitle: '',
    sprinklerContractorDate: '',
  },
  
  additionalNotes: '',
  
  geoLocation: undefined,
});

export const createEmptySprinkler = (): FM85ASprinkler => ({
  manufacturer: '',
  modelTradeName: '',
  kFactor: '',
  temperatureRating: '',
  sin: '',
  yearOfManufacture: '',
  quantity: '',
});

export const createEmptyPipe = (): FM85APipe => ({
  manufacturer: '',
  modelTradeName: '',
  productDescription: '',
  schedule: '',
  connectionType: '',
  maxWorkingPressure: '',
});

export const createEmptyPipeConnection = (): FM85APipeConnection => ({
  manufacturer: '',
  modelTradeName: '',
  productDescription: '',
  pipeEnds: '',
  maxWorkingPressure: '',
});

export const createEmptyPipeHanger = (): FM85APipeHanger => ({
  manufacturer: '',
  modelTradeName: '',
  productDescription: '',
  hangerRodSize: '',
  componentDescription: '',
  nominalPipeSize: '',
});

export const createEmptyAlarmCheckDryPipeReleaseValve = (): FM85AAlarmCheckDryPipeReleaseValve => ({
  type: '',
  manufacturer: '',
  model: '',
  serialNumber: '',
  quantity: '',
});

export const createEmptyDetectionReleaseValve = (): FM85ADetectionReleaseValve => ({
  type: '',
  manufacturer: '',
  model: '',
  protectedArea: '',
  linearSpacing: '',
  areaSpacing: '',
  quantity: '',
});

export const createEmptyControlOrPressureReducingValve = (): FM85AControlOrPressureReducingValve => ({
  type: '',
  manufacturer: '',
  model: '',
  serialNumber: '',
  quantity: '',
});

export const createEmptyCheckOrBackflowValve = (): FM85ACheckOrBackflowValve => ({
  type: '',
  manufacturer: '',
  model: '',
  serialNumber: '',
  quantity: '',
});

export const createEmptyOtherComponent = (): FM85AOtherComponent => ({
  component: '',
  manufacturer: '',
  model: '',
  quantity: '',
});

export const createEmptyDryPipeOrAutoReleaseTesting = (): FM85ADryPipeOrAutoReleaseTesting => ({
  systemNoName: '',
  waterPressureBelowValve: '',
  systemAirPressure: '',
  minPressureReqAtSprinkler: '',
  requiredWaterDeliveryTime: '',
  withoutQOD: '',
  withQOD: '',
});

export const createEmptyPressureReducingValveTesting = (): FM85APressureReducingValveTesting => ({
  location: '',
  make: '',
  model: '',
  setting: '',
  staticPressureInlet: '',
  staticPressureOutlet: '',
  residualPressureInlet: '',
  residualPressureOutlet: '',
  flowRate: '',
});

export const createEmptyBlankTestingGasket = (): FM85ABlankTestingGasket => ({
  numberUsed: '',
  location: '',
  numberRemoved: '',
});

export const createEmptyDrainTest = (): FM85ADrainTest => ({
  systemNameNo: '',
  staticPressure: '',
  residualPressure: '',
  staticPressureAfterwards: '',
});
