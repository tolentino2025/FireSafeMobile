import { GeoLocation } from "./inspection";

export type HydrostaticSystemType = "hydrants" | "sprinklers";

export type HydrostaticNormRef =
  | "NFPA_13"
  | "NFPA_14"
  | "NFPA_25"
  | "FM_GLOBAL"
  | "NBR";

export type PressureUnit = "bar" | "psi";
export type TimeUnit = "minutes" | "hours";
export type ApprovedBy = "CB" | "FM" | "OUTRO";
export type PressureReadingPoint = "HIGHEST_POINT" | "NEAR_PUMP" | "OTHER";
export type FillingMethod = "GRADUAL" | "BY_SECTOR";
export type ConclusionStatus = "APPROVED" | "REPROVED";

export interface HydrostaticOwner {
  companyId?: string;
  corporateName: string;
  address: string;
  localResponsible: string;
  role: string;
  contact: string;
}

export interface HydrostaticTechnicalResponsible {
  technicalResponsibleId?: string;
  name: string;
  creaCau: string;
  artRrt?: string;
}

export interface HydrostaticExecutorCompany {
  contractorId?: string;
  corporateName: string;
  cnpj: string;
  address: string;
  technicalResponsible: HydrostaticTechnicalResponsible;
}

export interface HydrostaticInspector {
  name: string;
  role: string;
  signatureId?: string;
  signedAt?: string;
}

export interface HydrostaticPreChecks {
  installedAsApprovedProject: boolean;
  pipesAnchoredAndSupported: boolean;
  valvesCorrectlyInstalled: boolean;
  visibleConnectionsAccessible: boolean;
  untestedSectionsIsolated: boolean;
  sensitiveEquipmentProtected: boolean;
}

export interface HydrostaticInstrumentation {
  manometerBrand: string;
  manometerModel: string;
  measurementRange: string;
  calibrationCertificate?: string;
  pressureReadingPoint: PressureReadingPoint;
  pressureReadingPointOther?: string;
}

export interface HydrostaticAirElimination {
  reliefValvesOpen: boolean;
  purgersUsed: boolean;
}

export interface HydrostaticFilling {
  method: FillingMethod;
  airElimination: HydrostaticAirElimination;
}

export interface HydrostaticPressure {
  workingPressureValue: string;
  workingPressureUnit: PressureUnit;
  testPressureValue: string;
  testPressureUnit: PressureUnit;
  normativeCriteriaText: string;
  minimumTestTimeValue: string;
  minimumTestTimeUnit: TimeUnit;
}

export interface HydrostaticMonitoring {
  stabilizationStartTime: string;
  testEndTime: string;
  initialPressureValue: string;
  initialPressureUnit: PressureUnit;
  finalPressureValue: string;
  finalPressureUnit: PressureUnit;
  pressureVariationValue: string;
  pressureVariationUnit: PressureUnit;
}

export interface HydrostaticResults {
  noLeaks: boolean;
  noPressureDrop: boolean;
  noVisibleDeformation: boolean;
  leaksFound: boolean;
  leaksDescription?: string;
  pressureDropAboveAllowed: boolean;
  structuralFailure: boolean;
  failureDescription?: string;
}

export interface HydrostaticConclusion {
  status: ConclusionStatus;
  technicalConclusionText: string;
}

export interface HydrostaticSignatureDates {
  technicalResponsibleDate?: string;
  inspectorDate?: string;
  ownerRepDate?: string;
}

export interface HydrostaticSignatures {
  technicalResponsibleSignatureId?: string;
  inspectorSignatureId?: string;
  ownerRepSignatureId?: string;
  dates: HydrostaticSignatureDates;
}

export interface HydrostaticPhotoEvidence {
  initialGaugePhotoIds: string[];
  initialGeneralPhotoIds: string[];
  duringTestPhotoIds: string[];
  finalGaugePhotoIds: string[];
  finalGeneralPhotoIds: string[];
}

