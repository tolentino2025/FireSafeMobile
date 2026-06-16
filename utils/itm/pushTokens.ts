// FASE 6 — Registro de push remoto (Expo Push) por usuário.
// Mobile-only (push remoto não existe no web) e requer login + projectId do EAS.
// O token é guardado em user_push_tokens; o servidor (notify-48h) envia o push.
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { supabase, isSupabaseConfigured } from "@/utils/supabase";

export type PushRegisterReason =
  | "ok"
  | "web"
  | "supabase"
  | "login"
  | "permission"
  | "projectId"
  | "error";

function getProjectId(): string | undefined {
  const c = Constants as {
    expoConfig?: { extra?: { eas?: { projectId?: string } } };
    easConfig?: { projectId?: string };
  };
  return c.expoConfig?.extra?.eas?.projectId ?? c.easConfig?.projectId;
}

// Registra (ou atualiza) o token de push do dispositivo para o usuário logado.
export async function registerForItmPush(): Promise<PushRegisterReason> {
  if (Platform.OS === "web") return "web";
  if (!isSupabaseConfigured) return "supabase";
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user?.id) return "login";

    let status = (await Notifications.getPermissionsAsync()).status;
    if (status !== "granted") {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== "granted") return "permission";

    const projectId = getProjectId();
    if (!projectId) return "projectId"; // precisa de build EAS com projectId

    const { data: pushToken } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    await supabase.from("user_push_tokens").upsert(
      {
        user_id: user.id,
        provider: "expo",
        push_token: pushToken,
        platform: Platform.OS,
        device_name: (Constants as { deviceName?: string }).deviceName ?? null,
        is_active: true,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,push_token" },
    );
    return "ok";
  } catch (e) {
    console.warn("[itm] registerForItmPush falhou:", e);
    return "error";
  }
}

// Desativa os tokens de push do usuário (ao desligar push nas preferências).
export async function deactivateItmPush(): Promise<void> {
  if (Platform.OS === "web" || !isSupabaseConfigured) return;
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user?.id) return;
    await supabase
      .from("user_push_tokens")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
  } catch (e) {
    console.warn("[itm] deactivateItmPush falhou:", e);
  }
}
