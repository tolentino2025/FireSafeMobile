import { ChecklistItem, InspectionType } from "@/contexts/InspectionContext";
import { TranslationKeys } from "@/constants/i18n";

type ChecklistItemKey = keyof TranslationKeys["checklistItems"];

interface ChecklistTemplate {
  labelKey: ChecklistItemKey;
  hasPsi?: boolean;
}

const wetPipeChecklist: ChecklistTemplate[] = [
  { labelKey: "controlValvesCorrectPosition" },
  { labelKey: "controlValvesSealed" },
  { labelKey: "controlValvesAccessible" },
  { labelKey: "pivsWithWrenches" },
  { labelKey: "freeFromDamageLeaks" },
  { labelKey: "properSignage" },
  { labelKey: "gaugesGoodCondition" },
  { labelKey: "normalAirPressureMaintained", hasPsi: true },
  { labelKey: "enclosureMinTemp" },
  { labelKey: "isolationValvesOpen" },
  { labelKey: "rpaReliefValve" },
  { labelKey: "masterPrdDownstreamPressure", hasPsi: true },
  { labelKey: "masterPrdSupplyPressure", hasPsi: true },
  { labelKey: "masterPrdFreeFromDamage" },
  { labelKey: "masterPrdTrimGoodCondition" },
];

const dryPipeChecklist: ChecklistTemplate[] = [
  { labelKey: "controlValvesCorrectPosition" },
  { labelKey: "controlValvesSealed" },
  { labelKey: "controlValvesAccessible" },
  { labelKey: "freeFromDamageLeaks" },
  { labelKey: "properSignage" },
  { labelKey: "gaugesGoodCondition" },
  { labelKey: "airPressureMaintained", hasPsi: true },
  { labelKey: "systemWaterPressureMaintained", hasPsi: true },
  { labelKey: "dryPipeValveEnclosureTemp" },
  { labelKey: "lowAirPressureAlarm" },
  { labelKey: "quickOpeningDevice" },
  { labelKey: "intermediateDryPendentSprinklers" },
];

const pumpWeeklyChecklist: ChecklistTemplate[] = [
  { labelKey: "pumpHouseConditions" },
  { labelKey: "pumpSuctionDischargePressure", hasPsi: true },
  { labelKey: "pumpPackingGlands" },
  { labelKey: "systemValvesProperPosition" },
  { labelKey: "suctionReservoirFull" },
  { labelKey: "wetPitSuctionScreen" },
  { labelKey: "controllerSelectorSwitch" },
  { labelKey: "controllerPilotLights" },
  { labelKey: "dieselFuelTank" },
  { labelKey: "batteryTerminals" },
  { labelKey: "batteryChargerOperating" },
  { labelKey: "pumpRoomTemp" },
];

const pumpMonthlyChecklist: ChecklistTemplate[] = [
  ...pumpWeeklyChecklist,
  { labelKey: "pumpStartedRun10Min" },
  { labelKey: "suctionPressureRecorded", hasPsi: true },
  { labelKey: "dischargePressureRecorded", hasPsi: true },
  { labelKey: "pumpSpeed" },
  { labelKey: "pumpBearingTemp" },
  { labelKey: "packingGlandDripRate" },
  { labelKey: "unusualNoiseVibration" },
  { labelKey: "dieselEngineCooling" },
];

const hydrantFlowChecklist: ChecklistTemplate[] = [
  { labelKey: "flowHydrantId" },
  { labelKey: "testHydrantId" },
  { labelKey: "staticPressureRecorded", hasPsi: true },
  { labelKey: "residualPressureRecorded", hasPsi: true },
  { labelKey: "pitotPressureRecorded", hasPsi: true },
  { labelKey: "flowRateCalculated" },
  { labelKey: "hydrantsAccessibleOperational" },
  { labelKey: "capsPlugsInPlace" },
  { labelKey: "hydrantWrenchAvailable" },
];

const waterTankChecklist: ChecklistTemplate[] = [
  { labelKey: "tankWaterLevelCorrect" },
  { labelKey: "tankTempGaugeOperational" },
  { labelKey: "waterTempAbove40" },
  { labelKey: "tankHeatingSystem" },
  { labelKey: "tankExteriorCondition" },
  { labelKey: "tankSupportsCondition" },
  { labelKey: "tankAccessoriesSecure" },
  { labelKey: "cathodicProtection" },
  { labelKey: "tankVentsUnobstructed" },
  { labelKey: "overflowPipeUnobstructed" },
];

const standpipeChecklist: ChecklistTemplate[] = [
  { labelKey: "hoseConnectionsAccessible" },
  { labelKey: "hoseConnectionsNotObstructed" },
  { labelKey: "threadsGoodCondition" },
  { labelKey: "pressureReducingValves" },
  { labelKey: "hoseAvailable" },
  { labelKey: "hoseGoodCondition" },
  { labelKey: "hoseRackGoodCondition" },
  { labelKey: "cabinetDoorsOperate" },
  { labelKey: "fdcAccessible" },
  { labelKey: "fdcCapsInPlace" },
  { labelKey: "fdcCheckValve" },
];

const genericChecklist: ChecklistTemplate[] = [
  { labelKey: "systemControlValvesCorrectPosition" },
  { labelKey: "valvesSealedLockedSupervised" },
  { labelKey: "systemFreeFromDamageLeaks" },
  { labelKey: "gaugesGoodCondition" },
  { labelKey: "systemPressureNormal", hasPsi: true },
  { labelKey: "allComponentsAccessible" },
  { labelKey: "properSignageInPlace" },
  { labelKey: "systemEnclosureConditions" },
];

const checklistsByType: Record<InspectionType, ChecklistTemplate[]> = {
  wet_pipe: wetPipeChecklist,
  dry_pipe: dryPipeChecklist,
  preaction_deluge: [...dryPipeChecklist, { labelKey: "detectionSystemOperational" }],
  foam_water: [...wetPipeChecklist, { labelKey: "foamConcentrateLevel" }],
  water_spray: genericChecklist,
  water_mist: genericChecklist,
  pump_weekly: pumpWeeklyChecklist,
  pump_monthly: pumpMonthlyChecklist,
  pump_annual: [...pumpMonthlyChecklist, { labelKey: "annualPerformanceTest" }],
  aboveground: genericChecklist,
  underground: genericChecklist,
  hydrant_flow: hydrantFlowChecklist,
  water_tank: waterTankChecklist,
  hazard_eval: genericChecklist,
  standpipe: standpipeChecklist,
};

export function getChecklistForType(
  type: InspectionType,
  translations: TranslationKeys["checklistItems"]
): ChecklistItem[] {
  const template = checklistsByType[type] || genericChecklist;
  return template.map((item, index) => ({
    id: `${type}_${index}_${Date.now()}`,
    label: translations[item.labelKey],
    value: null,
    psiValue: item.hasPsi ? "" : undefined,
  }));
}
