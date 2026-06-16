// FASE 2C — Sync bidirecional das coleções operacionais por empresa.
// PUSH: scopedStorage chama o write hook ao salvar uma coleção sob escopo de
//       empresa → espelhamos em company_data (Supabase).
// PULL: ao ativar/trocar de empresa, baixamos company_data e hidratamos o local
//       (setItemRaw, sem reempurrar). RLS garante isolamento por empresa.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase, isSupabaseConfigured } from "@/utils/supabase";
import {
  scopedStorage,
  OPERATIONAL_KEYS,
  setWriteHook,
} from "@/utils/scopedStorage";

let syncCompanyId: string | null = null;
let syncUserId: string | null = null;

export function setSyncContext(companyId: string | null, userId: string | null) {
  syncCompanyId = companyId;
  syncUserId = userId;
}

async function pushEntity(entityType: string, value: string): Promise<void> {
  if (!isSupabaseConfigured || !syncCompanyId) return;
  let payload: unknown;
  try {
    payload = JSON.parse(value);
  } catch {
    return;
  }
  try {
    await supabase.from("company_data").upsert(
      {
        company_id: syncCompanyId,
        entity_type: entityType,
        payload,
        updated_by: syncUserId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "company_id,entity_type" },
    );
  } catch (e) {
    console.warn("[company] push falhou:", entityType, e);
  }
}

// Registra o hook UMA vez (debounce simples por coleção para evitar excesso).
const timers: Record<string, ReturnType<typeof setTimeout>> = {};
export function registerCompanyWriteHook(): void {
  setWriteHook((baseKey, value) => {
    if (timers[baseKey]) clearTimeout(timers[baseKey]);
    timers[baseKey] = setTimeout(() => {
      pushEntity(baseKey, value).catch(() => {});
    }, 800);
  });
}

// Ao CRIAR uma empresa, leva os dados locais do usuário (escopo de usuário) para
// a nova empresa no servidor. Só roda numa empresa recém-criada (vazia), então é
// seguro — não sobrescreve dados de outros membros.
export async function seedCompanyFromUserScope(
  userId: string,
  companyId: string,
): Promise<void> {
  if (!isSupabaseConfigured || !userId || !companyId) return;
  for (const key of OPERATIONAL_KEYS) {
    try {
      const raw = await AsyncStorage.getItem(`${key}::u:${userId}`);
      if (!raw) continue;
      const payload = JSON.parse(raw);
      if (Array.isArray(payload) && payload.length === 0) continue;
      await supabase.from("company_data").upsert(
        {
          company_id: companyId,
          entity_type: key,
          payload,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "company_id,entity_type" },
      );
    } catch {
      /* segue para a próxima coleção */
    }
  }
}

// Baixa todas as coleções da empresa e hidrata o local (escopo atual = empresa).
export async function pullCompanyData(companyId: string | null): Promise<void> {
  if (!isSupabaseConfigured || !companyId) return;
  try {
    const { data } = await supabase
      .from("company_data")
      .select("entity_type,payload")
      .eq("company_id", companyId);
    for (const row of data ?? []) {
      const et = (row as { entity_type: string }).entity_type;
      if (!OPERATIONAL_KEYS.includes(et)) continue;
      const payload = (row as { payload: unknown }).payload;
      await scopedStorage.setItemRaw(et, JSON.stringify(payload ?? []));
    }
  } catch (e) {
    console.warn("[company] pull falhou:", e);
  }
}
