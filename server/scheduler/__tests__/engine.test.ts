import { describe, expect, it } from "vitest";
import {
  addInterval,
  fromISODate,
  gerarOcorrencias,
  generateOccurrences,
  toBusinessDay,
  toISODate,
} from "../engine";
import {
  aoConcluirOcorrencia,
  rebuildSchedule,
  type Occurrence,
  type Plan,
  type SchedulerDeps,
  type Template,
} from "../rebuild";

// Repositorio em memoria respeitando a constraint unique(planId, templateId, dueDate).
function criarRepoMemoria(plan: Plan, templates: Template[]) {
  const ocorrencias = new Map<string, Occurrence>();
  const chave = (o: { planId: string; templateId: string; dueDate: string }) =>
    `${o.planId}|${o.templateId}|${o.dueDate}`;

  const deps: SchedulerDeps = {
    hoje: () => "2025-01-01",
    getPlan: (id) => (id === plan.id ? plan : undefined),
    getActivePlans: () => [plan],
    getActiveTemplates: () => templates.filter((t) => t.active),
    getTemplate: (id) => templates.find((t) => t.id === id),
    getHolidays: () => new Set<string>(),
    // onConflictDoNothing: nao sobrescreve existentes.
    insertOccurrences: (occs) => {
      let inseridas = 0;
      for (const o of occs) {
        const k = chave(o);
        if (!ocorrencias.has(k)) {
          ocorrencias.set(k, { ...o, id: k });
          inseridas += 1;
        }
      }
      return inseridas;
    },
    listOccurrences: () => [...ocorrencias.values()],
    updateOccurrenceStatus: (occ, status) => {
      const k = chave(occ);
      const atual = ocorrencias.get(k);
      if (atual) ocorrencias.set(k, { ...atual, status });
    },
  };

  return { deps, ocorrencias };
}

describe("addInterval", () => {
  it("soma meses preservando fim de mes (drift-safe)", () => {
    expect(toISODate(addInterval(fromISODate("2025-01-31"), "month", 1))).toBe(
      "2025-02-28",
    );
  });
});

describe("generateOccurrences (drift-safe)", () => {
  it("ancora 2025-01-31 mensal nao perde o fim de mes", () => {
    const ocs = generateOccurrences({
      startDate: fromISODate("2025-01-31"),
      unit: "month",
      count: 1,
      toleranceDays: 0,
      horizonEnd: fromISODate("2025-06-01"),
      holidays: new Set(),
      firstDueIsStart: false,
    });
    const dueDates = ocs.map((o) => toISODate(o.dueDate));
    expect(dueDates).toEqual([
      "2025-02-28",
      "2025-03-31",
      "2025-04-30",
      "2025-05-31",
    ]);
  });
});

describe("toBusinessDay", () => {
  it("avanca sabado/domingo para a segunda", () => {
    // 2025-03-29 eh sabado.
    expect(toISODate(toBusinessDay(fromISODate("2025-03-29"), new Set()))).toBe(
      "2025-03-31",
    );
  });

  it("pula feriado configurado", () => {
    const holidays = new Set(["2025-03-31"]); // segunda feriado
    expect(toISODate(toBusinessDay(fromISODate("2025-03-29"), holidays))).toBe(
      "2025-04-01",
    );
  });
});

describe("dia util nao vira ancora", () => {
  it("scheduledDate ajusta para dia util mas a sequencia de dueDate continua teorica", () => {
    // Ancora 2025-02-28 (sexta), mensal. dueDate de marco = 2025-03-28 (sexta),
    // abril = 2025-04-28 (segunda)... escolhemos uma ancora cujo proximo due caia
    // no fim de semana para validar a separacao.
    const ocs = gerarOcorrencias({
      startDate: "2025-05-31", // sabado
      unit: "month",
      count: 1,
      toleranceDays: 0,
      horizonEnd: "2025-08-01",
      holidays: new Set<string>(),
      firstDueIsStart: true,
    });
    // primeira ocorrencia: due = 2025-05-31 (sabado) -> scheduled = 2025-06-02 (segunda)
    expect(ocs[0].dueDate).toBe("2025-05-31");
    expect(ocs[0].scheduledDate).toBe("2025-06-02");
    // proximo dueDate derivado da ancora teorica, nao do scheduled:
    expect(ocs[1].dueDate).toBe("2025-06-30");
    expect(ocs[2].dueDate).toBe("2025-07-31");
  });
});

