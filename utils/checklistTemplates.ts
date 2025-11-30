import { ChecklistItem, InspectionType, InspectionFrequency, NumericField, NumericFieldType } from "@/types/inspection";
import { TranslationKeys } from "@/constants/i18n";

type ChecklistItemKey = keyof TranslationKeys["checklistItems"];

interface NumericFieldTemplate {
  labelKey: string;
  type: NumericFieldType;
  unit?: string;
}

interface ChecklistTemplate {
  labelKey: ChecklistItemKey;
  hasPsi?: boolean;
  frequencies: InspectionFrequency[];
  numericFields?: NumericFieldTemplate[];
  isTestSection?: boolean;
}

const wetPipeChecklist: ChecklistTemplate[] = [
  { labelKey: "enclosureMinTemp", frequencies: ["daily"] },
  { labelKey: "isolationValvesOpen", frequencies: ["weekly"] },
  { labelKey: "rpaReliefValve", frequencies: ["weekly"] },
  { labelKey: "masterPrdDownstreamPressure", hasPsi: true, frequencies: ["weekly"] },
  { labelKey: "masterPrdSupplyPressure", hasPsi: true, frequencies: ["weekly"] },
  { labelKey: "masterPrdFreeFromDamage", frequencies: ["weekly"] },
  { labelKey: "masterPrdTrimGoodCondition", frequencies: ["weekly"] },
  { labelKey: "controlValvesCorrectPosition", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "controlValvesSealed", frequencies: ["weekly", "monthly"] },
  { labelKey: "controlValvesAccessible", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "pivsWithWrenches", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "freeFromDamageLeaks", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "properSignage", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "gaugesGoodCondition", frequencies: ["monthly"] },
  { labelKey: "normalAirPressureMaintained", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "controlValvesLockedSupervised", frequencies: ["monthly"] },
  { labelKey: "waterflowAlarmDevicesFree", frequencies: ["quarterly"] },
  { labelKey: "normalWaterPressureMaintained", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "alarmValveGaugesNormal", frequencies: ["quarterly"] },
  { labelKey: "alarmValveFreeFromDamage", frequencies: ["quarterly"] },
  { labelKey: "retardChamberNotLeaking", frequencies: ["quarterly"] },
  { labelKey: "controlValvesElectronicallySupervised", frequencies: ["quarterly"] },
  { labelKey: "fdcVisibleAccessible", frequencies: ["quarterly"] },
  { labelKey: "fdcCouplingsOperate", frequencies: ["quarterly"] },
  { labelKey: "fdcPlugsCapsInPlace", frequencies: ["quarterly"] },
  { labelKey: "fdcGasketsNotDamaged", frequencies: ["quarterly"] },
  { labelKey: "fdcAutoDrainOperating", frequencies: ["quarterly"] },
  { labelKey: "fdcSignsInPlace", frequencies: ["quarterly"] },
  { labelKey: "fdcInteriorClear", frequencies: ["quarterly", "annually"] },
  { labelKey: "fdcClapperOperates", frequencies: ["quarterly"] },
  { labelKey: "fdcCheckValveNotLeaking", frequencies: ["quarterly"] },
  { labelKey: "fdcPipingUndamaged", frequencies: ["quarterly"] },
  { labelKey: "pressureReducingValveOpen", frequencies: ["quarterly"] },
  { labelKey: "pressureReducingValveMaintaining", frequencies: ["quarterly"] },
  { labelKey: "pressureReducingValveGoodCondition", frequencies: ["quarterly"] },
  { labelKey: "mainDrainTest", frequencies: ["quarterly", "annually"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
    { labelKey: "pressureDrop", type: "psi", unit: "psi" },
  ]},
  { labelKey: "hydraulicDesignSignAttached", frequencies: ["annually"] },
  { labelKey: "sprinklersNoDamageLeaks", frequencies: ["annually"] },
  { labelKey: "sprinklersFreeCorrosion", frequencies: ["annually"] },
  { labelKey: "sprinklersProperOrientation", frequencies: ["annually"] },
  { labelKey: "sprinklersFluidInBulbs", frequencies: ["annually"] },
  { labelKey: "spareSprinklersAvailable", frequencies: ["annually"] },
  { labelKey: "sprinklersNoUnauthorizedPaint", frequencies: ["annually"] },
  { labelKey: "sprinklersFreeOfDust", frequencies: ["annually"] },
  { labelKey: "escutcheonsInstalled", frequencies: ["annually"] },
  { labelKey: "sprinklersClearanceFromStorage", frequencies: ["annually"] },
  { labelKey: "hangersNotDamagedLoose", frequencies: ["annually"] },
  { labelKey: "pipesGoodCondition", frequencies: ["annually"] },
  { labelKey: "pipesNoLeaksDamage", frequencies: ["annually"] },
  { labelKey: "pipesCorrectAlignment", frequencies: ["annually"] },
  { labelKey: "heatTracePerManufacturer", frequencies: ["annually"] },
  { labelKey: "wetPipingNotExposedFreezing", frequencies: ["annually"] },
  { labelKey: "alarmValveInteriorInspected", frequencies: ["five_years"] },
  { labelKey: "checkValveInternal", frequencies: ["five_years"] },
  { labelKey: "obstructionInspection", frequencies: ["five_years"] },
  { labelKey: "backflowInternalInspection", frequencies: ["five_years"] },
];

