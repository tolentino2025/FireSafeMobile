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
  // Daily - Valve Enclosure (Cold Weather)
  { labelKey: "wpEnclosureMinTemp", frequencies: ["daily"] },
  // Weekly - Backflow
  { labelKey: "wpIsolationValvesOpenLocked", frequencies: ["weekly"] },
  { labelKey: "wpRpaReliefValveOperating", frequencies: ["weekly"] },
  // Weekly - Master PRD
  { labelKey: "wpMasterPrdDownstreamPressure", hasPsi: true, frequencies: ["weekly"] },
  { labelKey: "wpMasterPrdSupplyPressure", hasPsi: true, frequencies: ["weekly"] },
  { labelKey: "wpMasterPrdFreeDamageLeaks", frequencies: ["weekly"] },
  { labelKey: "wpMasterPrdTrimCondition", frequencies: ["weekly"] },
  // Weekly - Control Valves
  { labelKey: "wpControlValvesCorrectPosition", frequencies: ["weekly"] },
  { labelKey: "wpControlValvesSealed", frequencies: ["weekly"] },
  { labelKey: "wpControlValvesAccessible", frequencies: ["weekly"] },
  { labelKey: "wpPivsCorrectWrenches", frequencies: ["weekly"] },
  { labelKey: "wpControlValvesFreeFromDamage", frequencies: ["weekly"] },
  { labelKey: "wpControlValvesProperSignage", frequencies: ["weekly"] },
  // Monthly - Gauges
  { labelKey: "wpGaugesGoodCondition", frequencies: ["monthly"] },
  { labelKey: "wpGaugesAirPressureUnsupervised", hasPsi: true, frequencies: ["monthly"] },
  // Monthly - Control Valves (Locked/Supervised)
  { labelKey: "wpMonthlyValvesCorrectPosition", frequencies: ["monthly"] },
  { labelKey: "wpMonthlyValvesLockedSupervised", frequencies: ["monthly"] },
  { labelKey: "wpMonthlyPivsWrenches", frequencies: ["monthly"] },
  { labelKey: "wpMonthlyValvesAccessible", frequencies: ["monthly"] },
  { labelKey: "wpMonthlyValvesFreeDamage", frequencies: ["monthly"] },
  { labelKey: "wpMonthlyValvesSignage", frequencies: ["monthly"] },
  // Quarterly
  { labelKey: "wpWaterflowAlarmFreeDamage", frequencies: ["quarterly"] },
  { labelKey: "wpGaugesAirPressureSupervised", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "wpGaugesWaterPressure", hasPsi: true, frequencies: ["quarterly"] },
  // Quarterly - Alarm Valves/Riser Check
  { labelKey: "wpAlarmValveGaugesNormal", frequencies: ["quarterly"] },
  { labelKey: "wpAlarmValveFreeDamage", frequencies: ["quarterly"] },
  { labelKey: "wpAlarmValveCorrectPosition", frequencies: ["quarterly"] },
  { labelKey: "wpRetardChamberNotLeaking", frequencies: ["quarterly"] },
  // Quarterly - Control Valves (Electronically Supervised)
  { labelKey: "wpElectronicValvesPosition", frequencies: ["quarterly"] },
  { labelKey: "wpElectronicValvesSupervised", frequencies: ["quarterly"] },
  { labelKey: "wpElectronicValvesAccessible", frequencies: ["quarterly"] },
  { labelKey: "wpElectronicPivsWrenches", frequencies: ["quarterly"] },
  { labelKey: "wpElectronicValvesFreeDamage", frequencies: ["quarterly"] },
  { labelKey: "wpElectronicValvesSignage", frequencies: ["quarterly"] },
  // Quarterly - FDC
  { labelKey: "wpFdcVisibleAccessible", frequencies: ["quarterly"] },
  { labelKey: "wpFdcCouplingsSwivelsOperate", frequencies: ["quarterly"] },
  { labelKey: "wpFdcPlugsCapsInPlace", frequencies: ["quarterly"] },
  { labelKey: "wpFdcGasketsNotDamaged", frequencies: ["quarterly"] },
  { labelKey: "wpFdcAutoDrainOperating", frequencies: ["quarterly"] },
  { labelKey: "wpFdcSignsInPlace", frequencies: ["quarterly"] },
  { labelKey: "wpFdcInteriorClearObstructions", frequencies: ["quarterly"] },
  { labelKey: "wpFdcClapperFunctional", frequencies: ["quarterly"] },
  { labelKey: "wpFdcCheckValveNotLeaking", frequencies: ["quarterly"] },
  { labelKey: "wpFdcPipingUndamaged", frequencies: ["quarterly"] },
  // Quarterly - PRV
  { labelKey: "wpPrvOpenNotLeaking", frequencies: ["quarterly"] },
  { labelKey: "wpPrvMaintainingDownstream", frequencies: ["quarterly"] },
  { labelKey: "wpPrvGoodConditionHandwheel", frequencies: ["quarterly"] },
  // Annual
  { labelKey: "wpHydraulicDesignInfoAttached", frequencies: ["annually"] },
  // Annual - Sprinklers
  { labelKey: "wpSprinklersNoDamageLeaks", frequencies: ["annually"] },
  { labelKey: "wpSprinklersFreeCorrosion", frequencies: ["annually"] },
  { labelKey: "wpSprinklersProperOrientation", frequencies: ["annually"] },
  { labelKey: "wpSprinklersFluidInBulbs", frequencies: ["annually"] },
  { labelKey: "wpSpareSprinklersAvailable", frequencies: ["annually"] },
  { labelKey: "wpSprinklersNoUnauthorizedPaint", frequencies: ["annually"] },
  { labelKey: "wpSprinklersFreeOfDust", frequencies: ["annually"] },
  { labelKey: "wpEscutcheonsInstalled", frequencies: ["annually"] },
  { labelKey: "wpSprinklersClearanceFromStorage", frequencies: ["annually"] },
  // Annual - Hangers/Seismic
  { labelKey: "wpHangersNotDamagedLoose", frequencies: ["annually"] },
  // Annual - Pipes and Fittings
  { labelKey: "wpPipesGoodCondition", frequencies: ["annually"] },
  { labelKey: "wpPipesNoLeaksDamage", frequencies: ["annually"] },
  { labelKey: "wpPipesCorrectAlignment", frequencies: ["annually"] },
  { labelKey: "wpHeatTracePerManufacturer", frequencies: ["annually"] },
  // Annual - Building
  { labelKey: "wpWetPipingNotExposedFreezing", frequencies: ["annually"] },
  // Annual - FDC
  { labelKey: "wpFdcInteriorLockedFreeObstructions", frequencies: ["annually"] },
  // Five Years
  { labelKey: "wpAlarmValveInterior", frequencies: ["five_years"] },
  { labelKey: "wpCheckValveInternal", frequencies: ["five_years"] },
  { labelKey: "wpObstructionInspection", frequencies: ["five_years"] },
  { labelKey: "wpBackflowInternal", frequencies: ["five_years"] },
  // Test - Quarterly
  { labelKey: "wpTestAlarmWaterMotorGong", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "wpTestMainDrainQuarterly", frequencies: ["quarterly"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
  ]},
  { labelKey: "wpTestMainDrainResultsDiffer", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "wpTestMasterPrdPartialFlow", frequencies: ["quarterly"], isTestSection: true },
  // Test - Semiannual
  { labelKey: "wpTestAlarmDeviceInspector", frequencies: ["semiannually"], isTestSection: true },
  { labelKey: "wpTestValveSupervisorySwitch", frequencies: ["semiannually"], isTestSection: true },
  // Test - Annual
  { labelKey: "wpTestControlValvesFullRange", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wpTestBackflowForwardFlow", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wpTestValveStatus", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wpTestAntifreezeSolution", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wpTestPrvPartialFlow", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wpTestSupervisorySwitches", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wpTestMainDrainAnnual", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
  ]},
  { labelKey: "wpTestMainDrainAnnualDiffer", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wpTestMasterPrdFullFlow", frequencies: ["annually"], isTestSection: true },
  // Test - Five Years
  { labelKey: "wpTestGaugesTestedReplaced", frequencies: ["five_years"], isTestSection: true },
  { labelKey: "wpTestPrvFullFlow", frequencies: ["five_years"], isTestSection: true },
  { labelKey: "wpTestFdcHydrostatic", frequencies: ["five_years"], isTestSection: true },
  // Maintenance
  { labelKey: "wpMaintSprinklersTested", frequencies: ["annually"] },
  { labelKey: "wpMaintOsyStemsLubricated", frequencies: ["annually"] },
];