describe("rebuildSchedule idempotente", () => {
  const plan: Plan = {
    id: "plan-1",
    assetId: "asset-1",
    startDate: "2025-01-01",
    normativeProfile: "nfpa25",
  };
  const tplMensal: Template = {
    id: "tpl-mensal",
    key: "tpl-mensal",
    system: "Wet Pipe",
    activity: "inspection",
    description: "teste",
    intervalUnit: "month",
    intervalCount: 1,
    toleranceDays: 0,
    anchorMode: "calendar",
    normativeRef: "NFPA 25",
    sourceRef: ["X"],
    active: true,
  };

  it("rodar duas vezes nao duplica e nao sobrescreve completed", async () => {
    const { deps, ocorrencias } = criarRepoMemoria(plan, [tplMensal]);

    const ins1 = await rebuildSchedule(plan.id, deps, 6);
    expect(ins1).toBeGreaterThan(0);
    const totalApos1 = ocorrencias.size;

    // Marca a primeira como completed.
    const primeira = [...ocorrencias.values()][0];
    ocorrencias.set(`${primeira.planId}|${primeira.templateId}|${primeira.dueDate}`, {
      ...primeira,
      status: "completed",
      completedAt: primeira.scheduledDate,
    });

    const ins2 = await rebuildSchedule(plan.id, deps, 6);
    expect(ins2).toBe(0); // nada novo inserido
    expect(ocorrencias.size).toBe(totalApos1); // nao duplicou

    // a completed permanece completed.
    const aindaCompleted = [...ocorrencias.values()].find(
      (o) => o.dueDate === primeira.dueDate,
    );
    expect(aindaCompleted?.status).toBe("completed");
  });
});

describe("anchorMode completion", () => {
  it("gera a proxima ocorrencia derivada de completedAt", async () => {
    const plan: Plan = {
      id: "plan-c",
      assetId: "asset-c",
      startDate: "2025-01-01",
      normativeProfile: "nfpa25",
    };
    const tpl: Template = {
      id: "tpl-comp",
      key: "tpl-comp",
      system: "Fire Pump",
      activity: "test",
      description: "teste completion",
      intervalUnit: "month",
      intervalCount: 1,
      toleranceDays: 0,
      anchorMode: "completion",
      normativeRef: "NFPA 25",
      sourceRef: ["Y"],
      active: true,
    };
    const { deps, ocorrencias } = criarRepoMemoria(plan, [tpl]);

    await rebuildSchedule(plan.id, deps, 18);
    // completion gera apenas a ancora inicial.
    expect(ocorrencias.size).toBe(1);

    const ancora = [...ocorrencias.values()][0];
    const concluida: Occurrence = {
      ...ancora,
      status: "completed",
      completedAt: "2025-03-10",
    };

    const proxima = await aoConcluirOcorrencia(concluida, tpl, deps);
    expect(proxima).not.toBeNull();
    // proxima due = completedAt + 1 mes = 2025-04-10.
    expect(proxima?.dueDate).toBe("2025-04-10");
    expect(ocorrencias.size).toBe(2);
  });
});

describe("executarJobDiario marca overdue", () => {
  it("marca scheduled/due com windowEnd < hoje e sem conclusao", async () => {
    const plan: Plan = {
      id: "plan-o",
      assetId: "asset-o",
      startDate: "2025-01-01",
      normativeProfile: "nfpa25",
    };
    const tpl: Template = {
      id: "tpl-o",
      key: "tpl-o",
      system: "Wet Pipe",
      activity: "inspection",
      description: "teste overdue",
      intervalUnit: "month",
      intervalCount: 1,
      toleranceDays: 0,
      anchorMode: "calendar",
      normativeRef: "NFPA 25",
      sourceRef: ["Z"],
      active: true,
    };
    const { deps, ocorrencias } = criarRepoMemoria(plan, [tpl]);
    // hoje fixo via deps.hoje = 2025-01-01; ajustamos para um hoje posterior.
    (deps as { hoje: () => string }).hoje = () => "2025-04-01";

    const { marcadasOverdue } = await executarComHoje(deps);
    expect(marcadasOverdue).toBeGreaterThan(0);
    const overdue = [...ocorrencias.values()].filter(
      (o) => o.status === "overdue",
    );
    expect(overdue.length).toBe(marcadasOverdue);
  });
});

// Auxiliar para importar executarJobDiario sem poluir o topo.
async function executarComHoje(deps: SchedulerDeps) {
  const { executarJobDiario } = await import("../rebuild");
  return executarJobDiario(deps, 18);
}
