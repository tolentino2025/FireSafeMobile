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
  // Pump House Section
  { labelKey: "pumpRoomTemp", frequencies: ["weekly", "monthly"] },
  { labelKey: "ventilationLouversFree", frequencies: ["weekly", "monthly"] },
  { labelKey: "excessiveWaterOnFloor", frequencies: ["weekly", "monthly"] },
  { labelKey: "couplingGuardInPlace", frequencies: ["weekly", "monthly"] },
  { labelKey: "dieselPumpRoomTemp70F", frequencies: ["weekly", "monthly"] },
  { labelKey: "pumpHouseConditions", frequencies: ["weekly", "monthly"] },
  // Pump Systems Section
  { labelKey: "systemValvesProperPosition", frequencies: ["weekly", "monthly"] },
  { labelKey: "pipingHosesNoLeak", frequencies: ["weekly", "monthly"] },
  { labelKey: "pumpPackingGlands", frequencies: ["weekly", "monthly"] },
  { labelKey: "pumpSuctionDischargePressure", hasPsi: true, frequencies: ["weekly", "monthly"], numericFields: [
    { labelKey: "suctionPsi", type: "psi", unit: "psi" },
    { labelKey: "dischargePsi", type: "psi", unit: "psi" },
  ]},
  { labelKey: "suctionReservoirFull", frequencies: ["weekly", "monthly"] },
  { labelKey: "wetPitSuctionScreen", frequencies: ["weekly", "monthly"] },
  { labelKey: "waterflowTestValvesClosed", frequencies: ["weekly", "monthly"] },
  { labelKey: "pumpStartingPressure", hasPsi: true, frequencies: ["weekly", "monthly"] },
  { labelKey: "pumpOperate10Min", frequencies: ["weekly"] },
  { labelKey: "packingGlandTightness", frequencies: ["weekly", "monthly"] },
  { labelKey: "unusualNoiseVibration", frequencies: ["weekly", "monthly"] },
  { labelKey: "packingBearingOverheating", frequencies: ["weekly", "monthly"] },
  { labelKey: "pressureSwitchTransducer", hasPsi: true, frequencies: ["weekly", "monthly"] },
  { labelKey: "pumpHighLowPressure", hasPsi: true, frequencies: ["weekly", "monthly"], numericFields: [
    { labelKey: "highestPsi", type: "psi", unit: "psi" },
    { labelKey: "lowestPsi", type: "psi", unit: "psi" },
  ]},
  { labelKey: "circulationReliefValve", frequencies: ["weekly", "monthly"] },
  // Electrical Systems Section
  { labelKey: "controllerPilotLights", frequencies: ["weekly", "monthly"] },
  { labelKey: "transferSwitchNormalLight", frequencies: ["weekly", "monthly"] },
  { labelKey: "standbyPowerIsolatingSwitch", frequencies: ["weekly", "monthly"] },
  { labelKey: "reversePhaseAlarmOff", frequencies: ["weekly", "monthly"] },
  { labelKey: "normalPhaseRotationOn", frequencies: ["weekly", "monthly"] },
  { labelKey: "verticalMotorOilLevel", frequencies: ["weekly", "monthly"] },
  { labelKey: "jockeyPumpHasPower", frequencies: ["weekly", "monthly"] },
  { labelKey: "reducedVoltageStartingTime", frequencies: ["weekly", "monthly"], numericFields: [
    { labelKey: "startingTimeSec", type: "seconds", unit: "sec" },
  ]},
  { labelKey: "motorAccelerationTime", frequencies: ["weekly", "monthly"], numericFields: [
    { labelKey: "accelerationTimeSec", type: "seconds", unit: "sec" },
  ]},
  { labelKey: "autoStopRunTime", frequencies: ["weekly", "monthly"], numericFields: [
    { labelKey: "runTimeSec", type: "seconds", unit: "sec" },
  ]},
  // Diesel Engine Systems Section
  { labelKey: "dieselFuelTank", frequencies: ["weekly", "monthly"] },
  { labelKey: "controllerSelectorSwitch", frequencies: ["weekly", "monthly"] },
  { labelKey: "batteryVoltageReading", frequencies: ["weekly", "monthly"], numericFields: [
    { labelKey: "battery1Voltage", type: "voltage", unit: "V" },
    { labelKey: "battery2Voltage", type: "voltage", unit: "V" },
  ]},
  { labelKey: "chargingCurrentReading", frequencies: ["weekly", "monthly"], numericFields: [
    { labelKey: "chargingAmperage", type: "amperage", unit: "A" },
  ]},
  { labelKey: "batteryPilotLightsOn", frequencies: ["weekly", "monthly"] },
  { labelKey: "allAlarmPilotLightsOff", frequencies: ["weekly", "monthly"] },
  { labelKey: "engineRunningTimeMeter", frequencies: ["weekly", "monthly"], numericFields: [
    { labelKey: "runningTimeHours", type: "minutes", unit: "hrs" },
  ]},
  { labelKey: "rightAngleGearDriveOil", frequencies: ["weekly", "monthly"] },
  { labelKey: "crankcaseOilLevel", frequencies: ["weekly", "monthly"] },
  { labelKey: "coolingWaterLevel", frequencies: ["weekly", "monthly"] },
  { labelKey: "electrolyteLevelBatteries", frequencies: ["weekly", "monthly"] },
  { labelKey: "batteryTerminals", frequencies: ["weekly", "monthly"] },
  { labelKey: "waterJacketHeaterOperational", frequencies: ["weekly", "monthly"] },
  { labelKey: "batteryChargerOperating", frequencies: ["weekly", "monthly"] },
  { labelKey: "batteryCrankingVoltage", frequencies: ["weekly", "monthly"], numericFields: [
    { labelKey: "crankingVoltage", type: "voltage", unit: "V" },
  ]},
  { labelKey: "dieselWaterPumpNotLeaking", frequencies: ["weekly", "monthly"] },
  { labelKey: "flexibleHoseConnections", frequencies: ["weekly", "monthly"] },
  { labelKey: "lubricatingOilHeater", frequencies: ["weekly", "monthly"] },
  { labelKey: "lubricatingOilLevel", frequencies: ["weekly", "monthly"] },
  { labelKey: "waterInDieselFuelTank", frequencies: ["weekly", "monthly"] },
  { labelKey: "dieselCrankingTime", frequencies: ["weekly", "monthly"], numericFields: [
    { labelKey: "crankingTimeSec", type: "seconds", unit: "sec" },
  ]},
  { labelKey: "dieselRunningSpeedTime", frequencies: ["weekly", "monthly"], numericFields: [
    { labelKey: "runningSpeedTimeSec", type: "seconds", unit: "sec" },
  ]},
  { labelKey: "dieselEngineGauges", frequencies: ["weekly", "monthly"] },
  { labelKey: "heatExchangerCoolingWater", frequencies: ["weekly", "monthly"] },
  { labelKey: "speedGovernorOperation", frequencies: ["weekly", "monthly"] },
  { labelKey: "fuelSystemSolenoids", frequencies: ["weekly", "monthly"] },
  { labelKey: "tankFloatSwitch", frequencies: ["weekly", "monthly"] },
  // Steam System Section
  { labelKey: "steamPressureRange", frequencies: ["weekly", "monthly"], numericFields: [
    { labelKey: "steamPressurePsi", type: "psi", unit: "psi" },
  ]},
  { labelKey: "turbineRunningSpeedTime", frequencies: ["weekly", "monthly"], numericFields: [
    { labelKey: "turbineSpeedTimeSec", type: "seconds", unit: "sec" },
  ]},
  { labelKey: "steamTrapCheck", frequencies: ["weekly", "monthly"] },
  { labelKey: "steamReliefValve", frequencies: ["weekly", "monthly"] },
  // Exhaust System Section
  { labelKey: "exhaustSystemLeaks", frequencies: ["weekly", "monthly"] },
  { labelKey: "drainCondensateTrap", frequencies: ["weekly", "monthly"] },
  // Quarterly Diesel Engine System Items
  // Fuel System Quarterly
  { labelKey: "fuelStrainerFilterClean", frequencies: ["quarterly"] },
  // Lubrication System Quarterly
  { labelKey: "crankcaseBreatherInspect", frequencies: ["quarterly"] },
  // Cooling System Quarterly
  { labelKey: "waterStrainerClean", frequencies: ["quarterly"] },
  // Exhaust System Quarterly
  { labelKey: "exhaustInsulationFireHazards", frequencies: ["quarterly"] },
  // Battery System Quarterly
  { labelKey: "batteryTerminalsCleanTight", frequencies: ["quarterly"] },
  // Electrical System Quarterly
  { labelKey: "wireChafingInspect", frequencies: ["quarterly"] },
  // Semiannual Electric Fire Pump System
  { labelKey: "operateManualStartingMeans", frequencies: ["semiannually"] },
  // Semiannual Diesel Engine System - Cooling
  { labelKey: "antifreezeProtectionLevel", frequencies: ["semiannually"] },
  // Semiannual Diesel Engine System - Exhaust
  { labelKey: "flexibleExhaustSection", frequencies: ["semiannually"] },
  // Semiannual Diesel Engine System - Electrical
  { labelKey: "safetiesAlarmsOperation", frequencies: ["semiannually"] },
  { labelKey: "cleanBoxesPanelsCabinets", frequencies: ["semiannually"] },
  // Annual Electric Fire Pump - Pump System
  { labelKey: "lubricateBearings", frequencies: ["annually"] },
  { labelKey: "powerTransferSwitchTest", frequencies: ["annually"] },
  { labelKey: "parallelAngularAlignment", frequencies: ["annually"] },
  { labelKey: "mainReliefValveTest", frequencies: ["annually"] },
  { labelKey: "flexibleHosesConnections", frequencies: ["annually"] },
  { labelKey: "plumbingPartsInsideOutside", frequencies: ["annually"] },
  { labelKey: "pumpShaftEndPlay", frequencies: ["annually"] },
  { labelKey: "pressureGaugesSensorsAccuracy", frequencies: ["annually"] },
  { labelKey: "pumpCouplingAlignment", frequencies: ["annually"] },
  // Annual Electric Fire Pump - Mechanical Transmission
  { labelKey: "lubricateCoupling", frequencies: ["annually"] },
  { labelKey: "lubricateRightAngleGearDrive", frequencies: ["annually"] },
  // Annual Electric Fire Pump - Electrical System
  { labelKey: "corrosionPrintedCircuitBoards", frequencies: ["annually"] },
  { labelKey: "crackedCableWireInsulation", frequencies: ["annually"] },
  { labelKey: "electronicControlModuleTest", frequencies: ["annually"] },
  { labelKey: "sacrificialAnodeMaintenance", frequencies: ["annually"] },
  { labelKey: "tripCircuitBreakerTest", frequencies: ["annually"] },
  { labelKey: "emergencyManualStartingMeans", frequencies: ["annually"] },
  { labelKey: "lubricateMechanicalMovingParts", frequencies: ["annually"] },
  { labelKey: "calibratePressureSwitchSettings", frequencies: ["annually"] },
  { labelKey: "lubricateMotorBearings", frequencies: ["annually"] },
  { labelKey: "leaksPlumbingParts", frequencies: ["annually"] },
  { labelKey: "signsWaterElectricalParts", frequencies: ["annually"] },
  // Annual Diesel Engine - Pump System
  { labelKey: "mainReliefValveTestDiesel", frequencies: ["annually"] },
  // Annual Diesel Engine - Fuel System
  { labelKey: "dieselFuelTest", frequencies: ["annually"] },
  { labelKey: "fuelPumpAlarmSignals", frequencies: ["annually"] },
  { labelKey: "activeFuelMaintenanceSystem", frequencies: ["annually"] },
  { labelKey: "changeFuelFilter", frequencies: ["annually"] },
  { labelKey: "waterForeignMaterialTank", frequencies: ["annually"] },
  { labelKey: "tankVentsOverflowPiping", frequencies: ["annually"] },
  { labelKey: "fuelTankPipingInspect", frequencies: ["annually"] },
  // Annual Diesel Engine - Lubrication System
  { labelKey: "oilChange50Hours", frequencies: ["annually"] },
  { labelKey: "oilFilterChange", frequencies: ["annually"] },
  // Annual Diesel Engine - Cooling System
  { labelKey: "replaceCirculatingWaterFilter", frequencies: ["annually"] },
  { labelKey: "highCoolingWaterTempSignal", frequencies: ["annually"] },
  { labelKey: "antifreezeInspect", frequencies: ["annually"] },
  { labelKey: "cleanHeatExchanger", frequencies: ["annually"] },
  { labelKey: "ductWorkLouversInspect", frequencies: ["annually"] },
  // Annual Diesel Engine - Exhaust System
  { labelKey: "exhaustSystemDrainCondensate", frequencies: ["annually"] },
  { labelKey: "excessiveBackpressureTest", frequencies: ["annually"] },
  { labelKey: "hangersSupportsCondition", frequencies: ["annually"] },
  // Annual Diesel Engine - Battery System
  { labelKey: "specificGravityChargerRates", frequencies: ["annually"] },
  { labelKey: "cleanBatteryTerminals", frequencies: ["annually"] },
  { labelKey: "batteryCrankingVoltageCheck", frequencies: ["annually"] },
  { labelKey: "distilledWaterOnly", frequencies: ["annually"] },
  // Annual Electrical System
  { labelKey: "tightenControlPowerWiring", frequencies: ["annually"] },
  { labelKey: "voltmeterAmmeterAccuracy", frequencies: ["annually"] },
];