const dryPipeChecklist: ChecklistTemplate[] = [
  { labelKey: "dryPipeValveEnclosureTemp", frequencies: ["daily"] },
  { labelKey: "isolationValvesOpen", frequencies: ["weekly"] },
  { labelKey: "rpaReliefValve", frequencies: ["weekly"] },
  { labelKey: "controlValvesCorrectPosition", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "controlValvesSealed", frequencies: ["weekly", "monthly"] },
  { labelKey: "controlValvesAccessible", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "pivsWithWrenches", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "freeFromDamageLeaks", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "properSignage", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "gaugesGoodCondition", frequencies: ["monthly"] },
  { labelKey: "airPressureMaintained", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "systemWaterPressureMaintained", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "lowAirPressureAlarm", frequencies: ["monthly"] },
  { labelKey: "quickOpeningDevice", frequencies: ["monthly"] },
  { labelKey: "intermediateDryPendentSprinklers", frequencies: ["monthly"] },
  { labelKey: "controlValvesLockedSupervised", frequencies: ["monthly"] },
  { labelKey: "waterflowAlarmDevicesFree", frequencies: ["quarterly"] },
  { labelKey: "fdcVisibleAccessible", frequencies: ["quarterly"] },
  { labelKey: "fdcCouplingsOperate", frequencies: ["quarterly"] },
  { labelKey: "fdcPlugsCapsInPlace", frequencies: ["quarterly"] },
  { labelKey: "fdcGasketsNotDamaged", frequencies: ["quarterly"] },
  { labelKey: "fdcSignsInPlace", frequencies: ["quarterly"] },
  { labelKey: "fdcCheckValveNotLeaking", frequencies: ["quarterly"] },
  { labelKey: "fdcAutoDrainOperating", frequencies: ["quarterly"] },
  { labelKey: "fdcClapperOperates", frequencies: ["quarterly"] },
  { labelKey: "fdcInteriorClear", frequencies: ["quarterly", "annually"] },
  { labelKey: "fdcPipingUndamaged", frequencies: ["quarterly"] },
  { labelKey: "pressureReducingValveOpen", frequencies: ["quarterly"] },
  { labelKey: "pressureReducingValveMaintaining", frequencies: ["quarterly"] },
  { labelKey: "pressureReducingValveGoodCondition", frequencies: ["quarterly"] },
  { labelKey: "dryPipeTripTest", frequencies: ["quarterly", "annually"], isTestSection: true, numericFields: [
    { labelKey: "airPressurePsi", type: "psi", unit: "psi" },
    { labelKey: "tripTimeSec", type: "seconds", unit: "sec" },
    { labelKey: "waterDeliveryTimeMin", type: "minutes", unit: "min" },
  ]},
  { labelKey: "mainDrainTest", frequencies: ["quarterly", "annually"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
    { labelKey: "pressureDrop", type: "psi", unit: "psi" },
  ]},
  { labelKey: "hydraulicDesignSignAttached", frequencies: ["annually"] },
  { labelKey: "sprinklersNoDamageLeaks", frequencies: ["annually"] },
  { labelKey: "sprinklersFreeCorrosion", frequencies: ["annually"] },
  { labelKey: "sprinklersProperOrientation", frequencies: ["annually"] },
  { labelKey: "sprinklersFluidInBulbs", frequencies: ["annually"] },
  { labelKey: "spareSprinklersAvailable", frequencies: ["annually"] },
  { labelKey: "sprinklersNoUnauthorizedPaint", frequencies: ["annually"] },
  { labelKey: "sprinklersFreeOfDust", frequencies: ["annually"] },
  { labelKey: "escutcheonsInstalled", frequencies: ["annually"] },
  { labelKey: "sprinklersClearanceFromStorage", frequencies: ["annually"] },
  { labelKey: "hangersNotDamagedLoose", frequencies: ["annually"] },
  { labelKey: "pipesGoodCondition", frequencies: ["annually"] },
  { labelKey: "pipesNoLeaksDamage", frequencies: ["annually"] },
  { labelKey: "pipesCorrectAlignment", frequencies: ["annually"] },
  { labelKey: "heatTracePerManufacturer", frequencies: ["annually"] },
  { labelKey: "dryPipeInteriorInspection", frequencies: ["five_years"] },
  { labelKey: "checkValveInternal", frequencies: ["five_years"] },
  { labelKey: "obstructionInspection", frequencies: ["five_years"] },
  { labelKey: "backflowInternalInspection", frequencies: ["five_years"] },
];