export interface HydrostaticTest {
  systemType: HydrostaticSystemType;
  systemName: string;
  buildingType: string;
  protectedArea: string;
  normRefs: HydrostaticNormRef[];
  fmDataSheet?: string;
  nbrStandard?: string;
  approvedBy?: ApprovedBy;
  approvedByOtherText?: string;

  testDate: string;
  startTime: string;
  endTime: string;
  weather?: string;

  owner: HydrostaticOwner;
  executorCompany: HydrostaticExecutorCompany;
  inspector: HydrostaticInspector;

  preChecks: HydrostaticPreChecks;
  instrumentation: HydrostaticInstrumentation;
  filling: HydrostaticFilling;
  pressure: HydrostaticPressure;
  monitoring: HydrostaticMonitoring;
  results: HydrostaticResults;
  conclusion: HydrostaticConclusion;

  declarationAccepted: boolean;
  signatures: HydrostaticSignatures;
  photoEvidence: HydrostaticPhotoEvidence;
  geoLocation?: GeoLocation;
}

export function createEmptyHydrostaticTest(): HydrostaticTest {
  return {
    systemType: "sprinklers",
    systemName: "",
    buildingType: "",
    protectedArea: "",
    normRefs: [],
    fmDataSheet: "",
    nbrStandard: "",
    approvedBy: undefined,
    approvedByOtherText: "",

    testDate: "",
    startTime: "",
    endTime: "",
    weather: "",

    owner: {
      corporateName: "",
      address: "",
      localResponsible: "",
      role: "",
      contact: "",
    },

    executorCompany: {
      corporateName: "",
      cnpj: "",
      address: "",
      technicalResponsible: {
        name: "",
        creaCau: "",
        artRrt: "",
      },
    },

    inspector: {
      name: "",
      role: "",
      signatureId: "",
      signedAt: "",
    },

    preChecks: {
      installedAsApprovedProject: false,
      pipesAnchoredAndSupported: false,
      valvesCorrectlyInstalled: false,
      visibleConnectionsAccessible: false,
      untestedSectionsIsolated: false,
      sensitiveEquipmentProtected: false,
    },

    instrumentation: {
      manometerBrand: "",
      manometerModel: "",
      measurementRange: "",
      calibrationCertificate: "",
      pressureReadingPoint: "HIGHEST_POINT",
      pressureReadingPointOther: "",
    },

    filling: {
      method: "GRADUAL",
      airElimination: {
        reliefValvesOpen: false,
        purgersUsed: false,
      },
    },

    pressure: {
      workingPressureValue: "",
      workingPressureUnit: "bar",
      testPressureValue: "",
      testPressureUnit: "bar",
      normativeCriteriaText: "",
      minimumTestTimeValue: "",
      minimumTestTimeUnit: "hours",
    },

    monitoring: {
      stabilizationStartTime: "",
      testEndTime: "",
      initialPressureValue: "",
      initialPressureUnit: "bar",
      finalPressureValue: "",
      finalPressureUnit: "bar",
      pressureVariationValue: "",
      pressureVariationUnit: "bar",
    },

    results: {
      noLeaks: false,
      noPressureDrop: false,
      noVisibleDeformation: false,
      leaksFound: false,
      leaksDescription: "",
      pressureDropAboveAllowed: false,
      structuralFailure: false,
      failureDescription: "",
    },

    conclusion: {
      status: "APPROVED",
      technicalConclusionText: "",
    },

    declarationAccepted: false,

    signatures: {
      technicalResponsibleSignatureId: "",
      inspectorSignatureId: "",
      ownerRepSignatureId: "",
      dates: {
        technicalResponsibleDate: "",
        inspectorDate: "",
        ownerRepDate: "",
      },
    },

    photoEvidence: {
      initialGaugePhotoIds: [],
      initialGeneralPhotoIds: [],
      duringTestPhotoIds: [],
      finalGaugePhotoIds: [],
      finalGeneralPhotoIds: [],
    },
    geoLocation: undefined,
  };
}