const dryPipeChecklist: ChecklistTemplate[] = [
  // Daily - Dry Pipe Valve (Cold Weather)
  { labelKey: "dpEnclosureMinTemp", frequencies: ["daily"] },
  // Weekly - Backflow
  { labelKey: "dpIsolationValvesOpenLocked", frequencies: ["weekly"] },
  { labelKey: "dpRpaReliefValveOperating", frequencies: ["weekly"] },
  // Weekly - Control Valves
  { labelKey: "dpControlValvesCorrectPosition", frequencies: ["weekly"] },
  { labelKey: "dpControlValvesSealed", frequencies: ["weekly"] },
  { labelKey: "dpControlValvesAccessible", frequencies: ["weekly"] },
  { labelKey: "dpPivsCorrectWrenches", frequencies: ["weekly"] },
  { labelKey: "dpControlValvesFreeFromDamage", frequencies: ["weekly"] },
  { labelKey: "dpControlValvesProperSignage", frequencies: ["weekly"] },
  // Weekly - Dry Pipe Valve
  { labelKey: "dpValveEnclosureTemp", frequencies: ["weekly"] },
  // Weekly - Master PRD
  { labelKey: "dpMasterPrdDownstreamPressure", hasPsi: true, frequencies: ["weekly"] },
  { labelKey: "dpMasterPrdSupplyPressure", hasPsi: true, frequencies: ["weekly"] },
  { labelKey: "dpMasterPrdFreeDamageLeaks", frequencies: ["weekly"] },
  { labelKey: "dpMasterPrdTrimCondition", frequencies: ["weekly"] },
  // Monthly - Gauges
  { labelKey: "dpGaugesGoodCondition", frequencies: ["monthly"] },
  { labelKey: "dpDryValveRatioUnsupervised", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "dpQuickOpeningGaugeUnsupervised", hasPsi: true, frequencies: ["monthly"] },
  // Monthly - Control Valves (Locked/Supervised)
  { labelKey: "dpMonthlyValvesCorrectPosition", frequencies: ["monthly"] },
  { labelKey: "dpMonthlyValvesLockedSupervised", frequencies: ["monthly"] },
  { labelKey: "dpMonthlyValvesAccessible", frequencies: ["monthly"] },
  { labelKey: "dpMonthlyPivsWrenches", frequencies: ["monthly"] },
  { labelKey: "dpMonthlyValvesFreeDamage", frequencies: ["monthly"] },
  { labelKey: "dpMonthlyValvesSignage", frequencies: ["monthly"] },
  // Monthly - Dry Pipe Valve
  { labelKey: "dpValveExteriorFreeDamage", frequencies: ["monthly"] },
  { labelKey: "dpValveTrimPosition", frequencies: ["monthly"] },
  { labelKey: "dpValveChamberNotLeaking", frequencies: ["monthly"] },
  // Quarterly
  { labelKey: "dpWaterflowAlarmFreeDamage", frequencies: ["quarterly"] },
  { labelKey: "dpSupplyGaugeNormal", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "dpDryValveRatioSupervised", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "dpQuickOpeningGaugeSupervised", hasPsi: true, frequencies: ["quarterly"] },
  // Quarterly - FDC
  { labelKey: "dpFdcVisibleAccessible", frequencies: ["quarterly"] },
  { labelKey: "dpFdcCouplingsSwivelsOperate", frequencies: ["quarterly"] },
  { labelKey: "dpFdcPlugsCapsInPlace", frequencies: ["quarterly"] },
  { labelKey: "dpFdcGasketsNotDamaged", frequencies: ["quarterly"] },
  { labelKey: "dpFdcSignsInPlace", frequencies: ["quarterly"] },
  { labelKey: "dpFdcAutoDrainOperating", frequencies: ["quarterly"] },
  { labelKey: "dpFdcClapperFunctional", frequencies: ["quarterly"] },
  { labelKey: "dpFdcInteriorClearObstructions", frequencies: ["quarterly"] },
  { labelKey: "dpFdcCheckValveNotLeaking", frequencies: ["quarterly"] },
  { labelKey: "dpFdcPipingUndamaged", frequencies: ["quarterly"] },
  // Quarterly - PRV
  { labelKey: "dpPrvOpenNotLeaking", frequencies: ["quarterly"] },
  { labelKey: "dpPrvMaintainingDownstream", frequencies: ["quarterly"] },
  { labelKey: "dpPrvGoodConditionHandwheel", frequencies: ["quarterly"] },
  // Quarterly - Control Valves (Electronically Supervised)
  { labelKey: "dpElectronicValvesPosition", frequencies: ["quarterly"] },
  { labelKey: "dpElectronicValvesSupervised", frequencies: ["quarterly"] },
  { labelKey: "dpElectronicValvesAccessible", frequencies: ["quarterly"] },
  { labelKey: "dpElectronicPivsWrenches", frequencies: ["quarterly"] },
  { labelKey: "dpElectronicValvesFreeDamage", frequencies: ["quarterly"] },
  { labelKey: "dpElectronicValvesSignage", frequencies: ["quarterly"] },
  // Annual
  { labelKey: "dpHydraulicDesignInfoAttached", frequencies: ["annually"] },
  // Annual - Sprinklers
  { labelKey: "dpSprinklersNoDamageLeaks", frequencies: ["annually"] },
  { labelKey: "dpSprinklersFreeCorrosion", frequencies: ["annually"] },
  { labelKey: "dpSprinklersProperOrientation", frequencies: ["annually"] },
  { labelKey: "dpSprinklersFluidInBulbs", frequencies: ["annually"] },
  { labelKey: "dpSpareSprinklersAvailable", frequencies: ["annually"] },
  { labelKey: "dpSprinklersNoUnauthorizedPaint", frequencies: ["annually"] },
  { labelKey: "dpSprinklersFreeOfDust", frequencies: ["annually"] },
  { labelKey: "dpEscutcheonsInstalled", frequencies: ["annually"] },
  { labelKey: "dpSprinklersClearanceFromStorage", frequencies: ["annually"] },
  // Annual - Hangers/Seismic
  { labelKey: "dpHangersNotDamagedLoose", frequencies: ["annually"] },
  // Annual - Pipes and Fittings
  { labelKey: "dpPipesGoodCondition", frequencies: ["annually"] },
  { labelKey: "dpPipesNoLeaksDamage", frequencies: ["annually"] },
  { labelKey: "dpPipesCorrectAlignment", frequencies: ["annually"] },
  // Annual - FDC
  { labelKey: "dpFdcInteriorLockedFreeObstructions", frequencies: ["annually"] },
  // Annual - Dry Pipe Valve
  { labelKey: "dpValveInteriorAfterTrip", frequencies: ["annually"] },
  // Annual - Building
  { labelKey: "dpBuildingOpeningsClosed", frequencies: ["annually"] },
  { labelKey: "dpHeatTracePerManufacturer", frequencies: ["annually"] },
  { labelKey: "dpLowTempAlarmFreeDamage", frequencies: ["annually"] },
  // Five Years
  { labelKey: "dpObstructionInspection", frequencies: ["five_years"] },
  { labelKey: "dpCheckValveInternal", frequencies: ["five_years"] },
  { labelKey: "dpStrainersFiltersInternal", frequencies: ["five_years"] },
  { labelKey: "dpBackflowInternal", frequencies: ["five_years"] },
  // Test - Quarterly
  { labelKey: "dpTestAlarmWaterMotorGong", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "dpTestMainDrainQuarterly", frequencies: ["quarterly"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
  ]},
  { labelKey: "dpTestMainDrainResultsDiffer", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "dpTestPrimingWaterLevel", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "dpTestQuickOpeningDevice", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "dpTestMasterPrdPartialFlow", frequencies: ["quarterly"], isTestSection: true },
  // Test - Semiannual
  { labelKey: "dpTestValveSupervisorySwitch", frequencies: ["semiannually"], isTestSection: true },
  { labelKey: "dpTestAlarmInspectorTest", frequencies: ["semiannually"], isTestSection: true },
  // Test - Annual
  { labelKey: "dpTestSupervisorySwitches", frequencies: ["annually"], isTestSection: true },
  { labelKey: "dpTestLowTempAlarm", frequencies: ["annually"], isTestSection: true },
  { labelKey: "dpTestLowAirAlarm", frequencies: ["annually"], isTestSection: true },
  { labelKey: "dpTestAirMaintenanceDevice", frequencies: ["annually"], isTestSection: true },
  { labelKey: "dpTestControlValvesFullRange", frequencies: ["annually"], isTestSection: true },
  { labelKey: "dpTestBackflowForwardFlow", frequencies: ["annually"], isTestSection: true },
  { labelKey: "dpTestValveStatus", frequencies: ["annually"], isTestSection: true },
  { labelKey: "dpTestPrvPartialFlow", frequencies: ["annually"], isTestSection: true },
  { labelKey: "dpTestMainDrainAnnual", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
  ]},
  { labelKey: "dpTestMainDrainAnnualDiffer", frequencies: ["annually"], isTestSection: true },
  // Test - Annual Dry Pipe Valve Trip Test (Partial Flow)
  { labelKey: "dpTestDryPipeTripPartial", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "waterPressurePsi", type: "psi", unit: "psi" },
    { labelKey: "airPressurePsi", type: "psi", unit: "psi" },
    { labelKey: "trippingAirPsi", type: "psi", unit: "psi" },
    { labelKey: "tripTimeSec", type: "seconds", unit: "sec" },
  ]},
  { labelKey: "dpTestDryPipeTripPartialResults", frequencies: ["annually"], isTestSection: true },
  // Test - Annual Master PRD
  { labelKey: "dpTestMasterPrdFullFlow", frequencies: ["annually"], isTestSection: true },
  // Test - Three Years
  { labelKey: "dpTestDryPipeTripFull", frequencies: ["three_years"], isTestSection: true, numericFields: [
    { labelKey: "waterPressurePsi", type: "psi", unit: "psi" },
    { labelKey: "airPressurePsi", type: "psi", unit: "psi" },
    { labelKey: "trippingAirPsi", type: "psi", unit: "psi" },
    { labelKey: "tripTimeSec", type: "seconds", unit: "sec" },
    { labelKey: "waterDeliveryTimeMin", type: "minutes", unit: "min" },
  ]},
  { labelKey: "dpTestDryPipeTripFullResults", frequencies: ["three_years"], isTestSection: true },
  { labelKey: "dpTestDryPipeLeakage", frequencies: ["three_years"], isTestSection: true },
  // Test - Five Years
  { labelKey: "dpTestGaugesTestedReplaced", frequencies: ["five_years"], isTestSection: true },
  { labelKey: "dpTestPrvFlowTest", frequencies: ["five_years"], isTestSection: true },
  { labelKey: "dpTestFdcHydrostatic", frequencies: ["five_years"], isTestSection: true },
  // Maintenance
  { labelKey: "dpMaintSprinklersTested", frequencies: ["annually"] },
  { labelKey: "dpMaintOsyStemsLubricated", frequencies: ["annually"] },
  { labelKey: "dpMaintAuxiliaryDrains", frequencies: ["annually"] },
];

