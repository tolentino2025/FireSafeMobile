// Fotos fora do JSON — lógica pura (sem React Native), testável em Node.
//
// PROBLEMA: cada foto era gravada em base64 DENTRO do registro da inspeção, e a
// coleção inteira vai para um armazenamento pequeno (localStorage ~5 MB na web;
// SQLite ~6 MB no Android). Duas ou três inspeções com fotos bastavam para
// estourar a cota e o salvamento falhava com "Erro ao salvar".
//
// SOLUÇÃO: o binário vai para um armazenamento de ARQUIVOS (utils/photoStore) e
// o registro guarda só a referência: { id, stored: true, storagePath? }.
// Este módulo percorre qualquer payload e faz essa troca, sem saber onde o
// binário fica — quem chama injeta o PhotoBlobStore.

/** Onde o binário da foto é guardado. `read` devolve null se não existir. */
export interface PhotoBlobStore {
  save(id: string, dataUri: string): Promise<void>;
  read(id: string): Promise<string | null>;
}

/** Nó de foto como aparece nos payloads (InspectionPhoto, ChecklistItemPhoto…). */
export interface PhotoNode {
  id: string;
  uri?: string;
  base64?: string;
  storagePath?: string;
  /** true = o binário está no armazenamento de fotos local, não no JSON. */
  stored?: boolean;
  [key: string]: unknown;
}

// Um nó de foto é um objeto com `id` e alguma fonte de imagem: base64 embutido,
// uri data:, caminho no bucket, ou a marca de armazenamento local.
export function isPhotoNode(n: unknown): n is PhotoNode {
  if (!n || typeof n !== "object" || Array.isArray(n)) return false;
  const o = n as Record<string, unknown>;
  if (typeof o.id !== "string") return false;
  const hasB64 = typeof o.base64 === "string" && o.base64.length > 0;
  const hasDataUri = typeof o.uri === "string" && o.uri.startsWith("data:");
  return hasB64 || hasDataUri || typeof o.storagePath === "string" || o.stored === true;
}

/** Aplica `fn` em cada nó de foto, em qualquer profundidade (arrays e objetos). */
export async function walkPhotoNodes(
  node: unknown,
  fn: (photo: PhotoNode) => Promise<void>,
): Promise<void> {
  if (Array.isArray(node)) {
    for (const item of node) await walkPhotoNodes(item, fn);
    return;
  }
  if (node && typeof node === "object") {
    if (isPhotoNode(node)) await fn(node);
    for (const v of Object.values(node as Record<string, unknown>)) {
      if (v && typeof v === "object") await walkPhotoNodes(v, fn);
    }
  }
}

// "image/jpg" e "image/jpeg" são o mesmo formato. Sem normalizar, a foto gravada
// volta do armazenamento com outro rótulo, a comparação de conteúdo falha e ela
// nunca sai do JSON.
function normalizeDataUri(dataUri: string): string {
  return dataUri.startsWith("data:image/jpg;") ? dataUri.replace("data:image/jpg;", "data:image/jpeg;") : dataUri;
}

/** Binário embutido no nó (base64 ou uri data:), já como data URI; "" se não houver. */
export function inlineDataUri(photo: PhotoNode): string {
  if (typeof photo.base64 === "string" && photo.base64.length > 0) {
    return photo.base64.startsWith("data:")
      ? normalizeDataUri(photo.base64)
      : `data:image/jpeg;base64,${photo.base64}`;
  }
  if (typeof photo.uri === "string" && photo.uri.startsWith("data:")) return normalizeDataUri(photo.uri);
  return "";
}

/**
 * Filtro barato antes do JSON.parse: só vale a pena percorrer o payload se ele
 * tiver uma chave "base64" ou um valor que começa com "data:image".
 * Dentro de strings JSON as aspas vêm escapadas (\"), então texto digitado pelo
 * usuário com essas palavras não dispara o filtro. Um falso positivo aqui é
 * inofensivo: percorre, não encontra foto e devolve o payload intacto.
 */
export function mightContainInlinePhotos(json: string): boolean {
  return json.includes('"base64"') || json.includes('"data:image');
}

export interface ExternalizeResult {
  /** Fotos movidas para o armazenamento local. */
  moved: number;
  /** Fotos mantidas embutidas (colisão de id ou falha ao gravar). */
  kept: number;
}

/**
 * Move para o `store` todo binário embutido e troca o nó pela referência.
 * Muta `root`. Seguro por construção: um nó só perde o base64 DEPOIS que o
 * binário está gravado; qualquer falha mantém o nó como estava.
 *
 * Colisão de id com conteúdo diferente (duas fotos distintas com o mesmo id)
 * não sobrescreve nada: a segunda fica embutida, como era antes.
 */
export async function externalizePhotos(
  root: unknown,
  store: PhotoBlobStore,
): Promise<ExternalizeResult> {
  const result: ExternalizeResult = { moved: 0, kept: 0 };
  await walkPhotoNodes(root, async (photo) => {
    const dataUri = inlineDataUri(photo);
    if (!dataUri) return;
    try {
      const existing = await store.read(photo.id);
      if (existing === null) {
        await store.save(photo.id, dataUri);
      } else if (existing !== dataUri) {
        result.kept++;
        return;
      }
      delete photo.base64;
      if (typeof photo.uri === "string" && (photo.uri.startsWith("data:") || photo.uri.startsWith("blob:"))) {
        photo.uri = "";
      }
      photo.stored = true;
      result.moved++;
    } catch {
      result.kept++;
    }
  });
  return result;
}

/**
 * Versão para string JSON: devolve a MESMA string quando não há nada a mover
 * (evita regravar e reformatar à toa) ou quando não é JSON.
 */
export async function externalizePhotosInJson(
  json: string,
  store: PhotoBlobStore,
): Promise<string> {
  if (!mightContainInlinePhotos(json)) return json;
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return json;
  }
  const { moved } = await externalizePhotos(parsed, store);
  return moved > 0 ? JSON.stringify(parsed) : json;
}
