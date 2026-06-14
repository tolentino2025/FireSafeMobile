// Classificacao de status e contadores da Agenda ITM.
// Logica PURA (sem React/AsyncStorage) reutilizada pelo ITMContext e pelas telas.
import type { ItmOccurrence } from "@/contexts/ITMContext";

// Status de exibicao (4 estados) derivado em tempo de leitura.
//  - completed : possui completedAt
//  - overdue   : vencimento ja passou e nao concluida
//  - due_soon  : vence dentro da janela (padrao 30 dias)
//  - future    : vence depois da janela
export type AgendaStatus = "completed" | "overdue" | "due_soon" | "future";

export const DUE_SOON_DAYS = 30;

export function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

// Soma dias a uma data YYYY-MM-DD e devolve YYYY-MM-DD.
export function addDiasISO(iso: string, dias: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

// Classifica uma ocorrencia em um dos 4 estados de exibicao.
export function classificar(
  occ: ItmOccurrence,
  today: string = hojeISO(),
  dueSoonDays: number = DUE_SOON_DAYS,
): AgendaStatus {
  if (occ.completedAt) return "completed";
  // Usa windowEnd (vencimento + tolerancia) como limite de atraso.
  if (occ.windowEnd < today) return "overdue";
  const limiteProximo = addDiasISO(today, dueSoonDays);
  if (occ.dueDate <= limiteProximo) return "due_soon";
  return "future";
}

export interface ResumoAgenda {
  total: number; // total nao-concluidas no horizonte
  vencidas: number; // overdue
  proximas: number; // due_soon (proximos N dias)
  futuras: number; // future
  concluidas: number; // completed
  proximoVencimento: string | null; // menor dueDate nao-concluido
  ultimaConclusao: string | null; // maior completedAt
}

// Status geral de um conjunto de ocorrencias (para o card do plano/sistema).
export type StatusGeral = "sem_agenda" | "vencido" | "com_pendencias" | "em_dia";

export function statusGeral(resumo: ResumoAgenda): StatusGeral {
  if (resumo.total === 0 && resumo.concluidas === 0) return "sem_agenda";
  if (resumo.vencidas > 0) return "vencido";
  if (resumo.proximas > 0) return "com_pendencias";
  return "em_dia";
}

// Calcula contadores corretos para um conjunto de ocorrencias.
// Importante: NAO conta tarefas concluidas como pendencia; separa vencidas/proximas/futuras.
export function resumir(
  ocorrencias: ItmOccurrence[],
  today: string = hojeISO(),
  dueSoonDays: number = DUE_SOON_DAYS,
): ResumoAgenda {
  let vencidas = 0;
  let proximas = 0;
  let futuras = 0;
  let concluidas = 0;
  let proximoVencimento: string | null = null;
  let ultimaConclusao: string | null = null;

  for (const occ of ocorrencias) {
    const status = classificar(occ, today, dueSoonDays);
    switch (status) {
      case "completed":
        concluidas += 1;
        if (occ.completedAt && (!ultimaConclusao || occ.completedAt > ultimaConclusao)) {
          ultimaConclusao = occ.completedAt;
        }
        break;
      case "overdue":
        vencidas += 1;
        break;
      case "due_soon":
        proximas += 1;
        break;
      case "future":
        futuras += 1;
        break;
    }
    if (status !== "completed") {
      if (!proximoVencimento || occ.dueDate < proximoVencimento) {
        proximoVencimento = occ.dueDate;
      }
    }
  }

  return {
    total: vencidas + proximas + futuras,
    vencidas,
    proximas,
    futuras,
    concluidas,
    proximoVencimento,
    ultimaConclusao,
  };
}

export interface ResumoSistema {
  systemKey: string;
  resumo: ResumoAgenda;
}

// Agrupa as ocorrencias por sistema e calcula o resumo de cada um.
// Ordena por: vencidas desc, depois proximas desc, depois systemKey.
export function resumirPorSistema(
  ocorrencias: ItmOccurrence[],
  today: string = hojeISO(),
  dueSoonDays: number = DUE_SOON_DAYS,
): ResumoSistema[] {
  const porSistema = new Map<string, ItmOccurrence[]>();
  for (const occ of ocorrencias) {
    if (!porSistema.has(occ.system)) porSistema.set(occ.system, []);
    porSistema.get(occ.system)!.push(occ);
  }

  const lista: ResumoSistema[] = [];
  for (const [systemKey, occs] of porSistema.entries()) {
    lista.push({ systemKey, resumo: resumir(occs, today, dueSoonDays) });
  }

  lista.sort((a, b) => {
    if (a.resumo.vencidas !== b.resumo.vencidas) {
      return b.resumo.vencidas - a.resumo.vencidas;
    }
    if (a.resumo.proximas !== b.resumo.proximas) {
      return b.resumo.proximas - a.resumo.proximas;
    }
    return a.systemKey < b.systemKey ? -1 : 1;
  });

  return lista;
}
