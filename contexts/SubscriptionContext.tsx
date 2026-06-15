import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const FREE_INSPECTION_LIMIT = 5;

const SUBSCRIPTION_STORAGE_KEY = "@firesafe_subscription";

export type PlanType = "free" | "monthly" | "annual";

interface SubscriptionData {
  plan: PlanType;
  purchasedAt?: string;
  expiresAt?: string;
}

interface SubscriptionContextType {
  isPremium: boolean;
  activePlan: PlanType;
  paywallVisible: boolean;
  isLoading: boolean;
  showPaywall: () => void;
  hidePaywall: () => void;
  canCreateInspection: (currentCount: number) => boolean;
  // TODO: Replace with real IAP purchase flow
  activatePremium: (plan: "monthly" | "annual") => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({ plan: "free" });
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const stored = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      if (stored) {
        const data: SubscriptionData = JSON.parse(stored);
        if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
          const expired: SubscriptionData = { plan: "free" };
          await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(expired));
          setSubscriptionData(expired);
        } else {
          setSubscriptionData(data);
        }
      }
    } catch (error) {
      console.error("Error loading subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // No build de teste/web (sem IAP), libera tudo como premium para testes.
  // No build real (iOS com IAP), mantém a regra normal de assinatura.
  const IAP_DISABLED = process.env.EXPO_PUBLIC_NO_IAP === "1";
  const isPremium = IAP_DISABLED || subscriptionData.plan !== "free";
  const activePlan = subscriptionData.plan;

  const canCreateInspection = (currentCount: number): boolean => {
    return isPremium || currentCount < FREE_INSPECTION_LIMIT;
  };

  const showPaywall = () => setPaywallVisible(true);
  const hidePaywall = () => setPaywallVisible(false);

  // TODO: Wire up to real IAP (expo-in-app-purchases or RevenueCat)
  const activatePremium = async (plan: "monthly" | "annual") => {
    const now = new Date();
    const expiresAt = new Date(now);
    if (plan === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }
    const data: SubscriptionData = {
      plan,
      purchasedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(data));
    setSubscriptionData(data);
    setPaywallVisible(false);
  };

  // TODO: Wire up to real IAP restore
  const restorePurchases = async () => {
    console.log("TODO: restore purchases via IAP");
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isPremium,
        activePlan,
        paywallVisible,
        isLoading,
        showPaywall,
        hidePaywall,
        canCreateInspection,
        activatePremium,
        restorePurchases,
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