const preactionDelugeChecklist: ChecklistTemplate[] = [
  // Daily - Preaction/Deluge Valve (Cold Weather)
  { labelKey: "pdEnclosureMinTemp", frequencies: ["daily"] },
  // Weekly - Backflow
  { labelKey: "pdIsolationValvesOpenLocked", frequencies: ["weekly"] },
  { labelKey: "pdRpaReliefValveOperating", frequencies: ["weekly"] },
  // Weekly - Control Valves
  { labelKey: "pdControlValvesCorrectPosition", frequencies: ["weekly"] },
  { labelKey: "pdControlValvesSealed", frequencies: ["weekly"] },
  { labelKey: "pdControlValvesAccessible", frequencies: ["weekly"] },
  { labelKey: "pdPivsCorrectWrenches", frequencies: ["weekly"] },
  { labelKey: "pdControlValvesFreeFromDamage", frequencies: ["weekly"] },
  { labelKey: "pdControlValvesProperSignage", frequencies: ["weekly"] },
  // Weekly - Preaction/Deluge Valve
  { labelKey: "pdValveEnclosureTemp", frequencies: ["weekly"] },
  // Weekly - Master PRD
  { labelKey: "pdMasterPrdDownstreamPressure", hasPsi: true, frequencies: ["weekly"] },
  { labelKey: "pdMasterPrdSupplyPressure", hasPsi: true, frequencies: ["weekly"] },
  { labelKey: "pdMasterPrdFreeDamageLeaks", frequencies: ["weekly"] },
  { labelKey: "pdMasterPrdTrimCondition", frequencies: ["weekly"] },
  // Monthly - Gauges
  { labelKey: "pdGaugesOperableNotDamaged", frequencies: ["monthly"] },
  { labelKey: "pdGaugesAirPressureUnsupervised", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "pdDryValveRatioUnsupervised", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "pdQuickOpeningGaugeUnsupervised", hasPsi: true, frequencies: ["monthly"] },
  // Monthly - Control Valves (Locked/Supervised)
  { labelKey: "pdMonthlyValvesCorrectPosition", frequencies: ["monthly"] },
  { labelKey: "pdMonthlyValvesLockedSupervised", frequencies: ["monthly"] },
  { labelKey: "pdMonthlyValvesAccessible", frequencies: ["monthly"] },
  { labelKey: "pdMonthlyPivsWrenches", frequencies: ["monthly"] },
  { labelKey: "pdMonthlyValvesFreeDamage", frequencies: ["monthly"] },
  { labelKey: "pdMonthlyValvesSignage", frequencies: ["monthly"] },
  // Monthly - Preaction/Deluge Valve
  { labelKey: "pdValveFreeDamage", frequencies: ["monthly"] },
  { labelKey: "pdValveElectricalInService", frequencies: ["monthly"] },
  { labelKey: "pdValveTrimPosition", frequencies: ["monthly"] },
  { labelKey: "pdValveSeatNotLeaking", frequencies: ["monthly"] },
  // Quarterly - Gauges (Supervised)
  { labelKey: "pdGaugesAirPressureSupervised", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "pdDryValveRatioSupervised", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "pdQuickOpeningGaugeSupervised", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "pdSupplyGaugeNormal", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "pdWaterflowAlarmFreeDamage", frequencies: ["quarterly"] },
  // Quarterly - FDC
  { labelKey: "pdFdcVisibleAccessible", frequencies: ["quarterly"] },
  { labelKey: "pdFdcCouplingsSwivelsOperate", frequencies: ["quarterly"] },
  { labelKey: "pdFdcPlugsCapsInPlace", frequencies: ["quarterly"] },
  { labelKey: "pdFdcGasketsNotDamaged", frequencies: ["quarterly"] },
  { labelKey: "pdFdcSignsInPlace", frequencies: ["quarterly"] },
  { labelKey: "pdFdcCheckValveNotLeaking", frequencies: ["quarterly"] },
  { labelKey: "pdFdcAutoDrainOperating", frequencies: ["quarterly"] },
  { labelKey: "pdFdcClapperFunctional", frequencies: ["quarterly"] },
  { labelKey: "pdFdcInteriorClearObstructions", frequencies: ["quarterly"] },
  { labelKey: "pdFdcPipingUndamaged", frequencies: ["quarterly"] },
  // Quarterly - PRV
  { labelKey: "pdPrvOpenNotLeaking", frequencies: ["quarterly"] },
  { labelKey: "pdPrvMaintainingDownstream", frequencies: ["quarterly"] },
  { labelKey: "pdPrvGoodConditionHandwheel", frequencies: ["quarterly"] },
  // Quarterly - Control Valves (Electronically Supervised)
  { labelKey: "pdElectronicValvesPosition", frequencies: ["quarterly"] },
  { labelKey: "pdElectronicValvesSupervised", frequencies: ["quarterly"] },
  { labelKey: "pdElectronicValvesAccessible", frequencies: ["quarterly"] },
  { labelKey: "pdElectronicPivsWrenches", frequencies: ["quarterly"] },
  { labelKey: "pdElectronicValvesFreeDamage", frequencies: ["quarterly"] },
  { labelKey: "pdElectronicValvesSignage", frequencies: ["quarterly"] },
  // Annual
  { labelKey: "pdHydraulicDesignInfoAttached", frequencies: ["annually"] },
  // Annual - Sprinklers
  { labelKey: "pdSprinklersNoDamageLeaks", frequencies: ["annually"] },
  { labelKey: "pdSprinklersFreeCorrosion", frequencies: ["annually"] },
  { labelKey: "pdSprinklersProperOrientation", frequencies: ["annually"] },
  { labelKey: "pdSprinklersFluidInBulbs", frequencies: ["annually"] },
  { labelKey: "pdSpareSprinklersAvailable", frequencies: ["annually"] },
  { labelKey: "pdSprinklersFreeOfDust", frequencies: ["annually"] },
  { labelKey: "pdSprinklersNoUnauthorizedPaint", frequencies: ["annually"] },
  { labelKey: "pdEscutcheonsInstalled", frequencies: ["annually"] },
  { labelKey: "pdSprinklersClearanceFromStorage", frequencies: ["annually"] },
  // Annual - Hangers/Seismic
  { labelKey: "pdHangersNotDamagedLoose", frequencies: ["annually"] },
  // Annual - Pipes and Fittings
  { labelKey: "pdPipesGoodCondition", frequencies: ["annually"] },
  { labelKey: "pdPipesNoLeaksDamage", frequencies: ["annually"] },
  { labelKey: "pdPipesCorrectAlignment", frequencies: ["annually"] },
  // Annual - FDC
  { labelKey: "pdFdcInteriorLockedFreeObstructions", frequencies: ["annually"] },
  // Annual - Preaction/Deluge Valve
  { labelKey: "pdValveInteriorAfterTrip", frequencies: ["annually"] },
  { labelKey: "pdDetectionDeviceCondition", frequencies: ["annually"] },
  // Annual - Building
  { labelKey: "pdBuildingOpeningsClosed", frequencies: ["annually"] },
  { labelKey: "pdHeatTracePerManufacturer", frequencies: ["annually"] },
  { labelKey: "pdLowTempAlarmFreeDamage", frequencies: ["annually"] },
  // Five Years
  { labelKey: "pdObstructionInspection", frequencies: ["five_years"] },
  { labelKey: "pdCheckValveInternal", frequencies: ["five_years"] },
  { labelKey: "pdStrainersFiltersInternal", frequencies: ["five_years"] },
  { labelKey: "pdValvesResettableInternal", frequencies: ["five_years"] },
  { labelKey: "pdBackflowInternal", frequencies: ["five_years"] },
  // Test - Quarterly
  { labelKey: "pdTestAlarmWaterMotorGong", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "pdTestDetectionLowAirSupervisory", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "pdTestMainDrainQuarterly", frequencies: ["quarterly"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
  ]},
  { labelKey: "pdTestMainDrainResultsDiffer", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "pdTestPrimingWaterLevel", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "pdTestLowAirAlarmQuarterly", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "pdTestMasterPrdPartialFlow", frequencies: ["quarterly"], isTestSection: true },
  // Test - Semiannual
  { labelKey: "pdTestValveSupervisorySwitch", frequencies: ["semiannually"], isTestSection: true },
  { labelKey: "pdTestAlarmInspectorTest", frequencies: ["semiannually"], isTestSection: true },
  // Test - Annual
  { labelKey: "pdTestSupervisorySwitches", frequencies: ["annually"], isTestSection: true },
  { labelKey: "pdTestLowTempAlarm", frequencies: ["annually"], isTestSection: true },
  { labelKey: "pdTestControlValvesFullRange", frequencies: ["annually"], isTestSection: true },
  { labelKey: "pdTestPrvPartialFlow", frequencies: ["annually"], isTestSection: true },
  { labelKey: "pdTestAirMaintenanceDevice", frequencies: ["annually"], isTestSection: true },
  { labelKey: "pdTestValveStatus", frequencies: ["annually"], isTestSection: true },
  { labelKey: "pdTestBackflowForwardFlow", frequencies: ["annually"], isTestSection: true },
  { labelKey: "pdTestMainDrainAnnual", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
  ]},
  { labelKey: "pdTestMainDrainAnnualDiffer", frequencies: ["annually"], isTestSection: true },
  // Test - Annual Deluge Full Flow Trip Test
  { labelKey: "pdTestDelugeFullFlowUnobstructed", frequencies: ["annually"], isTestSection: true },
  { labelKey: "pdTestDelugePressureAtValve", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "operatingPsi", type: "psi", unit: "psi" },
  ]},
  { labelKey: "pdTestDelugeCompareHydraulicDesign", frequencies: ["annually"], isTestSection: true },
  { labelKey: "pdTestDelugeManualRelease", frequencies: ["annually"], isTestSection: true },
  { labelKey: "pdTestDelugeValveStatus", frequencies: ["annually"], isTestSection: true },
  { labelKey: "pdTestDelugePressureRemoteNozzle", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "pressurePsi", type: "psi", unit: "psi" },
  ]},
  { labelKey: "pdTestDelugeAirMaintDevice", frequencies: ["annually"], isTestSection: true },
  // Test - Annual Preaction Partial Flow Trip Test
  { labelKey: "pdTestPreactionPartialTrip", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "waterPressurePsi", type: "psi", unit: "psi" },
    { labelKey: "airPressurePsi", type: "psi", unit: "psi" },
    { labelKey: "trippingAirPsi", type: "psi", unit: "psi" },
    { labelKey: "tripTimeSec", type: "seconds", unit: "sec" },
    { labelKey: "waterDeliveryTimeMin", type: "minutes", unit: "min" },
  ]},
  { labelKey: "pdTestPreactionPartialResultsCompared", frequencies: ["annually"], isTestSection: true },
  // Test - Three Years
  { labelKey: "pdTestPreactionFullTrip", frequencies: ["three_years"], isTestSection: true, numericFields: [
    { labelKey: "waterPressurePsi", type: "psi", unit: "psi" },
    { labelKey: "airPressurePsi", type: "psi", unit: "psi" },
    { labelKey: "trippingAirPsi", type: "psi", unit: "psi" },
    { labelKey: "tripTimeSec", type: "seconds", unit: "sec" },
    { labelKey: "waterDeliveryTimeMin", type: "minutes", unit: "min" },
  ]},
  { labelKey: "pdTestPreactionFullResultsCompared", frequencies: ["three_years"], isTestSection: true },
  { labelKey: "pdTestPreactionLeakage", frequencies: ["three_years"], isTestSection: true },
  // Test - Five Years
  { labelKey: "pdTestGaugesTestedReplaced", frequencies: ["five_years"], isTestSection: true },
  { labelKey: "pdTestPrvFlowTest", frequencies: ["five_years"], isTestSection: true },
  { labelKey: "pdTestFdcHydrostatic", frequencies: ["five_years"], isTestSection: true },
  // Maintenance
  { labelKey: "pdMaintSprinklersTested", frequencies: ["annually"] },
  { labelKey: "pdMaintOsyStemsLubricated", frequencies: ["annually"] },
  { labelKey: "pdMaintLeaksFixed", frequencies: ["annually"] },
  { labelKey: "pdMaintValveCleaned", frequencies: ["annually"] },
  { labelKey: "pdMaintAuxiliaryDrains", frequencies: ["annually"] },
];

