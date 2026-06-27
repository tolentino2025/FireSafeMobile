// FASE 5 — Sincroniza as ocorrências ITM futuras para o Supabase.
// O worker de e-mail (Edge Function notify-48h) lê de public.itm_occurrences.
// Como as ocorrências oficiais vivem no AsyncStorage (cliente), espelhamos aqui
// as próximas (não concluídas, dentro do horizonte) com `notify_at` já calculado.
//
// REQUISITOS: Supabase configurado E usuário autenticado (precisamos de user_id +
// e-mail reais). Sem login, é no-op — o lembrete por e-mail exige conta.
// Offline-first preservado: falhas de rede são silenciosas (tenta de novo depois).
import { supabase, isSupabaseConfigured } from "@/utils/supabase";
import type { ItmOccurrence } from "@/contexts/ITMContext";
import {
  getItmNotificationPreferences,
  type ItmNotificationPreferences,
} from "@/utils/itm/notificationPreferences";
import { NOTIFY_OFFSET_HOURS } from "@/utils/itm/datetime";

// Quantas ocorrências futuras espelhar por sync (mantém o payload enxuto).
const MAX_SYNCED_OCCURRENCES = 200;

// Offset fixo do fuso padrão do app (America/Sao_Paulo = UTC-3, sem horário de verão).
function tzOffsetSuffix(tz: string): string {
  return tz === "America/Sao_Paulo" ? "-03:00" : "Z";
}

// Instante (UTC) em que o lembrete de 48h deve disparar para uma ocorrência.
function computeNotifyAt(
  occ: ItmOccurrence,
  prefs: ItmNotificationPreferences,
): string | null {
  const baseDate = occ.scheduledDate || occ.dueDate; // YYYY-MM-DD
  if (!baseDate) return null;
  const time = prefs.defaultStartTime || "08:00";
  const suffix = tzOffsetSuffix(prefs.defaultTimezone);
  const start = new Date(`${baseDate}T${time}:00${suffix}`);
  if (isNaN(start.getTime())) return null;
  start.setHours(start.getHours() - NOTIFY_OFFSET_HOURS);
  return start.toISOString();
}

export async function syncItmOccurrencesToSupabase(
  occurrences: ItmOccurrence[],
): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user?.id || !user.email) return; // sem login real → e-mail não se aplica

    const prefs = await getItmNotificationPreferences();
    const now = Date.now();
    const horizonMs = prefs.horizonDays * 24 * 60 * 60 * 1000;

    const rows = occurrences
      .filter((o) => !o.completedAt)
      .map((o) => ({ o, notifyAt: computeNotifyAt(o, prefs) }))
      .filter(({ o, notifyAt }) => {
        if (!notifyAt) return false;
        const due = new Date(`${o.scheduledDate || o.dueDate}T00:00:00`).getTime();
        return due > now && due - now <= horizonMs;
      })
      .slice(0, MAX_SYNCED_OCCURRENCES)
      .map(({ o, notifyAt }) => ({
        user_id: user.id,
        occurrence_id: o.id,
        plan_id: o.planId,
        property_name: (o as { propertyName?: string }).propertyName ?? null,
        system: o.system,
        activity: o.activity,
        frequency: o.frequency,
        description: o.description,
        email: user.email,
        due_date: o.dueDate,
        scheduled_date: o.scheduledDate,
        timezone: prefs.defaultTimezone,
        notify_at: notifyAt,
        completed_at: null,
        status: o.status,
        updated_at: new Date().toISOString(),
      }));

    // Reconciliação: remove ocorrências PENDENTES (não concluídas) que não estão
    // mais na lista atual do cliente (plano removido/regenerado/sem data) — evita
    // e-mail 48h órfão. Roda mesmo com `rows` vazio (ex.: todos os planos removidos).
    const keepIds = rows.map((r) => r.occurrence_id);
    let del = supabase
      .from("itm_occurrences")
      .delete()
      .eq("user_id", user.id)
      .is("completed_at", null);
    if (keepIds.length > 0) {
      const list = keepIds
        .map((id) => `"${String(id).replace(/["()]/g, "")}"`)
        .join(",");
      del = del.not("occurrence_id", "in", `(${list})`);
    }
    await del;

    if (rows.length > 0) {
      await supabase
        .from("itm_occurrences")
        .upsert(rows, { onConflict: "user_id,occurrence_id" });
    }
  } catch (e) {
    // Silencioso: offline-first. O próximo sync tenta de novo.
    console.warn("[itm] syncItmOccurrencesToSupabase falhou:", e);
  }
}

// Marca uma ocorrência como concluída no espelho (cancela o e-mail pendente).
export async function markItmOccurrenceCompletedInSupabase(
  occurrenceId: string,
  completedAt: string,
): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user?.id) return;
    await supabase
      .from("itm_occurrences")
      .update({ completed_at: completedAt, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("occurrence_id", occurrenceId);
  } catch (e) {
    console.warn("[itm] markItmOccurrenceCompletedInSupabase falhou:", e);
  }
}