const preactionDelugeChecklist: ChecklistTemplate[] = [
  { labelKey: "enclosureMinTemp", frequencies: ["daily"] },
  { labelKey: "isolationValvesOpen", frequencies: ["weekly"] },
  { labelKey: "rpaReliefValve", frequencies: ["weekly"] },
  { labelKey: "controlValvesCorrectPosition", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "controlValvesSealed", frequencies: ["weekly", "monthly"] },
  { labelKey: "controlValvesAccessible", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "pivsWithWrenches", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "freeFromDamageLeaks", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "properSignage", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "masterPrdDownstreamPressure", hasPsi: true, frequencies: ["weekly"] },
  { labelKey: "masterPrdSupplyPressure", hasPsi: true, frequencies: ["weekly"] },
  { labelKey: "masterPrdFreeFromDamage", frequencies: ["weekly"] },
  { labelKey: "masterPrdTrimGoodCondition", frequencies: ["weekly"] },
  { labelKey: "gaugesGoodCondition", frequencies: ["monthly"] },
  { labelKey: "airPressureMaintained", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "controlValvesLockedSupervised", frequencies: ["monthly"] },
  { labelKey: "preactionValveFreeFromDamage", frequencies: ["monthly"] },
  { labelKey: "preactionElectricalInService", frequencies: ["monthly"] },
  { labelKey: "preactionTrimValvesCorrect", frequencies: ["monthly"] },
  { labelKey: "preactionSeatNotLeaking", frequencies: ["monthly"] },
  { labelKey: "waterflowAlarmDevicesFree", frequencies: ["quarterly"] },
  { labelKey: "fdcVisibleAccessible", frequencies: ["quarterly"] },
  { labelKey: "fdcCouplingsOperate", frequencies: ["quarterly"] },
  { labelKey: "fdcPlugsCapsInPlace", frequencies: ["quarterly"] },
  { labelKey: "fdcGasketsNotDamaged", frequencies: ["quarterly"] },
  { labelKey: "fdcSignsInPlace", frequencies: ["quarterly"] },
  { labelKey: "fdcCheckValveNotLeaking", frequencies: ["quarterly"] },
  { labelKey: "fdcAutoDrainOperating", frequencies: ["quarterly"] },
  { labelKey: "fdcClapperOperates", frequencies: ["quarterly"] },
  { labelKey: "fdcInteriorClear", frequencies: ["quarterly", "annually"] },
  { labelKey: "fdcPipingUndamaged", frequencies: ["quarterly"] },
  { labelKey: "pressureReducingValveOpen", frequencies: ["quarterly"] },
  { labelKey: "pressureReducingValveMaintaining", frequencies: ["quarterly"] },
  { labelKey: "pressureReducingValveGoodCondition", frequencies: ["quarterly"] },
  { labelKey: "preactionDelugeTripTest", frequencies: ["quarterly", "annually"], isTestSection: true, numericFields: [
    { labelKey: "tripTimeSec", type: "seconds", unit: "sec" },
    { labelKey: "waterDeliveryTimeMin", type: "minutes", unit: "min" },
  ]},
  { labelKey: "mainDrainTest", frequencies: ["quarterly", "annually"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
    { labelKey: "pressureDrop", type: "psi", unit: "psi" },
  ]},
  { labelKey: "hydraulicDesignSignAttached", frequencies: ["annually"] },
  { labelKey: "sprinklersNoDamageLeaks", frequencies: ["annually"] },
  { labelKey: "sprinklersFreeCorrosion", frequencies: ["annually"] },
  { labelKey: "sprinklersProperOrientation", frequencies: ["annually"] },
  { labelKey: "sprinklersFluidInBulbs", frequencies: ["annually"] },
  { labelKey: "spareSprinklersAvailable", frequencies: ["annually"] },
  { labelKey: "sprinklersNoUnauthorizedPaint", frequencies: ["annually"] },
  { labelKey: "sprinklersFreeOfDust", frequencies: ["annually"] },
  { labelKey: "escutcheonsInstalled", frequencies: ["annually"] },
  { labelKey: "sprinklersClearanceFromStorage", frequencies: ["annually"] },
  { labelKey: "hangersNotDamagedLoose", frequencies: ["annually"] },
  { labelKey: "pipesGoodCondition", frequencies: ["annually"] },
  { labelKey: "pipesNoLeaksDamage", frequencies: ["annually"] },
  { labelKey: "pipesCorrectAlignment", frequencies: ["annually"] },
  { labelKey: "heatTracePerManufacturer", frequencies: ["annually"] },
  { labelKey: "preactionInteriorInspection", frequencies: ["annually"] },
  { labelKey: "detectionSystemOperational", frequencies: ["annually"] },
  { labelKey: "lowTempAlarmFreeFromDamage", frequencies: ["annually"] },
  { labelKey: "obstructionInspection", frequencies: ["five_years"] },
  { labelKey: "checkValveInternal", frequencies: ["five_years"] },
  { labelKey: "preactionInternalInspection", frequencies: ["five_years"] },
  { labelKey: "backflowInternalInspection", frequencies: ["five_years"] },
];