const foamWaterChecklist: ChecklistTemplate[] = [
  // Daily - Valve Enclosure (Cold Weather)
  { labelKey: "enclosureMinTemp", frequencies: ["daily"] },
  // Weekly - Backflow
  { labelKey: "fwIsolationValvesOpenLocked", frequencies: ["weekly"] },
  { labelKey: "fwRpaReliefValveOperating", frequencies: ["weekly"] },
  // Weekly - Control Valves
  { labelKey: "fwControlValvesCorrectPosition", frequencies: ["weekly"] },
  { labelKey: "fwControlValvesSealed", frequencies: ["weekly"] },
  { labelKey: "fwControlValvesAccessible", frequencies: ["weekly"] },
  { labelKey: "fwPivsCorrectWrenches", frequencies: ["weekly"] },
  { labelKey: "fwControlValvesFreeFromDamage", frequencies: ["weekly"] },
  { labelKey: "fwControlValvesProperSignage", frequencies: ["weekly"] },
  // Weekly - Deluge/Preaction Valve
  { labelKey: "fwDelugeEnclosureMinTemp", frequencies: ["weekly"] },
  // Weekly - Master Pressure-Regulating Device
  { labelKey: "fwMasterPrdDownstreamPressure", hasPsi: true, frequencies: ["weekly"] },
  { labelKey: "fwMasterPrdSupplyPressure", hasPsi: true, frequencies: ["weekly"] },
  { labelKey: "fwMasterPrdFreeDamageLeaks", frequencies: ["weekly"] },
  { labelKey: "fwMasterPrdTrimCondition", frequencies: ["weekly"] },
  // Monthly - Gauges
  { labelKey: "fwGaugesGoodCondition", frequencies: ["monthly"] },
  { labelKey: "fwAirPressureMaintainedUnsupervised", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "fwDryValveRatioUnsupervised", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "fwQuickOpeningGaugeUnsupervised", hasPsi: true, frequencies: ["monthly"] },
  // Monthly - Control Valves (locked/supervised)
  { labelKey: "fwMonthlyValvesCorrectPosition", frequencies: ["monthly"] },
  { labelKey: "fwMonthlyValvesLockedSupervised", frequencies: ["monthly"] },
  { labelKey: "fwMonthlyValvesAccessible", frequencies: ["monthly"] },
  { labelKey: "fwMonthlyPivsWrenches", frequencies: ["monthly"] },
  { labelKey: "fwMonthlyValvesFreeDamage", frequencies: ["monthly"] },
  { labelKey: "fwMonthlyValvesSignage", frequencies: ["monthly"] },
  // Monthly - Deluge/Preaction Valve
  { labelKey: "fwDelugeFreeDamageLeaks", frequencies: ["monthly"] },
  { labelKey: "fwDelugeElectricalInService", frequencies: ["monthly"] },
  { labelKey: "fwDelugeSealNotLeaking", frequencies: ["monthly"] },
  { labelKey: "fwDelugeTrimValvesPosition", frequencies: ["monthly"] },
  // Monthly - Proportioning System
  { labelKey: "fwProportionerConcentrateQty", frequencies: ["monthly"] },
  { labelKey: "fwProportionerStrainers", frequencies: ["monthly"] },
  { labelKey: "fwProportionerVacuumVent", frequencies: ["monthly"] },
  { labelKey: "fwProportionerGauges", frequencies: ["monthly"] },
  { labelKey: "fwProportionerSensingLines", frequencies: ["monthly"] },
  { labelKey: "fwProportionerPumpPower", frequencies: ["monthly"] },
  { labelKey: "fwProportionerFreeCorrosion", frequencies: ["monthly"] },
  { labelKey: "fwProportionerDrainValves", frequencies: ["monthly"] },
  { labelKey: "fwProportionerValvesPosition", frequencies: ["monthly"] },
  // Monthly - Nozzles
  { labelKey: "fwNozzlesInPlaceAimed", frequencies: ["monthly"] },
  { labelKey: "fwNozzlesFreeLoading", frequencies: ["monthly"] },
  { labelKey: "fwNozzlesCapPlugs", frequencies: ["monthly"] },
  // Quarterly - Gauges (supervised)
  { labelKey: "fwAirPressureSupervised", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "fwDryValveRatioSupervised", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "fwQuickOpeningGaugeSupervised", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "fwSupplyGaugeNormal", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "fwAlarmDevicesFreeDamage", frequencies: ["quarterly"] },
  { labelKey: "fwHydraulicSignAttached", frequencies: ["quarterly"] },
  // Quarterly - Alarm Valves/Riser Check
  { labelKey: "fwAlarmValvesPosition", frequencies: ["quarterly"] },
  { labelKey: "fwAlarmValvesFreeDamage", frequencies: ["quarterly"] },
  { labelKey: "fwAlarmValvesAccessible", frequencies: ["quarterly"] },
  { labelKey: "fwRetardChamberNotLeaking", frequencies: ["quarterly"] },
  // Quarterly - Pressure-Reducing Valve
  { labelKey: "fwPrvOpenNotLeaking", frequencies: ["quarterly"] },
  { labelKey: "fwPrvMaintainingPressure", frequencies: ["quarterly"] },
  { labelKey: "fwPrvGoodCondition", frequencies: ["quarterly"] },
  // Quarterly - Foam Concentrate Strainer
  { labelKey: "fwStrainerBlowdownClosed", frequencies: ["quarterly"] },
  // Quarterly - Drainage
  { labelKey: "fwDrainageGoodCondition", frequencies: ["quarterly"] },
  { labelKey: "fwRetentionDikesGoodCondition", frequencies: ["quarterly"] },
  // Quarterly - Control Valves (electronically supervised)
  { labelKey: "fwElectronicValvesPosition", frequencies: ["quarterly"] },
  { labelKey: "fwElectronicValvesSupervised", frequencies: ["quarterly"] },
  { labelKey: "fwElectronicValvesAccessible", frequencies: ["quarterly"] },
  { labelKey: "fwElectronicPivsWrenches", frequencies: ["quarterly"] },
  { labelKey: "fwElectronicValvesFreeDamage", frequencies: ["quarterly"] },
  { labelKey: "fwElectronicValvesSignage", frequencies: ["quarterly"] },
  // Annual - Low Temp Alarm
  { labelKey: "fwLowTempAlarmFreeDamage", frequencies: ["annually"] },
  // Annual - Support/Hangers
  { labelKey: "fwHangersGoodCondition", frequencies: ["annually"] },
  { labelKey: "fwHangersNoDamageMissing", frequencies: ["annually"] },
  { labelKey: "fwHangersSecurelyAttached", frequencies: ["annually"] },
  // Annual - Pipes and Fittings
  { labelKey: "fwPipesGoodCondition", frequencies: ["annually"] },
  { labelKey: "fwPipesNoLeaksDamage", frequencies: ["annually"] },
  { labelKey: "fwPipesCorrectAlignment", frequencies: ["annually"] },
  { labelKey: "fwLowPointDrains", frequencies: ["annually"] },
  { labelKey: "fwRubberGaskets", frequencies: ["annually"] },
  // Annual - Sprinklers (visible)
  { labelKey: "fwSprinklersNoDamageLeaks", frequencies: ["annually"] },
  { labelKey: "fwSprinklersFreeCorrosion", frequencies: ["annually"] },
  { labelKey: "fwSprinklersFluidInBulbs", frequencies: ["annually"] },
  { labelKey: "fwSpareSprinklers", frequencies: ["annually"] },
  { labelKey: "fwSprinklersFreeOfDust", frequencies: ["annually"] },
  { labelKey: "fwEscutcheonsInstalled", frequencies: ["annually"] },
  { labelKey: "fwSprinklersClearance", frequencies: ["annually"] },
  // Annual - Bladder Tank
  { labelKey: "fwBladderTankFoamInWater", frequencies: ["annually"] },
  // Annual - Deluge Valve
  { labelKey: "fwDelugeInteriorCondition", frequencies: ["annually"] },
  { labelKey: "fwDelugeDetectionDevice", frequencies: ["annually"] },
  // Five Years - Inspection
  { labelKey: "fwStrainersPerManufacturer", frequencies: ["five_years"] },
  { labelKey: "fwAlarmValveInterior", frequencies: ["five_years"] },
  { labelKey: "fwCheckValveInternal", frequencies: ["five_years"] },
  { labelKey: "fwObstructionInspection", frequencies: ["five_years"] },
  { labelKey: "fwBackflowInternal", frequencies: ["five_years"] },
  { labelKey: "fwDelugeInternalStrainers", frequencies: ["five_years"] },
  // Test - Quarterly
  { labelKey: "fwTestAlarmWaterMotorGong", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "fwTestPrimingWaterLevel", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "fwTestLowAirAlarm", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "fwTestMainDrainBackflow", frequencies: ["quarterly"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
  ]},
  { labelKey: "fwTestMainDrainDiffers10", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "fwTestMasterPrdPartialFlow", frequencies: ["quarterly"], isTestSection: true },
  // Test - Semiannual
  { labelKey: "fwTestValveSupervisorySwitch", frequencies: ["semiannually"], isTestSection: true },
  { labelKey: "fwTestAlarmDevicesVanePressure", frequencies: ["semiannually"], isTestSection: true },
  // Test - Annual
  { labelKey: "fwTestControlValvesFullRange", frequencies: ["annually"], isTestSection: true },
  { labelKey: "fwTestValveStatusTest", frequencies: ["annually"], isTestSection: true },
  { labelKey: "fwTestSupervisorySwitches", frequencies: ["annually"], isTestSection: true },
  { labelKey: "fwTestLowTempAlarmHeating", frequencies: ["annually"], isTestSection: true },
  { labelKey: "fwTestMainDrainAnnual", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
  ]},
  { labelKey: "fwTestMainDrainAnnualDiffers", frequencies: ["annually"], isTestSection: true },
  { labelKey: "fwTestBackflowForwardFlow", frequencies: ["annually"], isTestSection: true },
  { labelKey: "fwTestMasterPrdFullFlow", frequencies: ["annually"], isTestSection: true },
  // Test - Annual Full Flow (Deluge)
  { labelKey: "fwTestDelugeNozzlesDischarge", frequencies: ["annually"], isTestSection: true },
  { labelKey: "fwTestDelugePressureAtValve", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "operatingPsi", type: "psi", unit: "psi" },
  ]},
  { labelKey: "fwTestDelugePressureRemote", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "operatingPsi", type: "psi", unit: "psi" },
  ]},
  { labelKey: "fwTestDelugeAirMaintenance", frequencies: ["annually"], isTestSection: true },
  // Test - Annual Preaction Partial Trip
  { labelKey: "fwTestPreactionPartialTrip", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "airPressurePsi", type: "psi", unit: "psi" },
    { labelKey: "tripTimeSec", type: "seconds", unit: "sec" },
    { labelKey: "waterDeliveryTimeMin", type: "minutes", unit: "min" },
  ]},
  // Test - Annual Foam Strainer
  { labelKey: "fwTestFoamStrainerCondition", frequencies: ["annually"], isTestSection: true },
  // Test - Annual Operational
  { labelKey: "fwTestOperationalResponse", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "operationTimeSec", type: "seconds", unit: "sec" },
  ]},
  { labelKey: "fwTestManualActuation", frequencies: ["annually"], isTestSection: true },
  // Test - Annual Concentration
  { labelKey: "fwTestFoamSampleMeasured", frequencies: ["annually"], isTestSection: true },
  { labelKey: "fwTestConcentrationWithin10", frequencies: ["annually"], isTestSection: true },
  { labelKey: "fwTestConcentrationNotBelow10", frequencies: ["annually"], isTestSection: true },
  // Test - Three Years
  { labelKey: "fwTestPreactionTripOpen", frequencies: ["three_years"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "airPressurePsi", type: "psi", unit: "psi" },
    { labelKey: "tripTimeSec", type: "seconds", unit: "sec" },
    { labelKey: "waterDeliveryTimeMin", type: "minutes", unit: "min" },
  ]},
  { labelKey: "fwTestPreactionResultsCompared", frequencies: ["three_years"], isTestSection: true },
  { labelKey: "fwTestPreactionAirLeakage", frequencies: ["three_years"], isTestSection: true },
  // Test - Five Years
  { labelKey: "fwTestGaugesTestedReplaced", frequencies: ["five_years"], isTestSection: true },
  // Maintenance - Annual
  { labelKey: "fwMaintOsyStemsLubricated", frequencies: ["annually"] },
  // Maintenance - Five Years
  { labelKey: "fwMaintProportionerBallDrip", frequencies: ["five_years"] },
  { labelKey: "fwMaintBalancingDiaphragm", frequencies: ["five_years"] },
  { labelKey: "fwMaintVacuumVentsServiced", frequencies: ["five_years"] },
];

