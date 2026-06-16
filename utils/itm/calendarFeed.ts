// FASE 7 — Cliente do feed .ics assinável.
// Chama as Edge Functions manage-calendar-feed (gerar/revogar). O token só é
// retornado UMA vez (guardamos só o hash no servidor), então a URL é persistida
// localmente para reexibir. Requer Supabase configurado + usuário logado.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase, isSupabaseConfigured } from "@/utils/supabase";

const FEED_URL_KEY = "@firesafe_itm_calendar_feed_url";

export interface CalendarFeedResult {
  feedUrl: string;
  horizonDays?: number;
}

// URL do feed salva localmente (após gerar). null se nunca gerou ou foi revogado.
export async function getSavedCalendarFeedUrl(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(FEED_URL_KEY);
  } catch {
    return null;
  }
}

// Gera um novo link de calendário (revoga o anterior no servidor).
export async function createCalendarFeed(): Promise<CalendarFeedResult> {
  if (!isSupabaseConfigured) throw new Error("Supabase não configurado");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Faça login para gerar o link");

  const { data, error } = await supabase.functions.invoke("manage-calendar-feed", {
    body: { action: "create" },
  });
  if (error) throw error;
  if (!data?.feedUrl) throw new Error("Resposta inválida do servidor");

  await AsyncStorage.setItem(FEED_URL_KEY, data.feedUrl);
  return { feedUrl: data.feedUrl, horizonDays: data.horizonDays };
}

// Revoga o link ativo (calendários externos param de atualizar).
export async function revokeCalendarFeed(): Promise<void> {
  if (!isSupabaseConfigured) return;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return;

  const { error } = await supabase.functions.invoke("manage-calendar-feed", {
    body: { action: "revoke" },
  });
  if (error) throw error;
  await AsyncStorage.removeItem(FEED_URL_KEY);
}

// Indica se há sessão logada (para mostrar/ocultar a seção do feed).
export async function isLoggedIn(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return Boolean(session?.user);
}
