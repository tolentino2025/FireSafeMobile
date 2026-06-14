// Persistencia idempotente do cronograma ITM.
// Desacoplado via interface `deps` para que os testes usem repositorio em memoria.
// Datas no dominio sao strings YYYY-MM-DD.
import { addInterval, fromISODate, gerarOcorrencias, toISODate } from "./engine";
import type { FrequencyUnit } from "./engine";

export type OccurrenceStatus =
  | "scheduled"
  | "due"
  | "completed"
  | "skipped"
  | "overdue";

export type AnchorMode = "calendar" | "completion";

export interface Template {
  id: string;
  key: string;
  system: string;
  activity: string;
  description: string;
  intervalUnit: FrequencyUnit;
  intervalCount: number;
  toleranceDays: number;
  anchorMode: AnchorMode;
  normativeRef: string;
  sourceRef: string[];
  active: boolean;
}

export interface Plan {
  id: string;
  assetId: string;
  startDate: string; // YYYY-MM-DD
  normativeProfile: string;
}

export interface Occurrence {
  id?: string;
  planId: string;
  templateId: string;
  dueDate: string; // YYYY-MM-DD
  scheduledDate: string;
  windowStart: string;
  windowEnd: string;
  status: OccurrenceStatus;
  completedAt?: string | null;
}

// Dependencias injetaveis (acesso a dados).
export interface SchedulerDeps {
  hoje: () => string; // YYYY-MM-DD
  getPlan: (planId: string) => Promise<Plan | undefined> | Plan | undefined;
  getActivePlans?: () => Promise<Plan[]> | Plan[];
  getActiveTemplates: (
    plan: Plan,
  ) => Promise<Template[]> | Template[];
  getTemplate?: (
    templateId: string,
  ) => Promise<Template | undefined> | Template | undefined;
  getHolidays: (plan: Plan) => Promise<Set<string>> | Set<string>;
  // Insere ocorrencias respeitando a constraint unique(planId, templateId, dueDate).
  // Deve fazer o equivalente a onConflictDoNothing (nao sobrescreve existentes).
  insertOccurrences: (occs: Occurrence[]) => Promise<number> | number;
  // Lista ocorrencias de um plano (para o job de overdue e gatilho completion).
  listOccurrences?: (planId: string) => Promise<Occurrence[]> | Occurrence[];
  // Atualiza status de uma ocorrencia.
  updateOccurrenceStatus?: (
    occ: Occurrence,
    status: OccurrenceStatus,
  ) => Promise<void> | void;
}

// Soma meses a uma data string YYYY-MM-DD.
function addMonthsISO(dateStr: string, months: number): string {
  return toISODate(addInterval(fromISODate(dateStr), "month", months));
}

// Reconstroi o cronograma de um plano de forma idempotente.
// Nunca sobrescreve ocorrencias completed/skipped (garantido pelo onConflictDoNothing
// no insertOccurrences do repositorio).
export async function rebuildSchedule(
  planId: string,
  deps: SchedulerDeps,
  horizonMonths = 18,
): Promise<number> {
  const plan = await deps.getPlan(planId);
  if (!plan) {
    return 0;
  }

  const templates = await deps.getActiveTemplates(plan);
  const holidays = await deps.getHolidays(plan);
  const horizonEnd = addMonthsISO(deps.hoje(), horizonMonths);

  const novas: Occurrence[] = [];

  for (const tpl of templates) {
    if (!tpl.active) {
      continue;
    }
    // Para anchorMode 'completion' a primeira ocorrencia eh a propria startDate;
    // as proximas sao geradas no gatilho de conclusao (aoConcluirOcorrencia).
    const ehCompletion = tpl.anchorMode === "completion";

    const ocorrencias = gerarOcorrencias({
      startDate: plan.startDate,
      unit: tpl.intervalUnit,
      count: tpl.intervalCount,
      toleranceDays: tpl.toleranceDays,
      horizonEnd,
      holidays,
      firstDueIsStart: true,
    });

    for (const o of ocorrencias) {
      novas.push({
        planId: plan.id,
        templateId: tpl.id,
        dueDate: o.dueDate,
        scheduledDate: o.scheduledDate,
        windowStart: o.windowStart,
        windowEnd: o.windowEnd,
        status: "scheduled",
        completedAt: null,
      });
      // Para completion, so geramos a primeira ancora aqui.
      if (ehCompletion) {
        break;
      }
    }
  }

  return await deps.insertOccurrences(novas);
}

// Job diario:
// (a) avanca o horizonte chamando rebuildSchedule para os planos ativos;
// (b) marca como overdue ocorrencias scheduled/due com windowEnd < hoje e sem conclusao.
export async function executarJobDiario(
  deps: SchedulerDeps,
  horizonMonths = 18,
): Promise<{ inseridas: number; marcadasOverdue: number }> {
  const hoje = deps.hoje();
  let inseridas = 0;
  let marcadasOverdue = 0;

  const planos = deps.getActivePlans ? await deps.getActivePlans() : [];

  for (const plan of planos) {
    inseridas += await rebuildSchedule(plan.id, deps, horizonMonths);

    if (deps.listOccurrences && deps.updateOccurrenceStatus) {
      const ocorrencias = await deps.listOccurrences(plan.id);
      for (const occ of ocorrencias) {
        const pendente =
          occ.status === "scheduled" || occ.status === "due";
        const semConclusao = !occ.completedAt;
        if (pendente && semConclusao && occ.windowEnd < hoje) {
          await deps.updateOccurrenceStatus(occ, "overdue");
          marcadasOverdue += 1;
        }
      }
    }
  }

  return { inseridas, marcadasOverdue };
}

// Gatilho de conclusao para templates anchorMode='completion':
// gera a proxima ocorrencia a partir de completedAt + intervalo.
export async function aoConcluirOcorrencia(
  occ: Occurrence,
  template: Template,
  deps: SchedulerDeps,
): Promise<Occurrence | null> {
  if (template.anchorMode !== "completion") {
    return null;
  }
  const base = occ.completedAt ?? occ.scheduledDate;
  const plan = await deps.getPlan(occ.planId);
  const holidays = plan ? await deps.getHolidays(plan) : new Set<string>();

  // Proxima due derivada de completedAt + intervalo (1 passo).
  const proximaDue = toISODate(
    addInterval(
      fromISODate(base),
      template.intervalUnit,
      template.intervalCount,
    ),
  );

  // Reaproveita os helpers de janela/dia util gerando 1 ocorrencia.
  const [gerada] = gerarOcorrencias({
    startDate: proximaDue,
    unit: template.intervalUnit,
    count: template.intervalCount,
    toleranceDays: template.toleranceDays,
    horizonEnd: proximaDue,
    holidays,
    firstDueIsStart: true,
  });

  const proxima: Occurrence = {
    planId: occ.planId,
    templateId: template.id,
    dueDate: gerada.dueDate,
    scheduledDate: gerada.scheduledDate,
    windowStart: gerada.windowStart,
    windowEnd: gerada.windowEnd,
    status: "scheduled",
    completedAt: null,
  };

  await deps.insertOccurrences([proxima]);
  return proxima;
}