const waterSprayChecklist: ChecklistTemplate[] = [
  // Daily - Deluge Valve (Cold Weather)
  { labelKey: "wsDelugeEnclosureMinTemp", frequencies: ["daily"] },
  // Weekly - Backflow
  { labelKey: "wsIsolationValvesOpenLocked", frequencies: ["weekly"] },
  { labelKey: "wsRpaReliefValveOperating", frequencies: ["weekly"] },
  // Weekly - Control Valves
  { labelKey: "wsControlValvesCorrectPosition", frequencies: ["weekly"] },
  { labelKey: "wsControlValvesSealed", frequencies: ["weekly"] },
  { labelKey: "wsControlValvesAccessible", frequencies: ["weekly"] },
  { labelKey: "wsPivsCorrectWrenches", frequencies: ["weekly"] },
  { labelKey: "wsControlValvesFreeFromDamage", frequencies: ["weekly"] },
  { labelKey: "wsControlValvesProperSignage", frequencies: ["weekly"] },
  // Weekly - Deluge Valve
  { labelKey: "wsDelugeValveEnclosureTemp", frequencies: ["weekly"] },
  // Monthly - Gauges
  { labelKey: "wsGaugesOperableNotDamaged", frequencies: ["monthly"] },
  { labelKey: "wsGaugesAirPressureUnsupervised", hasPsi: true, frequencies: ["monthly"] },
  // Monthly - Control Valves (Locked/Supervised)
  { labelKey: "wsMonthlyValvesCorrectPosition", frequencies: ["monthly"] },
  { labelKey: "wsMonthlyValvesLockedSupervised", frequencies: ["monthly"] },
  { labelKey: "wsMonthlyValvesAccessible", frequencies: ["monthly"] },
  { labelKey: "wsMonthlyPivsWrenches", frequencies: ["monthly"] },
  { labelKey: "wsMonthlyValvesFreeDamage", frequencies: ["monthly"] },
  { labelKey: "wsMonthlyValvesSignage", frequencies: ["monthly"] },
  // Monthly - Deluge Valve
  { labelKey: "wsDelugeValveFreeDamage", frequencies: ["monthly"] },
  { labelKey: "wsDelugeValveElectricalInService", frequencies: ["monthly"] },
  { labelKey: "wsDelugeValveTrimPosition", frequencies: ["monthly"] },
  { labelKey: "wsDelugeValveSeatNotLeaking", frequencies: ["monthly"] },
  { labelKey: "wsDetectionSystemGaugeNormal", frequencies: ["monthly"] },
  // Monthly - UHSWSS Detectors
  { labelKey: "wsUhswssDetectorsFreeDamage", frequencies: ["monthly"] },
  { labelKey: "wsOpticalDetectorsLensesClean", frequencies: ["monthly"] },
  // Quarterly - Gauges
  { labelKey: "wsGaugesSupplyPressure", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "wsGaugesAirPressureSupervised", hasPsi: true, frequencies: ["quarterly"] },
  // Quarterly - Control Valves (Electronically Supervised)
  { labelKey: "wsElectronicValvesPosition", frequencies: ["quarterly"] },
  { labelKey: "wsElectronicValvesSupervised", frequencies: ["quarterly"] },
  { labelKey: "wsElectronicValvesAccessible", frequencies: ["quarterly"] },
  { labelKey: "wsElectronicPivsWrenches", frequencies: ["quarterly"] },
  { labelKey: "wsElectronicValvesFreeDamage", frequencies: ["quarterly"] },
  { labelKey: "wsElectronicValvesSignage", frequencies: ["quarterly"] },
  // Quarterly - Drainage
  { labelKey: "wsDrainageMethodCondition", frequencies: ["quarterly"] },
  { labelKey: "wsRetentionDikesCondition", frequencies: ["quarterly"] },
  // Annual - Support/Hangers
  { labelKey: "wsHangersGoodCondition", frequencies: ["annually"] },
  { labelKey: "wsHangersSecurelyAttached", frequencies: ["annually"] },
  { labelKey: "wsHangersNoDamagedMissing", frequencies: ["annually"] },
  // Annual - Pipes and Fittings
  { labelKey: "wsPipesNoCorrosion", frequencies: ["annually"] },
  { labelKey: "wsPipesNoLeaksDamage", frequencies: ["annually"] },
  { labelKey: "wsPipesCorrectAlignment", frequencies: ["annually"] },
  { labelKey: "wsLowPointDrainsMaintained", frequencies: ["annually"] },
  { labelKey: "wsRubberGasketedFittings", frequencies: ["annually"] },
  // Annual - Nozzles
  { labelKey: "wsNozzlesInPlaceAimed", frequencies: ["annually"] },
  { labelKey: "wsNozzlesFreeLoadingCorrosion", frequencies: ["annually"] },
  { labelKey: "wsNozzlesCapsPlugsInPlace", frequencies: ["annually"] },
  // Annual - Deluge Valve
  { labelKey: "wsDelugeValveAfterTripTest", frequencies: ["annually"] },
  { labelKey: "wsDetectionDeviceGoodCondition", frequencies: ["annually"] },
  // Annual - Building
  { labelKey: "wsBuildingOpeningsClosed", frequencies: ["annually"] },
  { labelKey: "wsHeatTracePerManufacturer", frequencies: ["annually"] },
  { labelKey: "wsLowTempAlarmFreeDamage", frequencies: ["annually"] },
  // Five Years
  { labelKey: "wsCheckValveInternal", frequencies: ["five_years"] },
  { labelKey: "wsBackflowInternal", frequencies: ["five_years"] },
  { labelKey: "wsDelugeValveInterior", frequencies: ["five_years"] },
  // Test - Quarterly
  { labelKey: "wsTestAlarmWaterMotorGong", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "wsTestMainDrainQuarterly", frequencies: ["quarterly"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
  ]},
  { labelKey: "wsTestMainDrainResultsDiffer", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "wsTestDelugePrimingLevel", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "wsTestLowAirAlarm", frequencies: ["quarterly"], isTestSection: true },
  // Test - Semiannual
  { labelKey: "wsTestValveSupervisorySwitch", frequencies: ["semiannually"], isTestSection: true },
  { labelKey: "wsTestAlarmInspectorTest", frequencies: ["semiannually"], isTestSection: true },
  // Test - Annual
  { labelKey: "wsTestSupervisorySwitches", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wsTestLowTempAlarm", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wsTestMainDrainAnnual", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
  ]},
  { labelKey: "wsTestMainDrainAnnualDiffer", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wsTestControlValvesFullRange", frequencies: ["annually"], isTestSection: true },
  // Test - Annual Full Flow Trip Test
  { labelKey: "wsTestUnobstructedDischarge", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wsTestPressureRemoteNozzle", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "operatingPsi", type: "psi", unit: "psi" },
  ]},
  { labelKey: "wsTestPressureDelugeValve", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "operatingPsi", type: "psi", unit: "psi" },
  ]},
  { labelKey: "wsTestCompareHydraulicDesign", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wsTestManualRelease", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wsTestValveStatus", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wsTestNozzleSprayPatterns", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wsTestAirMaintenanceDevice", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wsTestMainlineStrainerFlush", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wsTestBackflowForwardFlow", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wsTestDetectionNFPA72", frequencies: ["annually"], isTestSection: true },
  // Test - Annual System Response Time
  { labelKey: "wsTestHeatDetectionResponse", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "responseTimeSec", type: "seconds", unit: "sec" },
  ]},
  { labelKey: "wsTestFlammableGasResponse", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "responseTimeSec", type: "seconds", unit: "sec" },
  ]},
  { labelKey: "wsTestDischargeTime", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "dischargeTimeSec", type: "seconds", unit: "sec" },
  ]},
  { labelKey: "wsTestUhswssResponseTime", frequencies: ["annually"], isTestSection: true },
  // Maintenance - Annual
  { labelKey: "wsMaintOsyStemsLubricated", frequencies: ["annually"] },
];

