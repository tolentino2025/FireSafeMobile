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
  addItmPlanToPendingSync,
  addItmOccurrenceToPendingSync,
  syncPendingData,
} from "@/utils/syncService";

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

// Ocorrencia agendada (Parte 2) + completedAt.
export interface ItmOccurrence extends ItmOccurrenceFlat {
  completedAt?: string;
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
  concluirOcorrencia: (id: string, dataConclusao: string) => Promise<void>;
  regenerarAgenda: (planId: string) => Promise<void>;
  getOcorrenciasDoPlano: (planId: string) => ItmOccurrence[];
  getPlanoById: (id: string) => ItmPlan | undefined;
  proximasOcorrencias: (limite: number) => ItmOccurrence[];
}

const ITMContext = createContext<ITMContextType | undefined>(undefined);

const ITM_PLANS_KEY = "@firesafe_itm_plans";
const ITM_OCCURRENCES_KEY = "@firesafe_itm_occurrences";

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

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [storedPlans, storedOccurrences] = await Promise.all([
        AsyncStorage.getItem(ITM_PLANS_KEY),
        AsyncStorage.getItem(ITM_OCCURRENCES_KEY),
      ]);
      if (storedPlans) {
        setPlans(JSON.parse(storedPlans));
      }
      if (storedOccurrences) {
        setOccurrences(JSON.parse(storedOccurrences));
      }
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

  const concluirOcorrencia = async (id: string, dataConclusao: string) => {
    let alvo: ItmOccurrence | undefined;
    const newOccurrences = occurrences.map((o) => {
      if (o.id === id) {
        alvo = {
          ...o,
          status: "completed",
          completedAt: dataConclusao,
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

  const getPlanoById = (id: string) => plans.find((p) => p.id === id);

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
        regenerarAgenda,
        getOcorrenciasDoPlano,
        getPlanoById,
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