const foamWaterChecklist: ChecklistTemplate[] = [
  { labelKey: "enclosureMinTemp", frequencies: ["daily"] },
  { labelKey: "isolationValvesOpen", frequencies: ["weekly"] },
  { labelKey: "rpaReliefValve", frequencies: ["weekly"] },
  { labelKey: "controlValvesCorrectPosition", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "controlValvesSealed", frequencies: ["weekly", "monthly"] },
  { labelKey: "controlValvesAccessible", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "pivsWithWrenches", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "freeFromDamageLeaks", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "properSignage", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "gaugesGoodCondition", frequencies: ["monthly"] },
  { labelKey: "normalAirPressureMaintained", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "foamConcentrateLevel", frequencies: ["monthly", "quarterly"] },
  { labelKey: "foamConcentrateCondition", frequencies: ["quarterly", "annually"] },
  { labelKey: "proportionerInspection", frequencies: ["annually"] },
  { labelKey: "hydraulicDesignSignAttached", frequencies: ["annually"] },
  { labelKey: "sprinklersNoDamageLeaks", frequencies: ["annually"] },
  { labelKey: "sprinklersFreeCorrosion", frequencies: ["annually"] },
  { labelKey: "hangersNotDamagedLoose", frequencies: ["annually"] },
  { labelKey: "pipesGoodCondition", frequencies: ["annually"] },
  { labelKey: "foamDischargeTest", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "foamExpansionRatio", type: "generic", unit: "%" },
    { labelKey: "foamDrainTime", type: "minutes", unit: "min" },
  ]},
  { labelKey: "obstructionInspection", frequencies: ["five_years"] },
];

const waterSprayChecklist: ChecklistTemplate[] = [
  { labelKey: "systemControlValvesCorrectPosition", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "valvesSealedLockedSupervised", frequencies: ["weekly", "monthly"] },
  { labelKey: "systemFreeFromDamageLeaks", frequencies: ["weekly", "monthly", "quarterly", "annually"] },
  { labelKey: "gaugesGoodCondition", frequencies: ["monthly"] },
  { labelKey: "systemPressureNormal", hasPsi: true, frequencies: ["monthly", "quarterly"] },
  { labelKey: "allComponentsAccessible", frequencies: ["monthly", "quarterly", "annually"] },
  { labelKey: "properSignageInPlace", frequencies: ["monthly", "quarterly"] },
  { labelKey: "systemEnclosureConditions", frequencies: ["monthly", "quarterly"] },
  { labelKey: "nozzlesNoDamage", frequencies: ["annually"] },
  { labelKey: "nozzlesFreeCorrosion", frequencies: ["annually"] },
  { labelKey: "strainersInspected", frequencies: ["annually"] },
  { labelKey: "hangersNotDamagedLoose", frequencies: ["annually"] },
  { labelKey: "pipesGoodCondition", frequencies: ["annually"] },
  { labelKey: "detectionSystemOperational", frequencies: ["annually"] },
  { labelKey: "waterSprayTest", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "flowGpm", type: "gpm", unit: "gpm" },
    { labelKey: "operationTimeSec", type: "seconds", unit: "sec" },
  ]},
  { labelKey: "obstructionInspection", frequencies: ["five_years"] },
];