const pumpMonthlyChecklist: ChecklistTemplate[] = [
  // Electric Fire Pump Monthly Tests
  { labelKey: "nonFlowTest10Min", frequencies: ["monthly"] },
  { labelKey: "pumpStartingPressure", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "packingGlandTightness", frequencies: ["monthly"] },
  { labelKey: "pumpSuctionDischargePressure", hasPsi: true, frequencies: ["monthly"], numericFields: [
    { labelKey: "suctionPsi", type: "psi", unit: "psi" },
    { labelKey: "dischargePsi", type: "psi", unit: "psi" },
  ]},
  { labelKey: "adjustGlandNuts", frequencies: ["monthly"] },
  { labelKey: "unusualNoiseVibration", frequencies: ["monthly"] },
  { labelKey: "pressureSwitchTransducer", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "pumpHighLowPressure", hasPsi: true, frequencies: ["monthly"], numericFields: [
    { labelKey: "highestPsi", type: "psi", unit: "psi" },
    { labelKey: "lowestPsi", type: "psi", unit: "psi" },
  ]},
  { labelKey: "circulationReliefValve", frequencies: ["monthly"] },
  { labelKey: "reducedVoltageStartingTime", frequencies: ["monthly"], numericFields: [
    { labelKey: "startingTimeSec", type: "seconds", unit: "sec" },
  ]},
  // Electrical System Monthly
  { labelKey: "exerciseIsolatingSwitchBreaker", frequencies: ["monthly"] },
  { labelKey: "circuitBreakersOrFuses", frequencies: ["monthly"] },
  // Battery System Monthly
  { labelKey: "batteryCaseCleanDry", frequencies: ["monthly"] },
  { labelKey: "specificGravityStateOfCharge", frequencies: ["monthly"] },
  { labelKey: "chargerAndChargeRate", frequencies: ["monthly"] },
  { labelKey: "equalizeCharge", frequencies: ["monthly"] },
  // General Pump House Conditions
  { labelKey: "pumpHouseConditions", frequencies: ["monthly"] },
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
  // Daily (Cold Weather/Heating Season Only)
  { labelKey: "heatingSystemUnsupervised", frequencies: ["daily"] },
  // Weekly - Control Valves
  { labelKey: "valveCorrectPosition", frequencies: ["weekly"] },
  { labelKey: "valveSealed", frequencies: ["weekly"] },
  { labelKey: "valveAccessible", frequencies: ["weekly"] },
  { labelKey: "pivCorrectWrenches", frequencies: ["weekly"] },
  { labelKey: "valveFreeDamageLeaks", frequencies: ["weekly"] },
  { labelKey: "valveProperSignage", frequencies: ["weekly"] },
  // Weekly (Cold Weather)
  { labelKey: "waterTempUnsupervised", frequencies: ["weekly"] },
  { labelKey: "waterTempSupervised", frequencies: ["weekly"] },
  // Monthly
  { labelKey: "gaugesGoodConditionTank", frequencies: ["monthly"] },
  // Monthly - Control Valves (Locked/Supervised)
  { labelKey: "waterTempSupervisedMonthly", frequencies: ["monthly"] },
  { labelKey: "valveCorrectPositionMonthly", frequencies: ["monthly"] },
  { labelKey: "valveLockedSupervised", frequencies: ["monthly"] },
  { labelKey: "valveAccessibleMonthly", frequencies: ["monthly"] },
  { labelKey: "pivCorrectWrenchesMonthly", frequencies: ["monthly"] },
  { labelKey: "valveFreeDamageLeaksMonthly", frequencies: ["monthly"] },
  { labelKey: "valveProperSignageMonthly", frequencies: ["monthly"] },
  // Monthly - Water Level
  { labelKey: "waterLevelUnsupervisedFull", frequencies: ["monthly"] },
  // Quarterly
  { labelKey: "gaugesNormalPressure", frequencies: ["quarterly"] },
  { labelKey: "waterLevelSupervisedFull", frequencies: ["quarterly"] },
  // Quarterly - Tank Exterior Inspection
  { labelKey: "tankExteriorStructureCondition", frequencies: ["quarterly"] },
  { labelKey: "areaFreeCombustibleStorage", frequencies: ["quarterly"] },
  { labelKey: "areaFreeAcceleratedCorrosion", frequencies: ["quarterly"] },
  { labelKey: "tankFreeIceBuildup", frequencies: ["quarterly"] },
  { labelKey: "embankmentsFreeErosion", frequencies: ["quarterly"] },
  // Quarterly (Cold Weather)
  { labelKey: "heatingSystemSupervised", frequencies: ["quarterly"] },
  // Quarterly - Control Valves (Electronically Supervised)
  { labelKey: "valveElectronicSupervised", frequencies: ["quarterly"] },
  // Quarterly - Surrounding Area
  { labelKey: "surroundingFreeCombustibles", frequencies: ["quarterly"] },
  { labelKey: "surroundingFreeCorrosionMaterial", frequencies: ["quarterly"] },
  { labelKey: "surroundingFreeIce", frequencies: ["quarterly"] },
  { labelKey: "embankmentsFreeErosionQuarterly", frequencies: ["quarterly"] },
  // Annual
  { labelKey: "hoopsGrillageCondition", frequencies: ["annually"] },
  { labelKey: "paintedCoatedSurfacesCondition", frequencies: ["annually"] },
  { labelKey: "expansionJointsNotCrackedLeaking", frequencies: ["annually"] },
  // Annual - Valve Status Test
  { labelKey: "valveFullRangeMotion", frequencies: ["annually"] },
  { labelKey: "valveStatusTestOpen", frequencies: ["annually"] },
  // Annual - Automatic Tank Fill Valve Test
  { labelKey: "fillValveActuatedLowLevel", frequencies: ["annually"] },
  { labelKey: "measureRecordRefillRate", frequencies: ["annually"] },
  // Three Years - Steel Tank Interior (Without Corrosion Protection)
  { labelKey: "siltRemovedEvaluation", frequencies: ["three_years"] },
  { labelKey: "interiorFreePittingCorrosion", frequencies: ["three_years"] },
  { labelKey: "interiorFreeWasteDebris", frequencies: ["three_years"] },
  { labelKey: "interiorCoatingIntact", frequencies: ["three_years"] },
  { labelKey: "tankFloorFreeDents", frequencies: ["three_years"] },
  { labelKey: "heatingSystemComponentsCondition", frequencies: ["three_years"] },
  { labelKey: "antiVortexPlateCondition", frequencies: ["three_years"] },
  // Five Years - Interior Inspection (All Other Tank Types)
  { labelKey: "siltRemovedEvaluationFiveYear", frequencies: ["five_years"] },
  { labelKey: "interiorFreePittingCorrosionFiveYear", frequencies: ["five_years"] },
  { labelKey: "interiorFreeWasteDebrisFiveYear", frequencies: ["five_years"] },
  { labelKey: "interiorCoatingIntactFiveYear", frequencies: ["five_years"] },
  { labelKey: "tankFloorFreeDentsFiveYear", frequencies: ["five_years"] },
  { labelKey: "heatingSystemConditionFiveYear", frequencies: ["five_years"] },
  { labelKey: "antiVortexPlateConditionFiveYear", frequencies: ["five_years"] },
  // Five Years - Check Valves
  { labelKey: "checkValveInternalFreeCondition", frequencies: ["five_years"] },
  // Five Years - Tests
  { labelKey: "levelIndicatorsAccurateFree", frequencies: ["five_years"] },
  { labelKey: "gaugesTestedReplaced", frequencies: ["five_years"] },
  // Test Prior to Heating Season
  { labelKey: "heatingSystemProperOrder", frequencies: ["annually"] },
  { labelKey: "lowWaterTempSignals", frequencies: ["annually"] },
  { labelKey: "highWaterTempSignals", frequencies: ["annually"] },
  // Test Monthly - Water Temperature
  { labelKey: "lowTempAlarmWorking", frequencies: ["monthly"] },
  { labelKey: "highTempLimitSwitchWorking", frequencies: ["monthly"] },
  // Test Semiannual
  { labelKey: "highLowWaterLevelSignals", frequencies: ["semiannually"] },
  // Maintenance
  { labelKey: "tankMaintainedFull", frequencies: ["weekly", "monthly", "quarterly", "annually"] },
  { labelKey: "hatchCoversFastened", frequencies: ["quarterly", "annually"] },
  { labelKey: "wasteMaterialInOnTank", frequencies: ["quarterly", "annually"] },
  { labelKey: "cleanStrainersQuarterly", frequencies: ["quarterly"] },
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
