// FASE 2D — Arquivos por empresa no Supabase Storage (bucket privado company-files).
// Path: <companyId>/<relativePath>. RLS garante que só membros da empresa acessam.
// Mantém o app local-first: o upload é complementar; sem login/empresa, é no-op.
import { supabase, isSupabaseConfigured } from "@/utils/supabase";
import { getActiveCompanyId } from "@/utils/scopedStorage";

const BUCKET = "company-files";

// Converte um data URI / base64 em Uint8Array (para upload binário no Storage).
function base64ToBytes(base64: string): Uint8Array {
  const clean = base64.includes(",") ? base64.split(",")[1] : base64;
  const bin = typeof atob === "function" ? atob(clean) : Buffer.from(clean, "base64").toString("binary");
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Faz upload de um conteúdo base64/dataURI e devolve o path no bucket (ou null).
export async function uploadCompanyBase64(
  relativePath: string,
  base64OrDataUri: string,
  contentType = "image/jpeg",
): Promise<string | null> {
  const companyId = getActiveCompanyId();
  if (!isSupabaseConfigured || !companyId) return null;
  try {
    const path = `${companyId}/${relativePath}`;
    const bytes = base64ToBytes(base64OrDataUri);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType, upsert: true });
    if (error) throw error;
    return path;
  } catch (e) {
    console.warn("[storage] upload falhou:", e);
    return null;
  }
}

// Gera uma URL assinada temporária para exibir/baixar um arquivo da empresa.
export async function getCompanyFileUrl(
  path: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  if (!isSupabaseConfigured || !path) return null;
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, expiresInSeconds);
    if (error) throw error;
    return data?.signedUrl ?? null;
  } catch (e) {
    console.warn("[storage] signed url falhou:", e);
    return null;
  }
}

// Baixa um arquivo do bucket e devolve como data URI base64 (para hidratar o
// dispositivo após o pull, mantendo display/PDF locais inalterados).
export async function downloadCompanyFileAsBase64(
  path: string,
  contentType = "image/jpeg",
): Promise<string | null> {
  const url = await getCompanyFileUrl(path, 600);
  if (!url) return null;
  try {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const b64 =
      typeof btoa === "function"
        ? btoa(binary)
        : Buffer.from(binary, "binary").toString("base64");
    return `data:${contentType};base64,${b64}`;
  } catch (e) {
    console.warn("[storage] download falhou:", e);
    return null;
  }
}

export async function removeCompanyFile(path: string): Promise<void> {
  if (!isSupabaseConfigured || !path) return;
  try {
    await supabase.storage.from(BUCKET).remove([path]);
  } catch (e) {
    console.warn("[storage] remove falhou:", e);
  }
}
