import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ITM_TEMPLATES } from "@/constants/itmTemplates";
import {
  gerarAgendaDoPlano,
  type ItmOccurrenceFlat,
  type ItmOccurrenceStatus,
} from "@/utils/itm/scheduler";
import {
  resumir,
  resumirPorSistema,
  type ResumoAgenda,
  type ResumoSistema,
} from "@/utils/itm/agenda";
import {
  addItmPlanToPendingSync,
  addItmOccurrenceToPendingSync,
  syncPendingData,
} from "@/utils/syncService";
import { syncItmLocalReminders } from "@/utils/itm/localReminders";

// Plano de ITM associado a uma propriedade (asset).
export interface ItmPlan {
  id: string;
  assetId: string; // id da propriedade
  propertyName: string;
  startDate: string; // YYYY-MM-DD
  normativeProfile: string; // ex.: "nfpa25"
  systemKeys: string[];
  createdAt: string;
}

// Resultado da execucao de uma tarefa de ITM.
export type ItmResult = "approved" | "nonconforming" | "pending";

// Ocorrencia agendada (Parte 2) + dados de conclusao.
export interface ItmOccurrence extends ItmOccurrenceFlat {
  completedAt?: string;
  result?: ItmResult;
  note?: string;
  completedBy?: string;
  inspectionId?: string;
}

// Dados informados ao concluir uma tarefa.
export interface ConcluirInput {
  completedAt: string;
  result?: ItmResult;
  note?: string;
  completedBy?: string;
  inspectionId?: string;
}

export interface CriarPlanoInput {
  assetId: string;
  propertyName: string;
  startDate: string;
  systemKeys: string[];
  normativeProfile?: string;
}

interface ITMContextType {
  plans: ItmPlan[];
  occurrences: ItmOccurrence[];
  isLoading: boolean;
  criarPlano: (input: CriarPlanoInput) => Promise<ItmPlan>;
  removerPlano: (id: string) => Promise<void>;
  concluirOcorrencia: (id: string, dados: ConcluirInput) => Promise<void>;
  reabrirOcorrencia: (id: string) => Promise<void>;
  regenerarAgenda: (planId: string) => Promise<void>;
  getOcorrenciasDoPlano: (planId: string) => ItmOccurrence[];
  getOcorrenciasDoSistema: (planId: string, systemKey: string) => ItmOccurrence[];
  getResumoDoPlano: (planId: string) => ResumoAgenda;
  getSistemasDoPlano: (planId: string) => ResumoSistema[];
  getPlanoById: (id: string) => ItmPlan | undefined;
  planoAtivoDaPropriedade: (assetId: string) => ItmPlan | undefined;
  proximasOcorrencias: (limite: number) => ItmOccurrence[];
}

const ITMContext = createContext<ITMContextType | undefined>(undefined);

const ITM_PLANS_KEY = "@firesafe_itm_plans";
const ITM_OCCURRENCES_KEY = "@firesafe_itm_occurrences";
const ITM_VERSION_KEY = "@firesafe_itm_version";
// v2: corrige geracao (firstDueIsStart=false, horizonte 12m). Regera agendas antigas.
const ITM_CURRENT_VERSION = "2";

