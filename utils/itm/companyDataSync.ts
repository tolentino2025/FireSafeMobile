// FASE 2C — Sync bidirecional das coleções operacionais por empresa.
// PUSH: scopedStorage chama o write hook ao salvar uma coleção sob escopo de
//       empresa → espelhamos em company_data (Supabase).
// PULL: ao ativar/trocar de empresa, baixamos company_data e MESCLAMOS por id no
//       local (preserva escritas offline/locais mais novas). RLS isola por empresa.
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
// `allUploaded=false` se alguma foto precisava subir mas o upload falhou — nesse
// caso o caller ABORTA o push (não grava base64 no company_data) e re-tenta.
async function stripPhotosForServer(
  payload: unknown,
): Promise<{ payload: unknown; allUploaded: boolean }> {
  const clone = JSON.parse(JSON.stringify(payload));
  let allUploaded = true;
  await walkPhotos(clone, async (photo) => {
    const b64 =
      (photo.base64 as string) ||
      (typeof photo.uri === "string" && photo.uri.startsWith("data:") ? (photo.uri as string) : "");
    if (b64 && !photo.storagePath) {
      const path = await uploadCompanyBase64(`photos/${photo.id}.jpg`, b64, "image/jpeg");
      if (path) photo.storagePath = path;
      else allUploaded = false; // upload falhou — não enviar base64; re-tentar depois
    }
    // Remove o binário pesado do que vai para o servidor (fica só o storagePath).
    if (photo.storagePath) {
      delete photo.base64;
      if (typeof photo.uri === "string" && photo.uri.startsWith("data:")) photo.uri = "";
    }
  });
  return { payload: clone, allUploaded };
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

// Mescla duas coleções por `id`, mantendo o item mais novo (por updatedAt) e
// preservando itens locais ausentes no servidor (escritas offline). Itens do
// servidor são mantidos (sem tombstones, exclusões podem reaparecer — limitação
// conhecida do modelo de 1 JSONB por coleção).
function mergeCollectionById(local: unknown, server: unknown): unknown {
  if (!Array.isArray(server) || !Array.isArray(local) || local.length === 0) return server;
  const ts = (x: unknown): number => {
    const o = (x ?? {}) as Record<string, unknown>;
    return Date.parse((o.updatedAt as string) ?? (o.updated_at as string) ?? (o.createdAt as string) ?? "") || 0;
  };
  const byId = new Map<string, unknown>();
  for (const s of server) {
    const id = (s as Record<string, unknown> | null)?.id;
    if (id == null) return server; // coleção sem ids consistentes → não arrisca merge
    byId.set(String(id), s);
  }
  for (const l of local) {
    const id = (l as Record<string, unknown> | null)?.id;
    if (id == null) continue;
    const key = String(id);
    const s = byId.get(key);
    if (!s || ts(l) >= ts(s)) byId.set(key, l); // local mais novo/ausente → preserva
  }
  return Array.from(byId.values());
}

let syncCompanyId: string | null = null;
let syncUserId: string | null = null;

export function setSyncContext(companyId: string | null, userId: string | null) {
  syncCompanyId = companyId;
  syncUserId = userId;
}

const MAX_PUSH_RETRIES = 4;

function schedulePushRetry(
  companyId: string,
  entityType: string,
  value: string,
  attempt: number,
): void {
  if (attempt >= MAX_PUSH_RETRIES) {
    console.warn("[company] push desistiu após", attempt, "tentativas:", entityType);
    return;
  }
  const delay = Math.min(30_000, 2_000 * 2 ** attempt); // 2s, 4s, 8s, 16s
  setTimeout(() => {
    pushEntity(companyId, entityType, value, attempt + 1).catch(() => {});
  }, delay);
}

// Empurra UMA coleção para company_data. O companyId é capturado no momento da
// ESCRITA (não do flush), evitando enviar dados de uma empresa para outra após
// uma troca rápida de empresa.
async function pushEntity(
  companyId: string | null,
  entityType: string,
  value: string,
  attempt = 0,
): Promise<void> {
  if (!isSupabaseConfigured || !companyId) return;
  let payload: unknown;
  try {
    payload = JSON.parse(value);
  } catch {
    return;
  }
  try {
    // Fase 2D: tira os binários (base64) e sobe ao Storage antes de espelhar.
    const { payload: stripped, allUploaded } = await stripPhotosForServer(payload);
    if (!allUploaded) {
      // Alguma foto não subiu: não grava base64 no servidor; re-tenta depois.
      schedulePushRetry(companyId, entityType, value, attempt);
      return;
    }
    const { error } = await supabase.from("company_data").upsert(
      {
        company_id: companyId,
        entity_type: entityType,
        payload: stripped,
        updated_by: syncUserId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "company_id,entity_type" },
    );
    if (error) {
      console.warn("[company] upsert erro:", entityType, error.message);
      schedulePushRetry(companyId, entityType, value, attempt);
    }
  } catch (e) {
    console.warn("[company] push exceção:", entityType, e);
    schedulePushRetry(companyId, entityType, value, attempt);
  }
}

// Registra o hook UMA vez (debounce simples por coleção para evitar excesso).
const timers: Record<string, ReturnType<typeof setTimeout>> = {};
export function registerCompanyWriteHook(): void {
  setWriteHook((baseKey, value) => {
    const companyAtWrite = syncCompanyId; // captura a empresa no instante da escrita
    if (timers[baseKey]) clearTimeout(timers[baseKey]);
    timers[baseKey] = setTimeout(() => {
      pushEntity(companyAtWrite, baseKey, value, 0).catch(() => {});
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
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 0) continue;
      const { payload } = await stripPhotosForServer(parsed);
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

// Baixa todas as coleções da empresa e MESCLA por id no local (preserva escritas
// offline/locais mais novas em vez de sobrescrever). Escopo atual = empresa.
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
      let serverPayload: unknown = (row as { payload: unknown }).payload ?? [];
      // Fase 2D: rehidrata os binários a partir do Storage (display/PDF locais).
      serverPayload = await hydratePhotosFromServer(serverPayload);
      // Lê o local atual (mesmo escopo de empresa) e mescla por id.
      let localPayload: unknown = [];
      try {
        const rawLocal = await scopedStorage.getItem(et);
        if (rawLocal) localPayload = JSON.parse(rawLocal);
      } catch {
        /* local ausente/corrompido → usa só o servidor */
      }
      const merged = mergeCollectionById(localPayload, serverPayload);
      await scopedStorage.setItemRaw(et, JSON.stringify(merged));
    }
  } catch (e) {
    console.warn("[company] pull falhou:", e);
  }
}
