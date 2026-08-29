// Liberação de uso (entitlement) do FireSafe ITM.
//
// Modelo: a versão de avaliação permite FREE_INSPECTION_LIMIT inspeções. Depois
// disso, o uso é liberado por uma CHAVE DE ACESSO resgatada dentro do app
// (public.redeem_access_key). A chave libera a empresa inteira — todos os
// membros ativos — ou o usuário avulso, quando ele ainda não tem empresa.
//
// O app não vende nada e não expõe caminho de compra: apenas o campo de resgate.
//
// Offline: a liberação vigente fica em cache por usuário. Sem rede, o cache
// vale até a data de expiração; ao voltar a rede, o servidor é a verdade.
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase, isSupabaseConfigured } from "@/utils/supabase";
import { useAuth } from "@/contexts/AuthContext";

export const FREE_INSPECTION_LIMIT = 5;

const CACHE_PREFIX = "@firesafe_entitlement";

export type PlanType = "free" | "premium";

export type RedeemError = "invalid" | "used" | "revoked" | "offline" | "unknown";

interface Entitlement {
  plan: PlanType;
  scope?: "company" | "user";
  expiresAt?: string | null;
}

const FREE: Entitlement = { plan: "free" };

interface SubscriptionContextType {
  isPremium: boolean;
  activePlan: PlanType;
  expiresAt: string | null;
  accessGateVisible: boolean;
  isLoading: boolean;
  showAccessGate: () => void;
  hideAccessGate: () => void;
  canCreateInspection: (currentCount: number) => boolean;
  /** Resgata a chave. Devolve null em sucesso ou o motivo da recusa. */
  redeemAccessKey: (key: string) => Promise<RedeemError | null>;
  refreshEntitlement: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

function cacheKey(userId: string | null): string {
  return `${CACHE_PREFIX}::${userId || "guest"}`;
}

function isActive(entitlement: Entitlement): boolean {
  if (entitlement.plan !== "premium") return false;
  if (!entitlement.expiresAt) return true;
  return new Date(entitlement.expiresAt) > new Date();
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [entitlement, setEntitlement] = useState<Entitlement>(FREE);
  const [accessGateVisible, setAccessGateVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Build web/E2E (sem backend de licença): libera tudo para testes.
  const GATE_DISABLED = process.env.EXPO_PUBLIC_NO_IAP === "1";

  const persist = useCallback(
    async (next: Entitlement) => {
      setEntitlement(next);
      try {
        await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(next));
      } catch (error) {
        console.error("Error caching entitlement:", error);
      }
    },
    [userId],
  );

  const refreshEntitlement = useCallback(async () => {
    if (!isSupabaseConfigured || !userId) return;
    try {
      const { data, error } = await supabase.rpc("my_entitlement");
      if (error) throw error;
      const next: Entitlement =
        data && data.plan === "premium"
          ? { plan: "premium", scope: data.scope, expiresAt: data.expiresAt ?? null }
          : FREE;
      await persist(next);
    } catch (error) {
      // Offline ou servidor fora: mantém o cache local até expirar.
      console.error("Error refreshing entitlement:", error);
    }
  }, [userId, persist]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const stored = await AsyncStorage.getItem(cacheKey(userId));
        if (!cancelled && stored) {
          const cached: Entitlement = JSON.parse(stored);
          setEntitlement(isActive(cached) ? cached : FREE);
        } else if (!cancelled) {
          setEntitlement(FREE);
        }
      } catch (error) {
        console.error("Error loading entitlement cache:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
      await refreshEntitlement();
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, refreshEntitlement]);

  const isPremium = GATE_DISABLED || isActive(entitlement);
  const activePlan: PlanType = isPremium ? "premium" : "free";

  const canCreateInspection = useCallback(
    (currentCount: number): boolean => isPremium || currentCount < FREE_INSPECTION_LIMIT,
    [isPremium],
  );

  const showAccessGate = useCallback(() => setAccessGateVisible(true), []);
  const hideAccessGate = useCallback(() => setAccessGateVisible(false), []);

  const redeemAccessKey = useCallback(
    async (key: string): Promise<RedeemError | null> => {
      if (!isSupabaseConfigured || !userId) return "offline";
      try {
        const { data, error } = await supabase.rpc("redeem_access_key", { p_key: key });
        if (error) throw error;
        if (!data?.ok) return (data?.error as RedeemError) || "unknown";
        await persist({ plan: "premium", scope: data.scope, expiresAt: data.expiresAt ?? null });
        setAccessGateVisible(false);
        return null;
      } catch (error) {
        console.error("Error redeeming access key:", error);
        return "offline";
      }
    },
    [userId, persist],
  );

  return (
    <SubscriptionContext.Provider
      value={{
        isPremium,
        activePlan,
        expiresAt: entitlement.expiresAt ?? null,
        accessGateVisible,
        isLoading,
        showAccessGate,
        hideAccessGate,
        canCreateInspection,
        redeemAccessKey,
        refreshEntitlement,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
