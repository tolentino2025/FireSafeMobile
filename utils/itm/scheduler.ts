// Camada de agendamento do app: usa o MOTOR (server/scheduler/engine) para gerar
// as ocorrencias de cada template selecionado em um plano.
// Datas em string YYYY-MM-DD. Idempotente: regerar produz os mesmos ids.
import { gerarOcorrencias } from "@/server/scheduler/engine";
import type { ItmTemplate } from "@/constants/itmTemplates";

export type ItmOccurrenceStatus = "scheduled" | "completed" | "overdue";

export interface ItmOccurrenceFlat {
  id: string;
  planId: string;
  templateKey: string;
  system: string;
  activity: string;
  frequency: string;
  description: string;
  dueDate: string;
  scheduledDate: string;
  windowStart: string;
  windowEnd: string;
  status: ItmOccurrenceStatus;
}

export interface PlanoParaAgenda {
  id: string;
  startDate: string; // YYYY-MM-DD
  systemKeys: string[];
}

export interface GerarAgendaOpcoes {
  // Data limite do horizonte (YYYY-MM-DD). Padrao: hoje + 18 meses.
  horizonEnd?: string;
  // Dias de tolerancia para a janela. Padrao: 0.
  toleranceDays?: number;
  // Feriados (YYYY-MM-DD) a evitar no scheduledDate.
  holidays?: string[];
  // Idioma da descricao (pt-BR usa descriptionPt). Padrao: pt-BR.
  language?: "pt-BR" | "en";
}

function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Horizonte padrao = hoje + 18 meses.
function horizontePadrao(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 18);
  return toISODate(d);
}

// id estavel deterministico = `${planId}:${templateKey}:${dueDate}`.
export function gerarIdOcorrencia(
  planId: string,
  templateKey: string,
  dueDate: string,
): string {
  return `${planId}:${templateKey}:${dueDate}`;
}

// Gera a agenda achatada de um plano: para cada template SELECIONADO (pelo system do plano),
// chama o motor com a startDate do plano e o intervalo do template.
export function gerarAgendaDoPlano(
  plano: PlanoParaAgenda,
  templates: ItmTemplate[],
  opts: GerarAgendaOpcoes = {},
): ItmOccurrenceFlat[] {
  const horizonEnd = opts.horizonEnd ?? horizontePadrao();
  const toleranceDays = opts.toleranceDays ?? 0;
  const holidays = opts.holidays ?? [];
  const language = opts.language ?? "pt-BR";

  const sistemasSelecionados = new Set(plano.systemKeys);
  const resultado: ItmOccurrenceFlat[] = [];

  for (const template of templates) {
    if (!sistemasSelecionados.has(template.system)) {
      continue;
    }

    const ocorrencias = gerarOcorrencias({
      startDate: plano.startDate,
      unit: template.intervalUnit,
      count: template.intervalCount,
      toleranceDays,
      horizonEnd,
      holidays,
      // A primeira ocorrencia eh a propria data de inicio do plano.
      firstDueIsStart: true,
    });

    const description =
      language === "pt-BR" ? template.descriptionPt : template.descriptionEn;

    for (const o of ocorrencias) {
      resultado.push({
        id: gerarIdOcorrencia(plano.id, template.key, o.dueDate),
        planId: plano.id,
        templateKey: template.key,
        system: template.system,
        activity: template.activity,
        frequency: template.frequency,
        description,
        dueDate: o.dueDate,
        scheduledDate: o.scheduledDate,
        windowStart: o.windowStart,
        windowEnd: o.windowEnd,
        status: "scheduled",
      });
    }
  }

  // Ordena por dueDate (e por templateKey para estabilidade).
  resultado.sort((a, b) => {
    if (a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;
    return a.templateKey < b.templateKey ? -1 : 1;
  });

  return resultado;
}
