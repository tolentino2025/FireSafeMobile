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
import {
  uploadCompanyBase64,
  downloadCompanyFileAsBase64,
} from "@/utils/companyStorage";

// Detecta um "nó de foto": objeto com id e base64 (ou uri data:).
function isPhotoNode(n: unknown): n is { id: string; base64?: string; uri?: string; storagePath?: string } {
  if (!n || typeof n !== "object") return false;
  const o = n as Record<string, unknown>;
  if (typeof o.id !== "string") return false;
  const hasB64 = typeof o.base64 === "string" && (o.base64 as string).length > 0;
  const hasDataUri = typeof o.uri === "string" && (o.uri as string).startsWith("data:");
  return hasB64 || hasDataUri || typeof o.storagePath === "string";
}

// Percorre o payload aplicando fn em cada nó de foto (deep, em arrays/objetos).
async function walkPhotos(
  node: unknown,
  fn: (photo: Record<string, unknown>) => Promise<void>,
): Promise<void> {
  if (Array.isArray(node)) {
    for (const item of node) await walkPhotos(item, fn);
    return;
  }
  if (node && typeof node === "object") {
    if (isPhotoNode(node)) await fn(node as Record<string, unknown>);
    for (const v of Object.values(node as Record<string, unknown>)) {
      if (v && typeof v === "object") await walkPhotos(v, fn);
    }
  }
}

// PUSH: sobe base64 ao bucket, guarda storagePath e remove o binário do payload.
async function stripPhotosForServer(payload: unknown): Promise<unknown> {
  const clone = JSON.parse(JSON.stringify(payload));
  await walkPhotos(clone, async (photo) => {
    const b64 = (photo.base64 as string) || (typeof photo.uri === "string" && photo.uri.startsWith("data:") ? (photo.uri as string) : "");
    if (b64 && !photo.storagePath) {
      const path = await uploadCompanyBase64(`photos/${photo.id}.jpg`, b64, "image/jpeg");
      if (path) photo.storagePath = path;
    }
    // Remove o binário pesado do que vai para o servidor (fica só o storagePath).
    if (photo.storagePath) {
      delete photo.base64;
      if (typeof photo.uri === "string" && photo.uri.startsWith("data:")) photo.uri = "";
    }
  });
  return clone;
}

// PULL: baixa do bucket de volta para base64 local (display/PDF inalterados).
async function hydratePhotosFromServer(payload: unknown): Promise<unknown> {
  await walkPhotos(payload, async (photo) => {
    if (photo.storagePath && !photo.base64) {
      const dataUri = await downloadCompanyFileAsBase64(photo.storagePath as string);
      if (dataUri) {
        photo.base64 = dataUri;
        if (!photo.uri || photo.uri === "") photo.uri = dataUri;
      }
    }
  });
  return payload;
}

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
    // Fase 2D: tira os binários (base64) e sobe ao Storage antes de espelhar.
    payload = await stripPhotosForServer(payload);
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
      let payload = JSON.parse(raw);
      if (Array.isArray(payload) && payload.length === 0) continue;
      payload = await stripPhotosForServer(payload);
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
      let payload: unknown = (row as { payload: unknown }).payload ?? [];
      // Fase 2D: rehidrata os binários a partir do Storage (display/PDF locais).
      payload = await hydratePhotosFromServer(payload);
      await scopedStorage.setItemRaw(et, JSON.stringify(payload));
    }
  } catch (e) {
    console.warn("[company] pull falhou:", e);
  }
}