const waterMistChecklist: ChecklistTemplate[] = [
  { labelKey: "systemControlValvesCorrectPosition", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "valvesSealedLockedSupervised", frequencies: ["weekly", "monthly"] },
  { labelKey: "systemFreeFromDamageLeaks", frequencies: ["weekly", "monthly", "quarterly", "annually"] },
  { labelKey: "gaugesGoodCondition", frequencies: ["monthly"] },
  { labelKey: "systemPressureNormal", hasPsi: true, frequencies: ["monthly", "quarterly"] },
  { labelKey: "allComponentsAccessible", frequencies: ["monthly", "quarterly", "annually"] },
  { labelKey: "properSignageInPlace", frequencies: ["monthly", "quarterly"] },
  { labelKey: "systemEnclosureConditions", frequencies: ["monthly", "quarterly"] },
  { labelKey: "nozzlesNoDamage", frequencies: ["annually"] },
  { labelKey: "nozzlesFreeCorrosion", frequencies: ["annually"] },
  { labelKey: "filtersInspected", frequencies: ["annually"] },
  { labelKey: "pumpUnitInspection", frequencies: ["annually"] },
  { labelKey: "cylindersInspected", frequencies: ["annually"] },
  { labelKey: "actuatorsInspected", frequencies: ["annually"] },
  { labelKey: "waterMistTest", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "operatingPsi", type: "psi", unit: "psi" },
    { labelKey: "operationTimeSec", type: "seconds", unit: "sec" },
  ]},
  { labelKey: "obstructionInspection", frequencies: ["five_years"] },
];

const pumpWeeklyChecklist: ChecklistTemplate[] = [
  { labelKey: "pumpHouseConditions", frequencies: ["weekly", "monthly"] },
  { labelKey: "pumpSuctionDischargePressure", hasPsi: true, frequencies: ["weekly", "monthly"], numericFields: [
    { labelKey: "suctionPsi", type: "psi", unit: "psi" },
    { labelKey: "dischargePsi", type: "psi", unit: "psi" },
  ]},
  { labelKey: "pumpPackingGlands", frequencies: ["weekly", "monthly"] },
  { labelKey: "systemValvesProperPosition", frequencies: ["weekly", "monthly"] },
  { labelKey: "suctionReservoirFull", frequencies: ["weekly", "monthly"] },
  { labelKey: "wetPitSuctionScreen", frequencies: ["weekly", "monthly"] },
  { labelKey: "controllerSelectorSwitch", frequencies: ["weekly", "monthly"] },
  { labelKey: "controllerPilotLights", frequencies: ["weekly", "monthly"] },
  { labelKey: "dieselFuelTank", frequencies: ["weekly", "monthly"] },
  { labelKey: "batteryTerminals", frequencies: ["weekly", "monthly"] },
  { labelKey: "batteryChargerOperating", frequencies: ["weekly", "monthly"] },
  { labelKey: "pumpRoomTemp", frequencies: ["weekly", "monthly"] },
];

const pumpMonthlyChecklist: ChecklistTemplate[] = [
  { labelKey: "pumpHouseConditions", frequencies: ["monthly"] },
  { labelKey: "pumpSuctionDischargePressure", hasPsi: true, frequencies: ["monthly"], numericFields: [
    { labelKey: "suctionPsi", type: "psi", unit: "psi" },
    { labelKey: "dischargePsi", type: "psi", unit: "psi" },
  ]},
  { labelKey: "pumpPackingGlands", frequencies: ["monthly"] },
  { labelKey: "systemValvesProperPosition", frequencies: ["monthly"] },
  { labelKey: "suctionReservoirFull", frequencies: ["monthly"] },
  { labelKey: "wetPitSuctionScreen", frequencies: ["monthly"] },
  { labelKey: "controllerSelectorSwitch", frequencies: ["monthly"] },
  { labelKey: "controllerPilotLights", frequencies: ["monthly"] },
  { labelKey: "dieselFuelTank", frequencies: ["monthly"] },
  { labelKey: "batteryTerminals", frequencies: ["monthly"] },
  { labelKey: "batteryChargerOperating", frequencies: ["monthly"] },
  { labelKey: "pumpRoomTemp", frequencies: ["monthly"] },
  { labelKey: "pumpStartedRun10Min", frequencies: ["monthly"] },
  { labelKey: "suctionPressureRecorded", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "dischargePressureRecorded", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "pumpSpeed", frequencies: ["monthly"], numericFields: [
    { labelKey: "rpmValue", type: "rpm", unit: "rpm" },
  ]},
  { labelKey: "pumpBearingTemp", frequencies: ["monthly"] },
  { labelKey: "packingGlandDripRate", frequencies: ["monthly"] },
  { labelKey: "unusualNoiseVibration", frequencies: ["monthly"] },
  { labelKey: "dieselEngineCooling", frequencies: ["monthly"] },
];

