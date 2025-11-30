import { InspectionFrequency } from "@/types/inspection";

export function addInterval(date: Date, frequency: InspectionFrequency): Date {
  const d = new Date(date);

  switch (frequency) {
    case "daily":
      d.setDate(d.getDate() + 1);
      break;
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "quarterly":
      d.setMonth(d.getMonth() + 3);
      break;
    case "annually":
      d.setFullYear(d.getFullYear() + 1);
      break;
    case "five_years":
      d.setFullYear(d.getFullYear() + 5);
      break;
  }

  return d;
}

export function generateScheduleId(): string {
  return `schedule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getFrequencyLabel(frequency: InspectionFrequency, language: "en" | "pt-BR"): string {
  const labels = {
    en: {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      quarterly: "Quarterly",
      annually: "Annual",
      five_years: "5-Year",
    },
    "pt-BR": {
      daily: "Diária",
      weekly: "Semanal",
      monthly: "Mensal",
      quarterly: "Trimestral",
      annually: "Anual",
      five_years: "5 Anos",
    },
  };
  return labels[language][frequency];
}

export function getInspectionTypeLabel(type: string, language: "en" | "pt-BR"): string {
  const labels = {
    en: {
      wet_pipe: "Wet Pipe Sprinkler",
      dry_pipe: "Dry Pipe Sprinkler",
      preaction_deluge: "Preaction/Deluge",
      foam_water: "Foam-Water Sprinkler",
      water_spray: "Water Spray",
      water_mist: "Water Mist",
      pump_weekly: "Fire Pump Weekly",
      pump_monthly: "Fire Pump Monthly",
      pump_annual: "Fire Pump Annual",
      aboveground: "Aboveground Piping",
      underground: "Underground Piping",
      hydrant_flow: "Hydrant Flow Test",
      water_tank: "Water Tank",
      hazard_eval: "Hazard Evaluation",
      standpipe: "Standpipe",
    },
    "pt-BR": {
      wet_pipe: "Sprinkler Tubo Molhado",
      dry_pipe: "Sprinkler Tubo Seco",
      preaction_deluge: "Pré-Ação/Dilúvio",
      foam_water: "Sprinkler Água-Espuma",
      water_spray: "Spray de Água",
      water_mist: "Névoa de Água",
      pump_weekly: "Bomba Semanal",
      pump_monthly: "Bomba Mensal",
      pump_annual: "Bomba Anual",
      aboveground: "Tubulação Aérea",
      underground: "Tubulação Subterrânea",
      hydrant_flow: "Teste de Vazão Hidrante",
      water_tank: "Reservatório",
      hazard_eval: "Avaliação de Risco",
      standpipe: "Standpipe",
    },
  };
  return labels[language][type as keyof typeof labels.en] || type;
}