function gerarId(prefixo: string): string {
  return `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function hojeISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Aplica overdue na LEITURA: windowEnd < hoje e sem completedAt.
function comStatusCalculado(occ: ItmOccurrence): ItmOccurrence {
  if (occ.completedAt) {
    return occ.status === "completed" ? occ : { ...occ, status: "completed" };
  }
  const status: ItmOccurrenceStatus =
    occ.windowEnd < hojeISO() ? "overdue" : "scheduled";
  return occ.status === status ? occ : { ...occ, status };
}

interface ITMProviderProps {
  children: ReactNode;
}

export function ITMProvider({ children }: ITMProviderProps) {
  const [plans, setPlans] = useState<ItmPlan[]>([]);
  const [occurrences, setOccurrences] = useState<ItmOccurrence[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // FASE 2 — mantém os lembretes locais (48h) sincronizados com as ocorrências.
  // Mobile-only e só se o usuário habilitar push nas preferências (no-op no web).
  useEffect(() => {
    if (!isLoading) {
      syncItmLocalReminders(occurrences).catch(() => {});
    }
  }, [occurrences, isLoading]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [storedPlans, storedOccurrences, version] = await Promise.all([
        AsyncStorage.getItem(ITM_PLANS_KEY),
        AsyncStorage.getItem(ITM_OCCURRENCES_KEY),
        AsyncStorage.getItem(ITM_VERSION_KEY),
      ]);

      const loadedPlans: ItmPlan[] = storedPlans ? JSON.parse(storedPlans) : [];
      let loadedOccurrences: ItmOccurrence[] = storedOccurrences
        ? JSON.parse(storedOccurrences)
        : [];

      // Migracao v2: regenera agendas de planos criados com a logica antiga
      // (que jogava todas as atividades para a data de inicio). Preserva
      // conclusoes cujo id deterministico ainda exista na nova agenda.
      if (version !== ITM_CURRENT_VERSION && loadedPlans.length > 0) {
        const concluidas = new Map<string, ItmOccurrence>();
        for (const occ of loadedOccurrences) {
          if (occ.completedAt) concluidas.set(occ.id, occ);
        }
        const regeneradas: ItmOccurrence[] = [];
        for (const plano of loadedPlans) {
          const novas = gerarAgendaDoPlano(plano, ITM_TEMPLATES);
          for (const o of novas) {
            const anterior = concluidas.get(o.id);
            regeneradas.push(
              anterior
                ? {
                    ...o,
                    status: "completed",
                    completedAt: anterior.completedAt,
                    result: anterior.result,
                    note: anterior.note,
                    completedBy: anterior.completedBy,
                    inspectionId: anterior.inspectionId,
                  }
                : (o as ItmOccurrence),
            );
          }
        }
        loadedOccurrences = regeneradas;
        await AsyncStorage.setItem(
          ITM_OCCURRENCES_KEY,
          JSON.stringify(regeneradas),
        );
        await AsyncStorage.setItem(ITM_VERSION_KEY, ITM_CURRENT_VERSION);
      } else if (version !== ITM_CURRENT_VERSION) {
        await AsyncStorage.setItem(ITM_VERSION_KEY, ITM_CURRENT_VERSION);
      }

      setPlans(loadedPlans);
      setOccurrences(loadedOccurrences);
    } catch (error) {
      console.error("Error loading ITM data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePlans = async (newPlans: ItmPlan[]) => {
    await AsyncStorage.setItem(ITM_PLANS_KEY, JSON.stringify(newPlans));
    setPlans(newPlans);
  };

  const saveOccurrences = async (newOccurrences: ItmOccurrence[]) => {
    await AsyncStorage.setItem(
      ITM_OCCURRENCES_KEY,
      JSON.stringify(newOccurrences),
    );
    setOccurrences(newOccurrences);
  };

  // Gera (ou regera) a agenda de um plano, preservando completedAt das ocorrencias
  // ja existentes (idempotencia via id deterministico).
  const construirOcorrencias = (
    plano: ItmPlan,
    anteriores: ItmOccurrence[],
  ): ItmOccurrence[] => {
    const concluidas = new Map<string, ItmOccurrence>();
    for (const occ of anteriores) {
      if (occ.planId === plano.id && occ.completedAt) {
        concluidas.set(occ.id, occ);
      }
    }

    const novas = gerarAgendaDoPlano(plano, ITM_TEMPLATES);
    return novas.map((o) => {
      const concluida = concluidas.get(o.id);
      if (concluida) {
        return { ...o, status: "completed", completedAt: concluida.completedAt };
      }
      return o as ItmOccurrence;
    });
  };

  const criarPlano = async (input: CriarPlanoInput): Promise<ItmPlan> => {
    const plano: ItmPlan = {
      id: gerarId("itmplan"),
      assetId: input.assetId,
      propertyName: input.propertyName,
      startDate: input.startDate,
      normativeProfile: input.normativeProfile ?? "nfpa25",
      systemKeys: input.systemKeys,
      createdAt: new Date().toISOString(),
    };

    const newPlans = [...plans, plano];
    await savePlans(newPlans);

    const novasOcorrencias = construirOcorrencias(plano, occurrences);
    const newOccurrences = [...occurrences, ...novasOcorrencias];
    await saveOccurrences(newOccurrences);

    // Sync offline-first (so envia se houver API configurada e online).
    await addItmPlanToPendingSync(plano);
    for (const occ of novasOcorrencias) {
      await addItmOccurrenceToPendingSync(occ);
    }
    syncPendingData().catch(console.error);

    return plano;
  };

  const removerPlano = async (id: string) => {
    const newPlans = plans.filter((p) => p.id !== id);
    const newOccurrences = occurrences.filter((o) => o.planId !== id);
    await savePlans(newPlans);
    await saveOccurrences(newOccurrences);
  };

  const concluirOcorrencia = async (id: string, dados: ConcluirInput) => {
    let alvo: ItmOccurrence | undefined;
    const newOccurrences = occurrences.map((o) => {
      if (o.id === id) {
        alvo = {
          ...o,
          status: "completed",
          completedAt: dados.completedAt,
          result: dados.result,
          note: dados.note,
          completedBy: dados.completedBy,
          inspectionId: dados.inspectionId,
        };
        return alvo;
      }
      return o;
    });
    await saveOccurrences(newOccurrences);
    if (alvo) {
      await addItmOccurrenceToPendingSync(alvo);
      syncPendingData().catch(console.error);
    }
  };

  // Reabre uma ocorrencia concluida (volta para agendada).
  const reabrirOcorrencia = async (id: string) => {
    let alvo: ItmOccurrence | undefined;
    const newOccurrences = occurrences.map((o) => {
      if (o.id === id) {
        const { completedAt, result, note, completedBy, inspectionId, ...resto } =
          o;
        alvo = { ...resto, status: "scheduled" } as ItmOccurrence;
        return alvo;
      }
      return o;
    });
    await saveOccurrences(newOccurrences);
    if (alvo) {
      await addItmOccurrenceToPendingSync(alvo);
      syncPendingData().catch(console.error);
    }
  };

  const regenerarAgenda = async (planId: string) => {
    const plano = plans.find((p) => p.id === planId);
    if (!plano) return;

    const outras = occurrences.filter((o) => o.planId !== planId);
    const regeradas = construirOcorrencias(plano, occurrences);
    const newOccurrences = [...outras, ...regeradas];
    await saveOccurrences(newOccurrences);

    for (const occ of regeradas) {
      await addItmOccurrenceToPendingSync(occ);
    }
    syncPendingData().catch(console.error);
  };

  const getOcorrenciasDoPlano = (planId: string): ItmOccurrence[] => {
    return occurrences
      .filter((o) => o.planId === planId)
      .map(comStatusCalculado)
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));
  };

  // Ocorrencias de UM sistema dentro de um plano (nivel 3 da navegacao).
  const getOcorrenciasDoSistema = (
    planId: string,
    systemKey: string,
  ): ItmOccurrence[] => {
    return occurrences
      .filter((o) => o.planId === planId && o.system === systemKey)
      .map(comStatusCalculado)
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));
  };

  // Resumo (contadores) de um plano inteiro.
  const getResumoDoPlano = (planId: string): ResumoAgenda => {
    const occs = occurrences.filter((o) => o.planId === planId);
    return resumir(occs);
  };

  // Resumo por sistema (nivel 2 da navegacao).
  const getSistemasDoPlano = (planId: string): ResumoSistema[] => {
    const occs = occurrences.filter((o) => o.planId === planId);
    return resumirPorSistema(occs);
  };

  const getPlanoById = (id: string) => plans.find((p) => p.id === id);

  // Plano ativo existente para uma propriedade (para evitar duplicidade).
  const planoAtivoDaPropriedade = (assetId: string): ItmPlan | undefined =>
    plans.find((p) => p.assetId === assetId);

  // Seletor: proximas ocorrencias pendentes (nao concluidas), ordenadas por dueDate.
  const proximasOcorrencias = (limite: number): ItmOccurrence[] => {
    return occurrences
      .filter((o) => !o.completedAt)
      .map(comStatusCalculado)
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0))
      .slice(0, limite);
  };

  return (
    <ITMContext.Provider
      value={{
        plans,
        occurrences,
        isLoading,
        criarPlano,
        removerPlano,
        concluirOcorrencia,
        reabrirOcorrencia,
        regenerarAgenda,
        getOcorrenciasDoPlano,
        getOcorrenciasDoSistema,
        getResumoDoPlano,
        getSistemasDoPlano,
        getPlanoById,
        planoAtivoDaPropriedade,
        proximasOcorrencias,
      }}
    >
      {children}
    </ITMContext.Provider>
  );
}

export function useITM() {
  const context = useContext(ITMContext);
  if (context === undefined) {
    throw new Error("useITM must be used within an ITMProvider");
  }
  return context;
}
