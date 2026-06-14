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
  // Data limite do horizonte (YYYY-MM-DD). Padrao: hoje + 12 meses.
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

// Horizonte padrao = hoje + 12 meses.
// Atividades com periodo maior que o horizonte (ex.: quinquenal) NAO somem:
// garantimos sempre a PRIMEIRA ocorrencia futura de cada template (ver abaixo).
function horizontePadrao(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 12);
  return toISODate(d);
}

// Horizonte "longo" para capturar a primeira ocorrencia de atividades longas.
function horizonteLongo(startDate: string): string {
  const d = new Date(startDate);
  d.setFullYear(d.getFullYear() + 100);
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
//
// Regra de datas (corrigida):
//  - firstDueIsStart = FALSE -> a primeira ocorrencia eh startDate + 1 intervalo.
//    Ex.: inicio 15/06/2026 => mensal 15/07/2026, anual 15/06/2027, quinquenal 15/06/2031.
//    (Antes era TRUE, o que jogava TODAS as atividades para a mesma data de inicio.)
//  - Atividades cujo periodo ultrapassa o horizonte (ex.: quinquenal) ainda assim
//    registram a PRIMEIRA ocorrencia futura, para nao desaparecerem da agenda.
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

    let ocorrencias = gerarOcorrencias({
      startDate: plano.startDate,
      unit: template.intervalUnit,
      count: template.intervalCount,
      toleranceDays,
      horizonEnd,
      holidays,
      // A primeira ocorrencia eh startDate + 1 intervalo (nao a propria data de inicio).
      firstDueIsStart: false,
    });

    // Garante a primeira ocorrencia futura de atividades longas (ex.: quinquenal)
    // que ficariam fora do horizonte padrao.
    if (ocorrencias.length === 0) {
      ocorrencias = gerarOcorrencias({
        startDate: plano.startDate,
        unit: template.intervalUnit,
        count: template.intervalCount,
        toleranceDays,
        horizonEnd: horizonteLongo(plano.startDate),
        holidays,
        firstDueIsStart: false,
      }).slice(0, 1);
    }

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
