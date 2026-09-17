// Resolve a imagem de um nó de foto, venha ela de onde vier.
//
// Ordem: binário embutido (dados antigos) → armazenamento local de fotos →
// bucket da empresa (baixa e guarda localmente) → uri de arquivo legado.
//
// Telas usam resolvePhotoDisplayUri; PDFs, sync e backup usam
// resolvePhotoDataUri (precisam do conteúdo em base64).
import { Platform } from "react-native";
import { readAsStringAsync } from "expo-file-system/legacy";

import { photoStore } from "@/utils/photoStore";
import { downloadCompanyFileAsBase64 } from "@/utils/companyStorage";
import { inlineDataUri, PhotoNode, walkPhotoNodes } from "@/utils/photoRefs";

type PhotoLike = Pick<PhotoNode, "id" | "uri" | "base64" | "storagePath" | "stored">;

// Evita baixar a mesma foto duas vezes quando várias telas pedem ao mesmo tempo.
const inflightDownloads = new Map<string, Promise<boolean>>();

/** Garante a foto no armazenamento local, baixando do bucket se preciso. */
async function ensureInLocalStore(photo: PhotoLike): Promise<boolean> {
  if (await photoStore.has(photo.id)) return true;

  // O registro nem sempre conhece o caminho no bucket: o dispositivo que
  // capturou a foto envia o caminho ao servidor sem reescrever o próprio JSON.
  // O índice local guarda esse caminho e é o que permite rebaixar a foto se o
  // binário local se perder.
  const storagePath = photo.storagePath ?? (await photoStore.getUploadedPath(photo.id).catch(() => null));
  if (!storagePath) return false;

  const pending = inflightDownloads.get(photo.id);
  if (pending) return pending;
  const download = (async () => {
    const dataUri = await downloadCompanyFileAsBase64(storagePath);
    if (!dataUri) return false;
    await photoStore.save(photo.id, dataUri);
    await photoStore.setUploadedPath(photo.id, storagePath).catch(() => {});
    return true;
  })().finally(() => inflightDownloads.delete(photo.id));

  inflightDownloads.set(photo.id, download);
  return download;
}

export async function resolvePhotoDisplayUri(photo: PhotoLike): Promise<string | null> {
  const inline = inlineDataUri(photo as PhotoNode);
  if (inline) return inline;
  try {
    if (await ensureInLocalStore(photo)) {
      const uri = await photoStore.displayUri(photo.id);
      if (uri) return uri;
    }
  } catch (e) {
    console.warn("[photos] falha ao resolver foto para exibição:", photo.id, e);
  }
  // Legado: uri de arquivo do seletor (pode não existir mais).
  return photo.uri || null;
}

export async function resolvePhotoDataUri(photo: PhotoLike): Promise<string | null> {
  const inline = inlineDataUri(photo as PhotoNode);
  if (inline) return inline;
  try {
    if (await ensureInLocalStore(photo)) {
      const dataUri = await photoStore.read(photo.id);
      if (dataUri) return dataUri;
    }
  } catch (e) {
    console.warn("[photos] falha ao ler foto:", photo.id, e);
  }
  // Legado nativo: uri de arquivo ainda existente.
  if (photo.uri && Platform.OS !== "web" && !photo.uri.startsWith("blob:")) {
    try {
      const base64 = await readAsStringAsync(photo.uri, { encoding: "base64" });
      return `data:image/jpeg;base64,${base64}`;
    } catch {
      /* arquivo temporário já removido pelo sistema */
    }
  }
  return null;
}

/**
 * Depois de um pull da empresa, baixa em segundo plano as fotos que ainda não
 * estão neste dispositivo — mantém o uso offline em campo (PDF sem rede).
 * Sequencial de propósito: não disputa banda com o uso normal do app.
 */
export async function prefetchRemotePhotos(payload: unknown): Promise<void> {
  const remote: PhotoLike[] = [];
  await walkPhotoNodes(payload, async (photo) => {
    if (photo.storagePath && !inlineDataUri(photo)) remote.push(photo);
  });
  for (const photo of remote) {
    try {
      await ensureInLocalStore(photo);
    } catch {
      /* sem rede ou sem permissão: tenta de novo quando a foto for aberta */
    }
  }
}

/**
 * Para exportação de backup: embute de volta o base64 de cada foto, para que o
 * arquivo exportado seja completo por si só. Muta `payload`.
 */
export async function inlinePhotosForExport(payload: unknown): Promise<unknown> {
  await walkPhotoNodes(payload, async (photo) => {
    if (inlineDataUri(photo)) return;
    const dataUri = await resolvePhotoDataUri(photo);
    if (dataUri) {
      photo.base64 = dataUri;
      delete photo.stored;
    }
  });
  return payload;
}