const pumpAnnualChecklist: ChecklistTemplate[] = [
  { labelKey: "pumpHouseConditions", frequencies: ["annually"] },
  { labelKey: "pumpSuctionDischargePressure", hasPsi: true, frequencies: ["annually"], numericFields: [
    { labelKey: "suctionPsi", type: "psi", unit: "psi" },
    { labelKey: "dischargePsi", type: "psi", unit: "psi" },
  ]},
  { labelKey: "pumpPackingGlands", frequencies: ["annually"] },
  { labelKey: "systemValvesProperPosition", frequencies: ["annually"] },
  { labelKey: "suctionReservoirFull", frequencies: ["annually"] },
  { labelKey: "controllerSelectorSwitch", frequencies: ["annually"] },
  { labelKey: "controllerPilotLights", frequencies: ["annually"] },
  { labelKey: "dieselFuelTank", frequencies: ["annually"] },
  { labelKey: "batteryTerminals", frequencies: ["annually"] },
  { labelKey: "batteryChargerOperating", frequencies: ["annually"] },
  { labelKey: "pumpRoomTemp", frequencies: ["annually"] },
  { labelKey: "pumpStartedRun10Min", frequencies: ["annually"] },
  { labelKey: "suctionPressureRecorded", hasPsi: true, frequencies: ["annually"] },
  { labelKey: "dischargePressureRecorded", hasPsi: true, frequencies: ["annually"] },
  { labelKey: "pumpSpeed", frequencies: ["annually"], numericFields: [
    { labelKey: "rpmValue", type: "rpm", unit: "rpm" },
  ]},
  { labelKey: "pumpBearingTemp", frequencies: ["annually"] },
  { labelKey: "packingGlandDripRate", frequencies: ["annually"] },
  { labelKey: "unusualNoiseVibration", frequencies: ["annually"] },
  { labelKey: "dieselEngineCooling", frequencies: ["annually"] },
  { labelKey: "annualPerformanceTest", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "noFlowPsi", type: "psi", unit: "psi" },
    { labelKey: "ratedFlowPsi", type: "psi", unit: "psi" },
    { labelKey: "peakFlowPsi", type: "psi", unit: "psi" },
    { labelKey: "flowGpm", type: "gpm", unit: "gpm" },
    { labelKey: "rpmValue", type: "rpm", unit: "rpm" },
    { labelKey: "voltageReading", type: "voltage", unit: "V" },
    { labelKey: "amperageReading", type: "amperage", unit: "A" },
  ]},
  { labelKey: "pumpFlowTest", frequencies: ["annually"] },
  { labelKey: "reliefValveTest", frequencies: ["annually"] },
  { labelKey: "alarmConditionsVerified", frequencies: ["annually"] },
];

const abovegroundChecklist: ChecklistTemplate[] = [
  { labelKey: "pipingGoodCondition", frequencies: ["quarterly", "annually"] },
  { labelKey: "pipingNoLeaks", frequencies: ["quarterly", "annually"] },
  { labelKey: "pipingSupportsCondition", frequencies: ["annually"] },
  { labelKey: "controlValvesCorrectPosition", frequencies: ["quarterly"] },
  { labelKey: "controlValvesAccessible", frequencies: ["quarterly"] },
  { labelKey: "freeFromDamageLeaks", frequencies: ["quarterly"] },
  { labelKey: "properSignage", frequencies: ["quarterly"] },
  { labelKey: "hydrantsAccessibleOperational", frequencies: ["annually"] },
  { labelKey: "hydrantBarrelsFullyDrained", frequencies: ["annually"] },
  { labelKey: "hydrantNozzlesCapsOperational", frequencies: ["annually"] },
  { labelKey: "mainDrainTest", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
    { labelKey: "pressureDrop", type: "psi", unit: "psi" },
  ]},
];

