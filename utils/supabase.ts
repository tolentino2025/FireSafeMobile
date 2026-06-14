import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Indica se o Supabase esta realmente configurado (env presentes).
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// IMPORTANTE: createClient("", "") LANCA excecao ("supabaseUrl is required"),
// o que quebraria o app inteiro no import (tela branca) quando o Supabase nao
// esta configurado. Por isso usamos placeholders validos como fallback.
// O AuthContext so chama o cliente quando isSupabaseConfigured === true.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: isSupabaseConfigured,
      persistSession: isSupabaseConfigured,
      detectSessionInUrl: false,
    },
  },
);