const waterMistChecklist: ChecklistTemplate[] = [
  // Daily - Valve Enclosure (Cold Weather)
  { labelKey: "enclosureMinTemp", frequencies: ["daily"] },
  // Weekly - Backflow
  { labelKey: "wmIsolationValvesOpenLocked", frequencies: ["weekly"] },
  { labelKey: "wmRpaReliefValveOperating", frequencies: ["weekly"] },
  // Weekly - Control Valves
  { labelKey: "wmControlValvesCorrectPosition", frequencies: ["weekly"] },
  { labelKey: "wmControlValvesSealed", frequencies: ["weekly"] },
  { labelKey: "wmControlValvesAccessible", frequencies: ["weekly"] },
  { labelKey: "wmPivsCorrectWrenches", frequencies: ["weekly"] },
  { labelKey: "wmControlValvesFreeFromDamage", frequencies: ["weekly"] },
  { labelKey: "wmControlValvesProperSignage", frequencies: ["weekly"] },
  // Weekly - Deluge/Preaction Valve
  { labelKey: "wmDelugeEnclosureMinTemp", frequencies: ["weekly"] },
  // Weekly - Master Pressure-Regulating Device
  { labelKey: "wmMasterPrdDownstreamPressure", hasPsi: true, frequencies: ["weekly"] },
  { labelKey: "wmMasterPrdSupplyPressure", hasPsi: true, frequencies: ["weekly"] },
  { labelKey: "wmMasterPrdFreeDamageLeaks", frequencies: ["weekly"] },
  { labelKey: "wmMasterPrdTrimCondition", frequencies: ["weekly"] },
  // Monthly - Gauges
  { labelKey: "wmGaugesGoodCondition", frequencies: ["monthly"] },
  { labelKey: "wmAirPressureUnsupervised", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "wmDryValveRatioUnsupervised", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "wmQuickOpeningGaugeUnsupervised", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "wmWaterCirculationTankLevel", frequencies: ["monthly"] },
  // Monthly - Compressed Gas Cylinders
  { labelKey: "wmCylinderPressureUnsupervised", hasPsi: true, frequencies: ["monthly"] },
  // Monthly - Standby Pump
  { labelKey: "wmStandbyPumpInletPressure", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "wmStandbyPumpOutletPressure", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "wmMoistureTrapOilInjection", frequencies: ["monthly"] },
  { labelKey: "wmOilLevelAirRegulator", frequencies: ["monthly"] },
  // Monthly - Control Valves (Locked/Supervised)
  { labelKey: "wmMonthlyValvesCorrectPosition", frequencies: ["monthly"] },
  { labelKey: "wmMonthlyValvesLockedSupervised", frequencies: ["monthly"] },
  { labelKey: "wmMonthlyValvesAccessible", frequencies: ["monthly"] },
  { labelKey: "wmMonthlyPivsWrenches", frequencies: ["monthly"] },
  { labelKey: "wmMonthlyValvesFreeDamage", frequencies: ["monthly"] },
  { labelKey: "wmMonthlyValvesSignage", frequencies: ["monthly"] },
  // Quarterly - Gauges (Supervised)
  { labelKey: "wmAirPressureSupervised", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "wmDryValveRatioSupervised", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "wmQuickOpeningGaugeSupervised", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "wmSupplyGaugeNormal", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "wmWaterSupplyPressure", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "wmWaterStorageCylinderUnsupervised", frequencies: ["quarterly"] },
  { labelKey: "wmAdditiveStorageCylinder", frequencies: ["quarterly"] },
  { labelKey: "wmWaterRecirculationTankSupervised", frequencies: ["quarterly"] },
  { labelKey: "wmCompressedGasSecured", frequencies: ["quarterly"] },
  { labelKey: "wmWaterflowAlarmDevice", frequencies: ["quarterly"] },
  { labelKey: "wmHydraulicSignAttached", frequencies: ["quarterly"] },
  // Quarterly - Alarm Valves/Riser Check
  { labelKey: "wmAlarmValvesGaugesNormal", frequencies: ["quarterly"] },
  { labelKey: "wmAlarmValvesFreeDamage", frequencies: ["quarterly"] },
  { labelKey: "wmAlarmValvesPosition", frequencies: ["quarterly"] },
  { labelKey: "wmAlarmValvesAccessible", frequencies: ["quarterly"] },
  { labelKey: "wmRetardChamberNotLeaking", frequencies: ["quarterly"] },
  // Quarterly - Control Valves (Electronically Supervised)
  { labelKey: "wmElectronicValvesPosition", frequencies: ["quarterly"] },
  { labelKey: "wmElectronicValvesSupervised", frequencies: ["quarterly"] },
  { labelKey: "wmElectronicValvesAccessible", frequencies: ["quarterly"] },
  { labelKey: "wmElectronicPivsWrenches", frequencies: ["quarterly"] },
  { labelKey: "wmElectronicValvesFreeDamage", frequencies: ["quarterly"] },
  { labelKey: "wmElectronicValvesSignage", frequencies: ["quarterly"] },
  // Quarterly - Pressure-Reducing Valve
  { labelKey: "wmPrvOpenNotLeaking", frequencies: ["quarterly"] },
  { labelKey: "wmPrvMaintainingPressure", frequencies: ["quarterly"] },
  { labelKey: "wmPrvGoodCondition", frequencies: ["quarterly"] },
  // Semiannual
  { labelKey: "wmManualIndicatingValvesPosition", frequencies: ["semiannually"] },
  { labelKey: "wmGasCylinderPressureSupervised", hasPsi: true, frequencies: ["semiannually"] },
  { labelKey: "wmWaterStorageCylinderSupervised", frequencies: ["semiannually"] },
  { labelKey: "wmPneumaticValvesTubing", frequencies: ["semiannually"] },
  { labelKey: "wmWaterQualityFirstYear", frequencies: ["semiannually"] },
  { labelKey: "wmAdditiveAgentLevel", frequencies: ["semiannually"] },
  { labelKey: "wmEnclosureIntegrity", frequencies: ["semiannually"] },
  // Annual
  { labelKey: "wmHosesNotDamaged", frequencies: ["annually"] },
  { labelKey: "wmWaterQualityAfterFirstYear", frequencies: ["annually"] },
  { labelKey: "wmLowTempAlarmCondition", frequencies: ["annually"] },
  // Annual - Nozzles
  { labelKey: "wmNozzlesNoDamageCorrosion", frequencies: ["annually"] },
  { labelKey: "wmNozzlesFluidInBulb", frequencies: ["annually"] },
  { labelKey: "wmNozzlesFreeOfDust", frequencies: ["annually"] },
  { labelKey: "wmNozzlesNoPaintCoating", frequencies: ["annually"] },
  { labelKey: "wmNozzlesCorrectOrientation", frequencies: ["annually"] },
  { labelKey: "wmSpareNozzlesCorrectType", frequencies: ["annually"] },
  // Annual - Hangers/Braces/Support
  { labelKey: "wmHangersNotDamagedLoose", frequencies: ["annually"] },
  // Annual - High-Pressure Water Storage Cylinder
  { labelKey: "wmCylinderSecured", frequencies: ["annually"] },
  { labelKey: "wmCylinderVentPlugNotRuptured", frequencies: ["annually"] },
  { labelKey: "wmCylinderFiltersClean", frequencies: ["annually"] },
  { labelKey: "wmCylinderCapacityRating", frequencies: ["annually"] },
  { labelKey: "wmCylinderComplianceSpec", frequencies: ["annually"] },
  { labelKey: "wmCylinderDischargePressure", hasPsi: true, frequencies: ["annually"] },
  { labelKey: "wmRecirculationTankSupports", frequencies: ["annually"] },
  { labelKey: "wmRecirculationTankFilters", frequencies: ["annually"] },
  // Annual - Piping/Tubing/Fittings
  { labelKey: "wmPipingFreeMechanicalDamage", frequencies: ["annually"] },
  { labelKey: "wmPipingFreeLeakage", frequencies: ["annually"] },
  { labelKey: "wmPipingFreeExternalLoads", frequencies: ["annually"] },
  { labelKey: "wmPipingMissingDamagedPaint", frequencies: ["annually"] },
  { labelKey: "wmPipingFreeCorrosionRust", frequencies: ["annually"] },
  { labelKey: "wmPipingMisalignmentTrapped", frequencies: ["annually"] },
  { labelKey: "wmLowPointDrainsCondition", frequencies: ["annually"] },
  // Annual - Compressed Gas Cylinders
  { labelKey: "wmCompressedGasCylinderCapacity", frequencies: ["annually"] },
  { labelKey: "wmCompressedGasCylinderCompliance", frequencies: ["annually"] },
  { labelKey: "wmCompressedGasMeetsSpecs", frequencies: ["annually"] },
  // Five Years - Inspection
  { labelKey: "wmAlarmValveInterior", frequencies: ["five_years"] },
  { labelKey: "wmObstructionInspection", frequencies: ["five_years"] },
  { labelKey: "wmCheckValveInternal", frequencies: ["five_years"] },
  { labelKey: "wmBackflowInternal", frequencies: ["five_years"] },
  { labelKey: "wmCompressedGasCylinderExterior", frequencies: ["five_years"] },
  // Test - Quarterly
  { labelKey: "wmTestNozzlesFlowOperation", frequencies: ["quarterly"], isTestSection: true },
  // Test - Semiannual
  { labelKey: "wmTestAlarmDeviceVanePressure", frequencies: ["semiannually"], isTestSection: true },
  { labelKey: "wmTestValveSupervisorySwitch", frequencies: ["semiannually"], isTestSection: true },
  { labelKey: "wmTestPneumaticSlaveValve", frequencies: ["semiannually"], isTestSection: true },
  // Test - Annual
  { labelKey: "wmTestSupervisorySwitches", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wmTestWaterSupply", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "operatingPsi", type: "psi", unit: "psi" },
    { labelKey: "flowGpm", type: "gpm", unit: "gpm" },
    { labelKey: "durationMin", type: "minutes", unit: "min" },
  ]},
  { labelKey: "wmTestAdditiveAgentQuality", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wmTestAdditiveInjectionFull", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wmTestValveStatus", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wmTestStandbyPumpOperated", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wmTestControlValvesFullRange", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wmTestBackflowForwardFlow", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wmTestMasterPrvFullFlow", frequencies: ["annually"], isTestSection: true },
  // Test - Annual Water Recirculation Tank
  { labelKey: "wmTestRecirculationOperational", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wmTestFloatValveFunctions", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wmTestOutletDischargePressure", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "operatingPsi", type: "psi", unit: "psi" },
  ]},
  { labelKey: "wmTestBackflowPreventerFunctions", frequencies: ["annually"], isTestSection: true },
  // Test - Annual Pneumatic Valves
  { labelKey: "wmTestSolenoidRelease", frequencies: ["annually"], isTestSection: true },
  // Test - Annual Full Flow Trip Test
  { labelKey: "wmTestUnobstructedDischarge", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wmTestPressureAtControlValve", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "operatingPsi", type: "psi", unit: "psi" },
  ]},
  { labelKey: "wmTestDetectionResponseTime", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "responseTimeSec", type: "seconds", unit: "sec" },
  ]},
  { labelKey: "wmTestDetectionNFPA72", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wmTestVentilationInterlocks", frequencies: ["annually"], isTestSection: true },
  { labelKey: "wmTestFuelLubricationInterlocks", frequencies: ["annually"], isTestSection: true },
  // Test - Five Years
  { labelKey: "wmTestGaugesTestedReplaced", frequencies: ["five_years"], isTestSection: true },
  { labelKey: "wmTestCylinderRetesting", frequencies: ["five_years"], isTestSection: true },
  { labelKey: "wmTestHoseHydrostatic", frequencies: ["five_years"], isTestSection: true },
  // Maintenance - Annual
  { labelKey: "wmMaintOsyStemsLubricated", frequencies: ["annually"] },
  { labelKey: "wmMaintFlushStrainerAfterTest", frequencies: ["annually"] },
  { labelKey: "wmMaintEvaluateAdditives", frequencies: ["annually"] },
  { labelKey: "wmMaintDrainRefillTank", frequencies: ["annually"] },
  // Maintenance - Five Years
  { labelKey: "wmMaintRebuildPneumaticPump", frequencies: ["five_years"] },
  // Maintenance - After Activation
  { labelKey: "wmMaintInspectNozzlesAfterActivation", frequencies: ["annually"] },
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
  // Daily - Dry/Deluge Valve (Cold Weather)
  { labelKey: "shDelugeEnclosureMinTemp", frequencies: ["daily"] },
  // Weekly - Backflow
  { labelKey: "shIsolationValvesOpenLocked", frequencies: ["weekly"] },
  { labelKey: "shRpaReliefValveOperating", frequencies: ["weekly"] },
  // Weekly - Control Valves
  { labelKey: "shControlValvesCorrectPosition", frequencies: ["weekly"] },
  { labelKey: "shControlValvesSealed", frequencies: ["weekly"] },
  { labelKey: "shControlValvesAccessible", frequencies: ["weekly"] },
  { labelKey: "shPivsCorrectWrenches", frequencies: ["weekly"] },
  { labelKey: "shControlValvesFreeFromDamage", frequencies: ["weekly"] },
  { labelKey: "shControlValvesProperSignage", frequencies: ["weekly"] },
  // Weekly - Dry/Deluge Valve
  { labelKey: "shDelugeValveEnclosureTemp", frequencies: ["weekly"] },
  // Weekly - Master PRD
  { labelKey: "shMasterPrdDownstreamPressure", hasPsi: true, frequencies: ["weekly"] },
  { labelKey: "shMasterPrdSupplyPressure", hasPsi: true, frequencies: ["weekly"] },
  { labelKey: "shMasterPrdFreeDamageLeaks", frequencies: ["weekly"] },
  { labelKey: "shMasterPrdTrimCondition", frequencies: ["weekly"] },
  // Monthly - Gauges
  { labelKey: "shGaugesOperableNotDamaged", frequencies: ["monthly"] },
  { labelKey: "shGaugesAirPressureUnsupervised", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "shDryValveRatioUnsupervised", hasPsi: true, frequencies: ["monthly"] },
  { labelKey: "shQuickOpeningGaugeUnsupervised", hasPsi: true, frequencies: ["monthly"] },
  // Monthly - Control Valves (Locked/Supervised)
  { labelKey: "shMonthlyValvesCorrectPosition", frequencies: ["monthly"] },
  { labelKey: "shMonthlyValvesLockedSupervised", frequencies: ["monthly"] },
  { labelKey: "shMonthlyValvesAccessible", frequencies: ["monthly"] },
  { labelKey: "shMonthlyPivsWrenches", frequencies: ["monthly"] },
  { labelKey: "shMonthlyValvesFreeDamage", frequencies: ["monthly"] },
  { labelKey: "shMonthlyValvesSignage", frequencies: ["monthly"] },
  // Monthly - Dry Pipe Valve
  { labelKey: "shDryValveExteriorFreeDamage", frequencies: ["monthly"] },
  { labelKey: "shDryValveTrimPosition", frequencies: ["monthly"] },
  { labelKey: "shDryValveChamberNotLeaking", frequencies: ["monthly"] },
  // Monthly - Deluge Valve
  { labelKey: "shDelugeValveFreeDamage", frequencies: ["monthly"] },
  { labelKey: "shDelugeValveElectricalInService", frequencies: ["monthly"] },
  { labelKey: "shDelugeValveTrimPosition", frequencies: ["monthly"] },
  { labelKey: "shDelugeValveSeatNotLeaking", frequencies: ["monthly"] },
  // Quarterly
  { labelKey: "shWaterflowAlarmFreeDamage", frequencies: ["quarterly"] },
  { labelKey: "shGaugesAirPressureSupervised", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "shDryValveRatioSupervised", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "shQuickOpeningGaugeSupervised", hasPsi: true, frequencies: ["quarterly"] },
  { labelKey: "shSupplyGaugeNormal", hasPsi: true, frequencies: ["quarterly"] },
  // Quarterly - Control Valves (Electronically Supervised)
  { labelKey: "shElectronicValvesPosition", frequencies: ["quarterly"] },
  { labelKey: "shElectronicValvesSupervised", frequencies: ["quarterly"] },
  { labelKey: "shElectronicValvesAccessible", frequencies: ["quarterly"] },
  { labelKey: "shElectronicPivsWrenches", frequencies: ["quarterly"] },
  { labelKey: "shElectronicValvesFreeDamage", frequencies: ["quarterly"] },
  { labelKey: "shElectronicValvesSignage", frequencies: ["quarterly"] },
  // Quarterly - Hose Valves
  { labelKey: "shHoseValveCapsInPlace", frequencies: ["quarterly"] },
  { labelKey: "shHoseValveThreadsNotDamaged", frequencies: ["quarterly"] },
  { labelKey: "shHoseValveHandlesPresent", frequencies: ["quarterly"] },
  { labelKey: "shHoseValveGasketsNotDamaged", frequencies: ["quarterly"] },
  { labelKey: "shHoseValveNotLeaking", frequencies: ["quarterly"] },
  { labelKey: "shHoseValveNotObstructed", frequencies: ["quarterly"] },
  { labelKey: "shHoseValveNormalOperation", frequencies: ["quarterly"] },
  // Quarterly - FDC
  { labelKey: "shFdcVisibleAccessible", frequencies: ["quarterly"] },
  { labelKey: "shFdcCouplingsSwivelsOperate", frequencies: ["quarterly"] },
  { labelKey: "shFdcPlugsCapsInPlace", frequencies: ["quarterly"] },
  { labelKey: "shFdcGasketsNotDamaged", frequencies: ["quarterly"] },
  { labelKey: "shFdcSignsInPlace", frequencies: ["quarterly"] },
  { labelKey: "shFdcCheckValveNotLeaking", frequencies: ["quarterly"] },
  { labelKey: "shFdcAutoDrainOperating", frequencies: ["quarterly"] },
  { labelKey: "shFdcClapperFunctional", frequencies: ["quarterly"] },
  { labelKey: "shFdcInteriorClearObstructions", frequencies: ["quarterly"] },
  { labelKey: "shFdcPipingUndamaged", frequencies: ["quarterly"] },
  // Annual
  { labelKey: "shDryValveInteriorAfterTrip", frequencies: ["annually"] },
  { labelKey: "shDelugeValveInteriorAfterTrip", frequencies: ["annually"] },
  { labelKey: "shHydraulicDesignInfoAttached", frequencies: ["annually"] },
  // Annual - Hose Cabinet
  { labelKey: "shCabinetVisibleAccessible", frequencies: ["annually"] },
  { labelKey: "shCabinetNoDamagedComponents", frequencies: ["annually"] },
  { labelKey: "shCabinetDoorOpensfully", frequencies: ["annually"] },
  { labelKey: "shCabinetGlassNotBroken", frequencies: ["annually"] },
  { labelKey: "shCabinetGlassBreakDevice", frequencies: ["annually"] },
  { labelKey: "shCabinetProperlyIdentified", frequencies: ["annually"] },
  { labelKey: "shCabinetLockFunctional", frequencies: ["annually"] },
  { labelKey: "shCabinetContentsPresentAccessible", frequencies: ["annually"] },
  // Annual - FDC
  { labelKey: "shFdcInteriorLockedFreeObstructions", frequencies: ["annually"] },
  // Annual - Nozzle
  { labelKey: "shNozzlePresent", frequencies: ["annually"] },
  { labelKey: "shNozzleGasketNotMissing", frequencies: ["annually"] },
  { labelKey: "shNozzleNotObstructed", frequencies: ["annually"] },
  { labelKey: "shNozzleOperatesSmoothly", frequencies: ["annually"] },
  // Annual - Hose
  { labelKey: "shHoseNoMildewCutsAbrasions", frequencies: ["annually"] },
  { labelKey: "shHoseGasketsNotMissing", frequencies: ["annually"] },
  { labelKey: "shHoseThreadsCompatible", frequencies: ["annually"] },
  { labelKey: "shHoseConnectedToRack", frequencies: ["annually"] },
  { labelKey: "shHoseTestToDate", frequencies: ["annually"] },
  { labelKey: "shHoseRerackedRerolled", frequencies: ["annually"] },
  // Annual - Hose Storage Device
  { labelKey: "shStorageVisibleAccessible", frequencies: ["annually"] },
  { labelKey: "shStorageNotDamagedOperates", frequencies: ["annually"] },
  { labelKey: "shStorageHoseProperlyRacked", frequencies: ["annually"] },
  { labelKey: "shStorageNozzleClipInPlace", frequencies: ["annually"] },
  { labelKey: "shStorageCabinetSwings90", frequencies: ["annually"] },
  // Annual - Hose Connections
  { labelKey: "shHoseConnValveCapsNotMissing", frequencies: ["annually"] },
  { labelKey: "shHoseConnFireHoseNotDamaged", frequencies: ["annually"] },
  { labelKey: "shHoseConnValveHandlesNotMissing", frequencies: ["annually"] },
  { labelKey: "shHoseConnCapGasketsNotMissing", frequencies: ["annually"] },
  { labelKey: "shHoseConnValveNotLeaking", frequencies: ["annually"] },
  { labelKey: "shHoseConnValveNoObstruction", frequencies: ["annually"] },
  { labelKey: "shHoseConnPrdNotMissing", frequencies: ["annually"] },
  { labelKey: "shHoseConnValveOperatesSmoothly", frequencies: ["annually"] },
  { labelKey: "shHoseConnValveNotDamaged", frequencies: ["annually"] },
  // Annual - Pipe and Fittings
  { labelKey: "shPipesNoCorrosion", frequencies: ["annually"] },
  { labelKey: "shPipesNoLeaksDamage", frequencies: ["annually"] },
  { labelKey: "shPipesCorrectAlignment", frequencies: ["annually"] },
  { labelKey: "shPipesControlValvesNotDamaged", frequencies: ["annually"] },
  { labelKey: "shPipesNoMissingSupportDevices", frequencies: ["annually"] },
  // Annual - Building
  { labelKey: "shBuildingOpeningsClosed", frequencies: ["annually"] },
  { labelKey: "shHeatTracePerManufacturer", frequencies: ["annually"] },
  { labelKey: "shLowTempAlarmFreeDamage", frequencies: ["annually"] },
  // Five Years
  { labelKey: "shObstructionInspection", frequencies: ["five_years"] },
  { labelKey: "shCheckValveInternal", frequencies: ["five_years"] },
  { labelKey: "shBackflowInternal", frequencies: ["five_years"] },
  { labelKey: "shDryValveStrainersFilters", frequencies: ["five_years"] },
  // Test - Quarterly
  { labelKey: "shTestAlarmWaterMotorGong", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "shTestMainDrainQuarterly", frequencies: ["quarterly"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
  ]},
  { labelKey: "shTestMainDrainResultsDiffer", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "shTestPrimingWaterLevel", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "shTestQuickOpeningDevice", frequencies: ["quarterly"], isTestSection: true },
  { labelKey: "shTestMasterPrdPartialFlow", frequencies: ["quarterly"], isTestSection: true },
  // Test - Semiannual
  { labelKey: "shTestValveSupervisorySwitch", frequencies: ["semiannually"], isTestSection: true },
  { labelKey: "shTestAlarmInspectorTest", frequencies: ["semiannually"], isTestSection: true },
  // Test - Annual
  { labelKey: "shTestSupervisorySwitches", frequencies: ["annually"], isTestSection: true },
  { labelKey: "shTestAirMaintenanceDevice", frequencies: ["annually"], isTestSection: true },
  { labelKey: "shTestBackflowForwardFlow", frequencies: ["annually"], isTestSection: true },
  { labelKey: "shTestValveStatus", frequencies: ["annually"], isTestSection: true },
  { labelKey: "shTestLowTempAlarm", frequencies: ["annually"], isTestSection: true },
  { labelKey: "shTestLowAirAlarm", frequencies: ["annually"], isTestSection: true },
  { labelKey: "shTestHoseConnPrdPartialFlow", frequencies: ["annually"], isTestSection: true },
  { labelKey: "shTestHoseValvesClass1Class3", frequencies: ["annually"], isTestSection: true },
  { labelKey: "shTestNozzlePerNFPA1962", frequencies: ["annually"], isTestSection: true },
  { labelKey: "shTestMainDrainAnnual", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "residualPsi", type: "residual_psi", unit: "psi" },
  ]},
  { labelKey: "shTestMainDrainAnnualDiffer", frequencies: ["annually"], isTestSection: true },
  { labelKey: "shTestControlValvesFullRange", frequencies: ["annually"], isTestSection: true },
  // Test - Annual Dry Pipe Valve Trip Test
  { labelKey: "shTestDryPipeTripPartial", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "waterPressurePsi", type: "psi", unit: "psi" },
    { labelKey: "airPressurePsi", type: "psi", unit: "psi" },
    { labelKey: "trippingAirPsi", type: "psi", unit: "psi" },
    { labelKey: "tripTimeSec", type: "seconds", unit: "sec" },
  ]},
  { labelKey: "shTestDryPipeTripResultsCompared", frequencies: ["annually"], isTestSection: true },
  // Test - Annual Deluge Valve Trip Test
  { labelKey: "shTestDelugeTripPressure", frequencies: ["annually"], isTestSection: true, numericFields: [
    { labelKey: "operatingPsi", type: "psi", unit: "psi" },
  ]},
  { labelKey: "shTestDelugeTripCompareDesign", frequencies: ["annually"], isTestSection: true },
  { labelKey: "shTestDelugeTripAirMaintDevice", frequencies: ["annually"], isTestSection: true },
  // Test - Annual Master PRD
  { labelKey: "shTestMasterPrdFullFlow", frequencies: ["annually"], isTestSection: true },
  // Test - Three Years
  { labelKey: "shTestHoseHydrostatic", frequencies: ["three_years"], isTestSection: true },
  { labelKey: "shTestHoseValvesClass2", frequencies: ["three_years"], isTestSection: true },
  { labelKey: "shTestDryPipeTripFull", frequencies: ["three_years"], isTestSection: true, numericFields: [
    { labelKey: "waterPressurePsi", type: "psi", unit: "psi" },
    { labelKey: "airPressurePsi", type: "psi", unit: "psi" },
    { labelKey: "trippingAirPsi", type: "psi", unit: "psi" },
    { labelKey: "tripTimeSec", type: "seconds", unit: "sec" },
    { labelKey: "waterDeliveryTimeMin", type: "minutes", unit: "min" },
    { labelKey: "waterDeliveryTimeSec", type: "seconds", unit: "sec" },
  ]},
  { labelKey: "shTestDryPipeTripFullResults", frequencies: ["three_years"], isTestSection: true },
  { labelKey: "shTestDryPipeLeakage", frequencies: ["three_years"], isTestSection: true },
  // Test - Five Years
  { labelKey: "shTestGaugesTestedReplaced", frequencies: ["five_years"], isTestSection: true },
  { labelKey: "shTestHydrostaticManualDry", frequencies: ["five_years"], isTestSection: true },
  { labelKey: "shTestFlowAutomatic", frequencies: ["five_years"], isTestSection: true, numericFields: [
    { labelKey: "staticPsi", type: "static_psi", unit: "psi" },
    { labelKey: "flowGpm", type: "gpm", unit: "gpm" },
    { labelKey: "pressureTopOutletPsi", type: "psi", unit: "psi" },
  ]},
  { labelKey: "shTestHoseConnPrdFlowTest", frequencies: ["five_years"], isTestSection: true },
  { labelKey: "shTestFdcHydrostatic", frequencies: ["five_years"], isTestSection: true },
  // Maintenance
  { labelKey: "shMaintReRackHose", frequencies: ["annually"] },
  { labelKey: "shMaintDrainLowPoints", frequencies: ["annually"] },
  { labelKey: "shMaintOsyStemsLubricated", frequencies: ["annually"] },
  { labelKey: "shMaintLubricateRepairHoseValves", frequencies: ["annually"] },
];