const undergroundChecklist: ChecklistTemplate[] = [
  { labelKey: "mainDrainTest", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
    { labelKey: "pressureDrop", type: "psi", unit: "psi" },
  ]},
  { labelKey: "flowTestPerformed", frequencies: ["five_years"], isTestSection: true, numericFields: [
    { labelKey: "flowGpm", type: "gpm", unit: "gpm" },
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
  ]},
  { labelKey: "undergroundPipingCondition", frequencies: ["five_years"] },
  { labelKey: "hydrantsAccessibleOperational", frequencies: ["annually"] },
  { labelKey: "hydrantBarrelsFullyDrained", frequencies: ["annually"] },
  { labelKey: "hydrantNozzlesCapsOperational", frequencies: ["annually"] },
  { labelKey: "controlValvesCorrectPosition", frequencies: ["quarterly"] },
  { labelKey: "controlValvesAccessible", frequencies: ["quarterly"] },
];

const hydrantFlowChecklist: ChecklistTemplate[] = [
  { labelKey: "hydrantFlowTest", frequencies: ["annually", "five_years"], isTestSection: true, numericFields: [
    { labelKey: "flowHydrantId", type: "generic", unit: "" },
    { labelKey: "testHydrantId", type: "generic", unit: "" },
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
    { labelKey: "pitotPsi", type: "pitot_psi", unit: "psi" },
    { labelKey: "flowGpm", type: "gpm", unit: "gpm" },
  ]},
  { labelKey: "hydrantsAccessibleOperational", frequencies: ["annually"] },
  { labelKey: "capsPlugsInPlace", frequencies: ["annually"] },
  { labelKey: "hydrantWrenchAvailable", frequencies: ["annually"] },
  { labelKey: "hydrantDrainsProperly", frequencies: ["annually"] },
  { labelKey: "hydrantLubricatedOperable", frequencies: ["annually"] },
  { labelKey: "hydrantPitboxAccessible", frequencies: ["annually"] },
];

const waterTankChecklist: ChecklistTemplate[] = [
  { labelKey: "tankWaterLevelCorrect", frequencies: ["weekly", "monthly", "quarterly"] },
  { labelKey: "tankTempGaugeOperational", frequencies: ["weekly", "monthly"] },
  { labelKey: "waterTempAbove40", frequencies: ["weekly", "monthly"] },
  { labelKey: "tankHeatingSystem", frequencies: ["weekly", "monthly"] },
  { labelKey: "tankExteriorCondition", frequencies: ["quarterly", "annually"] },
  { labelKey: "tankSupportsCondition", frequencies: ["quarterly", "annually"] },
  { labelKey: "tankAccessoriesSecure", frequencies: ["annually"] },
  { labelKey: "cathodicProtection", frequencies: ["annually"] },
  { labelKey: "tankVentsUnobstructed", frequencies: ["quarterly", "annually"] },
  { labelKey: "overflowPipeUnobstructed", frequencies: ["quarterly", "annually"] },
  { labelKey: "tankInspection", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "tankCapacity", type: "generic", unit: "gal" },
    { labelKey: "waterLevelPercent", type: "percent", unit: "%" },
    { labelKey: "waterTempF", type: "temperature_f", unit: "F" },
  ]},
  { labelKey: "tankInteriorInspection", frequencies: ["five_years"] },
  { labelKey: "tankPaintingCondition", frequencies: ["five_years"] },
];

const hazardEvalChecklist: ChecklistTemplate[] = [
  { labelKey: "occupancyClassification", frequencies: ["annually"] },
  { labelKey: "hazardClassification", frequencies: ["annually"] },
  { labelKey: "storageArrangement", frequencies: ["annually"] },
  { labelKey: "clearanceToSprinklers", frequencies: ["annually"] },
  { labelKey: "buildingChanges", frequencies: ["annually"] },
  { labelKey: "processChanges", frequencies: ["annually"] },
  { labelKey: "commodityChanges", frequencies: ["annually"] },
  { labelKey: "fireLoadAnalysis", frequencies: ["annually"] },
];

