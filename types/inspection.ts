export type InspectionStatus = "draft" | "pending" | "in_progress" | "completed";
export type InspectionFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "semiannually" | "annually" | "three_years" | "five_years";

export type PumpType = "electric_main" | "diesel_main" | "jockey";

export type PumpOrientation = "horizontal_split_case" | "vertical_inline" | "vertical_turbine" | "end_suction";
export type EnclosureType = "tefc" | "odp" | "xp" | "wpii";
export type InsulationClass = "a" | "b" | "f" | "h";
export type GovernorType = "mechanical" | "electronic" | "isochronous";
export type FuelType = "diesel" | "lpg" | "natural_gas";

export interface FirePump {
  id: string;
  companyId: string;
  propertyId?: string;
  tag: string;
  type: PumpType;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  ratedFlowGpm?: number;
  ratedPressurePsi?: number;
  ratedSpeedRpm?: number;
  powerHP?: number;
  voltage?: string;
  phases?: number;
  frequency?: number;
  pumpOrientation?: PumpOrientation;
  numberOfStages?: number;
  impellerDiameter?: string;
  suctionSize?: string;
  dischargeSize?: string;
  ulFmListed?: boolean;
  motorManufacturer?: string;
  motorModel?: string;
  motorSerialNumber?: string;
  fullLoadAmperage?: number;
  lockedRotorAmperage?: number;
  serviceFactor?: number;
  frameSize?: string;
  enclosureType?: EnclosureType;
  insulationClass?: InsulationClass;
  engineManufacturer?: string;
  engineModel?: string;
  engineSerialNumber?: string;
  numberOfCylinders?: number;
  displacement?: string;
  ratedEngineHP?: number;
  ratedEngineRPM?: number;
  fuelType?: FuelType;
  fuelTankCapacity?: number;
  oilCapacity?: number;
  coolantCapacity?: number;
  governorType?: GovernorType;
  isTurboSupercharged?: boolean;
  battery1Voltage?: number;
  battery1CCA?: number;
  battery2Voltage?: number;
  battery2CCA?: number;
  batteryChargerManufacturer?: string;
  batteryChargerModel?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export type NEMARating = "1" | "3r" | "4" | "4x" | "12";
export type StartingMethodType = "across_the_line" | "reduced_voltage" | "soft_starter" | "vfd" | "wye_delta" | "part_winding";

export interface FirePumpControlPanel {
  id: string;
  pumpId: string;
  tag: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  supplyVoltage?: string;
  startingType?: StartingMethodType;
  hasAutomaticTransfer?: boolean;
  listedApprovedBy?: string;
  nemaRating?: NEMARating;
  mainBreakerRating?: string;
  controlVoltage?: string;
  hasPressureMaintenance?: boolean;
  hasSequentialStart?: boolean;
  hasAlarmRelay?: boolean;
  hasRemoteStart?: boolean;
  hasEmergencyRun?: boolean;
  hasPhaseReversalProtection?: boolean;
  hasGroundFaultProtection?: boolean;
  undervoltageSettings?: string;
  overvoltageSettings?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export type InspectionType = 
  | "wet_pipe" | "dry_pipe" | "preaction_deluge" | "foam_water" | "water_spray" | "water_mist"
  | "pump_weekly" | "pump_monthly" | "pump_annual" | "electric_pump" | "diesel_pump"
  | "aboveground" | "underground" | "hydrant_flow"
  | "water_tank" | "hazard_eval" | "standpipe" | "fire_service_mains"
  | "fm85a" | "hydrostatic_test";

export type ChecklistValue = "yes" | "no" | "na" | null;

export type NumericFieldType = 
  | "psi" 
  | "static_psi" 
  | "residual_psi" 
  | "pitot_psi"
  | "gpm" 
  | "seconds" 
  | "minutes" 
  | "temperature_f"
  | "temperature_c"
  | "rpm"
  | "voltage"
  | "amperage"
  | "percent"
  | "generic";

export interface NumericField {
  id: string;
  labelKey: string;
  type: NumericFieldType;
  value: string;
  unit?: string;
}

export interface ChecklistItemPhoto {
  id: string;
  uri: string;
  base64?: string;
  caption: string;
  timestamp: string;
}

export interface ChecklistItem {
  id: string;
  labelKey: string;
  label: string;
  value: ChecklistValue;
  psiValue?: string;
  notes?: string;
  numericFields?: NumericField[];
  textFields?: TextFieldData[];
  photos?: ChecklistItemPhoto[];
  sectionId?: string;
}

export interface TextFieldData {
  id: string;
  labelKey: string;
  value: string;
}

export interface TestSection {
  id: string;
  titleKey: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
  numericFields?: NumericField[];
  textFields?: TextFieldData[];
  isExpanded?: boolean;
}

export interface MainDrainTestData {
  staticPsi: string;
  residualPsi: string;
  pressureDrop: string;
  observations: string;
}

export interface HydrantFlowTestData {
  flowHydrantId: string;
  testHydrantId: string;
  staticPsi: string;
  residualPsi: string;
  pitotPsi: string;
  flowGpm: string;
  testDate: string;
  observations: string;
}

export interface PumpTestData {
  noFlowPsi: string;
  ratedFlowPsi: string;
  peakFlowPsi: string;
  suctionPsi: string;
  dischargePsi: string;
  rpm: string;
  voltage: string;
  amperage: string;
  runTimeMinutes: string;
  observations: string;
}

export interface DryPipeTripTestData {
  airPressurePsi: string;
  tripTimeSec: string;
  waterDeliveryTimeMin: string;
  inspectorLocation: string;
  observations: string;
}

export interface PreactionDelugeTripTestData {
  systemType: string;
  detectionType: string;
  tripTimeSec: string;
  waterDeliveryTimeMin: string;
  detectorActivated: string;
  observations: string;
}

export interface WaterTankData {
  tankId: string;
  capacity: string;
  waterLevel: string;
  temperatureF: string;
  heatingStatus: string;
  observations: string;
}

export interface InspectionTestData {
  mainDrainTest?: MainDrainTestData;
  hydrantFlowTest?: HydrantFlowTestData;
  pumpTest?: PumpTestData;
  dryPipeTripTest?: DryPipeTripTestData;
  preactionDelugeTripTest?: PreactionDelugeTripTestData;
  waterTankData?: WaterTankData;
}

export interface InspectionPhoto {
  id: string;
  uri: string;
  base64?: string;
  caption: string;
  timestamp: string;
}

export interface Contractor {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  fax: string;
  email: string;
  licenseNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobSite {
  id: string;
  contractorId: string;
  jobName: string;
  jobNumber: string;
  address: string;
  city: string;
  state: string;
  testLocation: string;
  testMethod: string;
  comments: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicalResponsible {
  id: string;
  name: string;
  creaCAU: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  phone: string;
  contact: string;
  companyId: string;
}

export interface SystemInfo {
  systemNumber: string;
  systemDescription: string;
  buildingName: string;
  floor: string;
  coverage: string;
  supplyType: string;
  designStandard: string;
  yearInstalled: string;
  lastModified: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

import { FM85ACertificate } from "./fm85a";
import { HydrostaticTest } from "./hydrostaticTest";

export interface Inspection {
  id: string;
  type: InspectionType;
  status: InspectionStatus;
  propertyId?: string;
  propertyName: string;
  propertyAddress: string;
  propertyPhone: string;
  inspectorName: string;
  contractNo: string;
  date: string;
  frequency: InspectionFrequency;
  checklist: ChecklistItem[];
  testSections?: TestSection[];
  testData?: InspectionTestData;
  systemInfo?: SystemInfo;
  observations: string;
  signature: string | null;
  // Assinatura do responsavel/acompanhante da empresa/propriedade.
  accompanyingName?: string;
  accompanyingSignature?: string | null;
  photos: InspectionPhoto[];
  scheduledDate?: string;
  notificationId?: string;
  companyId?: string;
  companyData?: Company;
  inspectorId?: string;
  inspectorData?: AppUser;
  firePumpId?: string;
  firePumpData?: FirePump;
  firePumpPanelId?: string;
  firePumpPanelData?: FirePumpControlPanel;
  performanceTestId?: string;
  geoLocation?: GeoLocation | null;
  fm85aCertificate?: FM85ACertificate;
  hydrostaticTest?: HydrostaticTest;
  createdAt: string;
  updatedAt: string;
  version?: number;
}

export interface InspectionSchedule {
  id: string;
  companyId?: string;
  propertyId?: string;
  firePumpId?: string;
  inspectionType: InspectionType;
  frequency: InspectionFrequency;
  startDate: string;
  lastInspectionDate?: string;
  nextDueDate: string;
  notificationId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function migrateInspection(inspection: any): Inspection {
  const migrated: Inspection = {
    ...inspection,
    testSections: inspection.testSections || [],
    testData: inspection.testData || {},
    systemInfo: inspection.systemInfo || {
      systemNumber: "",
      systemDescription: "",
      buildingName: "",
      floor: "",
      coverage: "",
      supplyType: "",
      designStandard: "",
      yearInstalled: "",
      lastModified: "",
    },
    geoLocation: inspection.geoLocation !== undefined ? inspection.geoLocation : null,
    version: inspection.version || 1,
    checklist: (inspection.checklist || []).map((item: any) => ({
      ...item,
      labelKey: item.labelKey || "",
      numericFields: item.numericFields || [],
      textFields: item.textFields || [],
      photos: item.photos || [],
    })),
  };
  return migrated;
}

export function migrateInspections(inspections: any[]): Inspection[] {
  return inspections.map(migrateInspection);
}