const fireServiceMainsChecklist: ChecklistTemplate[] = [
  // Weekly - Control Valves
  { labelKey: "fsmValveCorrectPosition", frequencies: ["weekly"] },
  { labelKey: "fsmValveSealed", frequencies: ["weekly"] },
  { labelKey: "fsmValveAccessible", frequencies: ["weekly"] },
  { labelKey: "fsmPivCorrectWrenches", frequencies: ["weekly"] },
  { labelKey: "fsmValveFreeDamageLeaks", frequencies: ["weekly"] },
  { labelKey: "fsmValveProperSignage", frequencies: ["weekly"] },
  // Weekly - Backflow
  { labelKey: "backflowIsolationValvesOpen", frequencies: ["weekly"] },
  { labelKey: "rpaRpdaReliefValveOperating", frequencies: ["weekly"] },
  // Monthly - Control Valves (Locked/Supervised)
  { labelKey: "fsmValveCorrectPositionMonthly", frequencies: ["monthly"] },
  { labelKey: "fsmValveLockedSupervised", frequencies: ["monthly"] },
  { labelKey: "fsmValveAccessibleMonthly", frequencies: ["monthly"] },
  { labelKey: "fsmPivCorrectWrenchesMonthly", frequencies: ["monthly"] },
  { labelKey: "fsmValveFreeDamageLeaksMonthly", frequencies: ["monthly"] },
  { labelKey: "fsmValveProperSignageMonthly", frequencies: ["monthly"] },
  // Quarterly - Control Valves (Electronically Supervised)
  { labelKey: "fsmValveCorrectPositionQuarterly", frequencies: ["quarterly"] },
  { labelKey: "fsmValveElectronicSupervised", frequencies: ["quarterly"] },
  { labelKey: "fsmValveAccessibleQuarterly", frequencies: ["quarterly"] },
  { labelKey: "fsmPivCorrectWrenchesQuarterly", frequencies: ["quarterly"] },
  { labelKey: "fsmValveFreeDamageLeaksQuarterly", frequencies: ["quarterly"] },
  { labelKey: "fsmValveProperSignageQuarterly", frequencies: ["quarterly"] },
  // Quarterly - Fire Department Connections
  { labelKey: "fdcVisibleAccessible", frequencies: ["quarterly"] },
  { labelKey: "fsmFdcCouplingSwivelsOperate", frequencies: ["quarterly"] },
  { labelKey: "fsmFdcPlugsCapsInPlace", frequencies: ["quarterly"] },
  { labelKey: "fsmFdcGasketsNotDamaged", frequencies: ["quarterly"] },
  { labelKey: "fsmFdcAutoDrainValveOperating", frequencies: ["quarterly"] },
  { labelKey: "fsmFdcIdentificationSigns", frequencies: ["quarterly"] },
  { labelKey: "fsmFdcInteriorClearObstructions", frequencies: ["quarterly"] },
  { labelKey: "fsmFdcClappersOperateCorrectly", frequencies: ["quarterly"] },
  { labelKey: "fsmFdcCheckValveNotLeaking", frequencies: ["quarterly"] },
  { labelKey: "fsmFdcVisiblePipingUndamaged", frequencies: ["quarterly"] },
  // Quarterly - Hose Houses
  { labelKey: "hoseHousesAccessible", frequencies: ["quarterly"] },
  { labelKey: "hoseHousesFreeDamageLeaks", frequencies: ["quarterly"] },
  { labelKey: "hoseHousesNoMissingEquipment", frequencies: ["quarterly"] },
  // Quarterly - Dry Hydrant
  { labelKey: "dryHydrantWaterSupplyNotDeteriorated", frequencies: ["quarterly"] },
  { labelKey: "dryHydrantVegetationCleared", frequencies: ["quarterly"] },
  // Semiannual - Monitor Nozzles
  { labelKey: "monitorNozzlesNotLeaking", frequencies: ["semiannually"] },
  { labelKey: "monitorNozzlesFreeOfDamage", frequencies: ["semiannually"] },
  { labelKey: "monitorNozzlesFreeOfCorrosion", frequencies: ["semiannually"] },
  // Semiannual - Dry Hydrants
  { labelKey: "dryHydrantReflectiveMaterial", frequencies: ["semiannually"] },
  // Annual - Hydrants (Dry Barrel and Wall Type)
  { labelKey: "dryBarrelHydrantAccessible", frequencies: ["annually"] },
  { labelKey: "dryBarrelFreeWaterIce", frequencies: ["annually"] },
  { labelKey: "dryBarrelDrainsProperly", frequencies: ["annually"] },
  { labelKey: "dryBarrelNotLeaking", frequencies: ["annually"] },
  { labelKey: "dryBarrelFreeCracks", frequencies: ["annually"] },
  { labelKey: "dryBarrelOutletsLubricated", frequencies: ["annually"] },
  { labelKey: "dryBarrelNozzleThreadsNotWorn", frequencies: ["annually"] },
  { labelKey: "dryBarrelOperatingNutNotWorn", frequencies: ["annually"] },
  { labelKey: "dryBarrelOperatingWrenchAvailable", frequencies: ["annually"] },
  { labelKey: "dryBarrelFreeDetrimentalCorrosion", frequencies: ["annually"] },
  // Annual - Hydrants (Wet Barrel)
  { labelKey: "wetBarrelHydrantAccessible", frequencies: ["annually"] },
  { labelKey: "wetBarrelNotLeaking", frequencies: ["annually"] },
  { labelKey: "wetBarrelFreeCracks", frequencies: ["annually"] },
  { labelKey: "wetBarrelOutletsLubricated", frequencies: ["annually"] },
  { labelKey: "wetBarrelNozzleThreadsNotWorn", frequencies: ["annually"] },
  { labelKey: "wetBarrelOperatingNutNotWorn", frequencies: ["annually"] },
  { labelKey: "wetBarrelOperatingWrenchAvailable", frequencies: ["annually"] },
  // Annual - FDC
  { labelKey: "fdcInteriorLockedPlugsFree", frequencies: ["annually"] },
  // Annual - Mainline Strainers
  { labelKey: "mainlineStrainersNotPlugged", frequencies: ["annually"] },
  { labelKey: "mainlineStrainersFreeCorrosion", frequencies: ["annually"] },
  { labelKey: "mainlineStrainersNoDamagedParts", frequencies: ["annually"] },
  // Annual - Pipe and Fittings (exposed)
  { labelKey: "fsmPipeFittingsNotLeaking", frequencies: ["annually"] },
  { labelKey: "fsmPipeFittingsHangersIntact", frequencies: ["annually"] },
  // Five Years - Backflow and Check Valves
  { labelKey: "backflowInternalInspection", frequencies: ["five_years"] },
  { labelKey: "fsmCheckValveInternalCondition", frequencies: ["five_years"] },
  { labelKey: "fsmBackflowForwardFlowTest", frequencies: ["five_years"] },
  // Test - Annual Monitor Nozzles
  { labelKey: "monitorNozzlesFlowTest", frequencies: ["annually"] },
  { labelKey: "monitorNozzlesFullRangeMotion", frequencies: ["annually"] },
  // Test - Annual Dry Hydrant
  { labelKey: "dryHydrantFlowTest", frequencies: ["annually"] },
  // Test - Annual Hydrants
  { labelKey: "hydrantsFlowTestOneMinute", frequencies: ["annually"] },
  { labelKey: "hydrantsBarrelDrains60Min", frequencies: ["annually"] },
  // Test - Annual Hydrant Isolation Valve
  { labelKey: "hydrantIsolationValveFullRange", frequencies: ["annually"] },
  { labelKey: "hydrantIsolationValveStatusTest", frequencies: ["annually"] },
  // Test - Five Years Piping
  { labelKey: "pipingFlowTestFireRate", frequencies: ["five_years"] },
  { labelKey: "pipingFlowTestComparable", frequencies: ["five_years"] },
  // Test - Five Years FDC
  { labelKey: "fdcHydrostaticTest150psi", frequencies: ["five_years"] },
  // Maintenance - Annual
  { labelKey: "mainlineStrainersCleanedInspected", frequencies: ["annually"] },
  { labelKey: "hydrantsLubricate", frequencies: ["annually"] },
  { labelKey: "hydrantsAccessibleMaintenance", frequencies: ["annually"] },
  { labelKey: "hydrantsProtectedFromDamage", frequencies: ["annually"] },
  { labelKey: "monitorNozzlesLubricate", frequencies: ["annually"] },
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
  fire_service_mains: fireServiceMainsChecklist,
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
