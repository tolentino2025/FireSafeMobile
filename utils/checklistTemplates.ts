import { ChecklistItem, InspectionType } from "@/contexts/InspectionContext";

const wetPipeChecklist: Omit<ChecklistItem, "id">[] = [
  { label: "Control valves in correct (open/closed) position", value: null },
  { label: "Control valves sealed", value: null },
  { label: "Control valves accessible", value: null },
  { label: "PIVs provided with correct wrenches", value: null },
  { label: "Free from damage or leaks", value: null },
  { label: "Proper signage", value: null },
  { label: "Gauges in good operating condition", value: null },
  { label: "Normal air/nitrogen pressure maintained (psi)", value: null, psiValue: "" },
  { label: "Enclosure minimum temperature 40°F (4°C) maintained", value: null },
  { label: "Isolation valves in open position and locked/supervised", value: null },
  { label: "RPA/RPDA differential-sensing relief valve operating correctly", value: null },
  { label: "Master PRD downstream pressure in accordance with design", value: null, psiValue: "" },
  { label: "Master PRD supply pressure in accordance with design", value: null, psiValue: "" },
  { label: "Master PRD free of damage or leaks", value: null },
  { label: "Master PRD trim in good operating condition", value: null },
];

const dryPipeChecklist: Omit<ChecklistItem, "id">[] = [
  { label: "Control valves in correct (open/closed) position", value: null },
  { label: "Control valves sealed", value: null },
  { label: "Control valves accessible", value: null },
  { label: "Free from damage or leaks", value: null },
  { label: "Proper signage", value: null },
  { label: "Gauges in good operating condition", value: null },
  { label: "Air pressure maintained (psi)", value: null, psiValue: "" },
  { label: "System water pressure maintained (psi)", value: null, psiValue: "" },
  { label: "Dry pipe valve enclosure temperature above 40°F", value: null },
  { label: "Low air pressure alarm operational", value: null },
  { label: "Quick opening device in service", value: null },
  { label: "Intermediate/dry pendent sprinklers free of water", value: null },
];

const pumpWeeklyChecklist: Omit<ChecklistItem, "id">[] = [
  { label: "Pump house conditions satisfactory", value: null },
  { label: "Pump suction/discharge pressure normal (psi)", value: null, psiValue: "" },
  { label: "Pump packing glands adjusted properly", value: null },
  { label: "System valves in proper position", value: null },
  { label: "Suction reservoir full", value: null },
  { label: "Wet pit suction screen unobstructed", value: null },
  { label: "Controller selector switch in AUTO position", value: null },
  { label: "Controller pilot lights illuminated", value: null },
  { label: "Diesel fuel tank at least 2/3 full", value: null },
  { label: "Battery terminals free of corrosion", value: null },
  { label: "Battery charger operating", value: null },
  { label: "Pump room temperature maintained", value: null },
];

const pumpMonthlyChecklist: Omit<ChecklistItem, "id">[] = [
  ...pumpWeeklyChecklist,
  { label: "Pump started and run for at least 10 minutes", value: null },
  { label: "Suction pressure recorded (psi)", value: null, psiValue: "" },
  { label: "Discharge pressure recorded (psi)", value: null, psiValue: "" },
  { label: "Pump speed (rpm)", value: null },
  { label: "Pump bearing temperature satisfactory", value: null },
  { label: "Packing gland drip rate acceptable", value: null },
  { label: "Unusual noise or vibration", value: null },
  { label: "Diesel engine cooling system checked", value: null },
];

const hydrantFlowChecklist: Omit<ChecklistItem, "id">[] = [
  { label: "Flow hydrant identification", value: null },
  { label: "Test hydrant identification", value: null },
  { label: "Static pressure recorded (psi)", value: null, psiValue: "" },
  { label: "Residual pressure recorded (psi)", value: null, psiValue: "" },
  { label: "Pitot pressure recorded (psi)", value: null, psiValue: "" },
  { label: "Flow rate calculated (gpm)", value: null },
  { label: "Hydrants accessible and operational", value: null },
  { label: "Caps/plugs in place", value: null },
  { label: "Hydrant wrench available", value: null },
];

const waterTankChecklist: Omit<ChecklistItem, "id">[] = [
  { label: "Tank water level correct", value: null },
  { label: "Tank temperature gauge operational", value: null },
  { label: "Water temperature above 40°F", value: null },
  { label: "Tank heating system operational", value: null },
  { label: "Tank exterior condition satisfactory", value: null },
  { label: "Tank supports condition satisfactory", value: null },
  { label: "Tank accessories/attachments secure", value: null },
  { label: "Cathodic protection system functional", value: null },
  { label: "Tank vents unobstructed", value: null },
  { label: "Overflow pipe unobstructed", value: null },
];

const standpipeChecklist: Omit<ChecklistItem, "id">[] = [
  { label: "Hose connections accessible and caps in place", value: null },
  { label: "Hose connections not obstructed", value: null },
  { label: "Threads in good condition", value: null },
  { label: "Pressure reducing valves in good condition", value: null },
  { label: "Hose available (if required)", value: null },
  { label: "Hose in good condition (no damage/kinks)", value: null },
  { label: "Hose rack in good condition", value: null },
  { label: "Cabinet doors operate freely", value: null },
  { label: "Fire department connection accessible", value: null },
  { label: "FDC caps in place", value: null },
  { label: "FDC check valve operational", value: null },
];

const genericChecklist: Omit<ChecklistItem, "id">[] = [
  { label: "System control valves in correct position", value: null },
  { label: "Valves sealed/locked/supervised", value: null },
  { label: "System free from damage or leaks", value: null },
  { label: "Gauges in good operating condition", value: null },
  { label: "System pressure normal (psi)", value: null, psiValue: "" },
  { label: "All components accessible", value: null },
  { label: "Proper signage in place", value: null },
  { label: "System enclosure conditions satisfactory", value: null },
];

const checklistsByType: Record<InspectionType, Omit<ChecklistItem, "id">[]> = {
  wet_pipe: wetPipeChecklist,
  dry_pipe: dryPipeChecklist,
  preaction_deluge: [...dryPipeChecklist, { label: "Detection system operational", value: null }],
  foam_water: [...wetPipeChecklist, { label: "Foam concentrate level adequate", value: null }],
  water_spray: genericChecklist,
  water_mist: genericChecklist,
  pump_weekly: pumpWeeklyChecklist,
  pump_monthly: pumpMonthlyChecklist,
  pump_annual: [...pumpMonthlyChecklist, { label: "Annual performance test completed", value: null }],
  aboveground: genericChecklist,
  underground: genericChecklist,
  hydrant_flow: hydrantFlowChecklist,
  water_tank: waterTankChecklist,
  hazard_eval: genericChecklist,
  standpipe: standpipeChecklist,
};

export function getChecklistForType(type: InspectionType): ChecklistItem[] {
  const template = checklistsByType[type] || genericChecklist;
  return template.map((item, index) => ({
    ...item,
    id: `${type}_${index}_${Date.now()}`,
  }));
}