const standpipeChecklist: ChecklistTemplate[] = [
  { labelKey: "hoseConnectionsAccessible", frequencies: ["quarterly", "annually"] },
  { labelKey: "hoseConnectionsNotObstructed", frequencies: ["quarterly", "annually"] },
  { labelKey: "threadsGoodCondition", frequencies: ["quarterly", "annually"] },
  { labelKey: "pressureReducingValves", frequencies: ["quarterly", "annually"] },
  { labelKey: "hoseAvailable", frequencies: ["annually"] },
  { labelKey: "hoseGoodCondition", frequencies: ["annually"] },
  { labelKey: "hoseRackGoodCondition", frequencies: ["annually"] },
  { labelKey: "cabinetDoorsOperate", frequencies: ["annually"] },
  { labelKey: "fdcAccessible", frequencies: ["quarterly"] },
  { labelKey: "fdcCapsInPlace", frequencies: ["quarterly"] },
  { labelKey: "fdcCheckValve", frequencies: ["quarterly", "annually"] },
  { labelKey: "controlValvesCorrectPosition", frequencies: ["quarterly"] },
  { labelKey: "controlValvesAccessible", frequencies: ["quarterly"] },
  { labelKey: "properSignage", frequencies: ["quarterly"] },
  { labelKey: "standpipeFlowTest", frequencies: ["annually", "five_years"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
    { labelKey: "flowGpm", type: "gpm", unit: "gpm" },
  ]},
  { labelKey: "mainDrainTest", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
    { labelKey: "pressureDrop", type: "psi", unit: "psi" },
  ]},
];

const checklistsByType: Record<InspectionType, ChecklistTemplate[]> = {
  wet_pipe: wetPipeChecklist,
  dry_pipe: dryPipeChecklist,
  preaction_deluge: preactionDelugeChecklist,
  foam_water: foamWaterChecklist,
  water_spray: waterSprayChecklist,
  water_mist: waterMistChecklist,
  pump_weekly: pumpWeeklyChecklist,
  pump_monthly: pumpMonthlyChecklist,
  pump_annual: pumpAnnualChecklist,
  aboveground: abovegroundChecklist,
  underground: undergroundChecklist,
  hydrant_flow: hydrantFlowChecklist,
  water_tank: waterTankChecklist,
  hazard_eval: hazardEvalChecklist,
  standpipe: standpipeChecklist,
};

export function getChecklistForType(
  type: InspectionType,
  frequency: InspectionFrequency | null,
  translations: TranslationKeys["checklistItems"]
): ChecklistItem[] {
  const template = checklistsByType[type] || [];
  
  const filteredTemplate = frequency
    ? template.filter((item) => item.frequencies.includes(frequency))
    : template;
  
  return filteredTemplate.map((item, index) => {
    const numericFields: NumericField[] | undefined = item.numericFields?.map((nf, nfIndex) => ({
      id: `${type}_${index}_nf_${nfIndex}_${Date.now()}`,
      labelKey: nf.labelKey,
      type: nf.type,
      value: "",
      unit: nf.unit,
    }));

    return {
      id: `${type}_${index}_${Date.now()}`,
      labelKey: item.labelKey,
      label: translations[item.labelKey] || item.labelKey,
      value: null,
      psiValue: item.hasPsi ? "" : undefined,
      numericFields,
      textFields: [],
      notes: "",
    };
  });
}

export function getAllChecklistForType(
  type: InspectionType,
  translations: TranslationKeys["checklistItems"]
): ChecklistItem[] {
  const template = checklistsByType[type] || [];
  
  return template.map((item, index) => {
    const numericFields: NumericField[] | undefined = item.numericFields?.map((nf, nfIndex) => ({
      id: `${type}_${index}_nf_${nfIndex}_${Date.now()}`,
      labelKey: nf.labelKey,
      type: nf.type,
      value: "",
      unit: nf.unit,
    }));

    return {
      id: `${type}_${index}_${Date.now()}`,
      labelKey: item.labelKey,
      label: translations[item.labelKey] || item.labelKey,
      value: null,
      psiValue: item.hasPsi ? "" : undefined,
      numericFields,
      textFields: [],
      notes: "",
    };
  });
}

export function getTemplateByLabelKey(type: InspectionType, labelKey: string): ChecklistTemplate | undefined {
  const template = checklistsByType[type] || [];
  return template.find((item) => item.labelKey === labelKey);
}

export function isTestSection(type: InspectionType, labelKey: string): boolean {
  const template = getTemplateByLabelKey(type, labelKey);
  return template?.isTestSection === true;
}
