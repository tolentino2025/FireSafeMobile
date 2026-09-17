// Armazenamento LOCAL dos binários das fotos, fora do JSON das coleções.
//
//   web:     IndexedDB (cota de centenas de MB, separada do localStorage)
//   nativo:  arquivos em <documentDirectory>/photos/<id>.<ext>
//
// O JSON guarda só { id, stored: true }; o caminho do arquivo é calculado em
// tempo de execução a partir do id (no iOS o caminho absoluto do container muda
// entre atualizações, então nunca é persistido).
//
// Também mantém o índice "já enviado ao bucket" (storagePath → true), para o
// sync não reenviar todas as fotos da coleção a cada salvamento.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

import { externalizePhotosInJson, PhotoBlobStore } from "@/utils/photoRefs";

// ─────────────────────────────────────────────────────────────
// Web: IndexedDB
// ─────────────────────────────────────────────────────────────
const DB_NAME = "firesafe-photos";
const DB_VERSION = 1;
const PHOTOS = "photos";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("IndexedDB indisponível neste navegador"));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(PHOTOS)) db.createObjectStore(PHOTOS);
      };
      req.onsuccess = () => {
        const db = req.result;
        // A conexão em cache deixa de valer se o banco for apagado ("limpar
        // dados do site") ou atualizado por outra aba. Sem isto, toda gravação
        // passaria a falhar em silêncio e as fotos voltariam para o JSON.
        db.onclose = () => {
          dbPromise = null;
        };
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };
      req.onerror = () => reject(req.error ?? new Error("Falha ao abrir IndexedDB"));
    });
    // Falhou (ex.: modo privado restrito): permite nova tentativa depois.
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
}

// Reabre o banco e tenta de novo quando a conexão em cache ficou inválida
// (banco apagado ou recriado enquanto a aba estava aberta).
function isStaleConnection(e: unknown): boolean {
  const name = (e as { name?: string })?.name;
  return name === "NotFoundError" || name === "InvalidStateError" || name === "TransactionInactiveError";
}

async function withDb<T>(run: (db: IDBDatabase) => Promise<T>): Promise<T> {
  try {
    return await run(await openDb());
  } catch (e) {
    if (!isStaleConnection(e)) throw e;
    dbPromise = null;
    return run(await openDb());
  }
}

function idbPut(store: string, key: string, value: unknown): Promise<void> {
  return withDb(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).put(value, key);
        // Só resolve quando a transação foi efetivada (durável).
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("Falha ao gravar no IndexedDB"));
        tx.onabort = () => reject(tx.error ?? new Error("Gravação no IndexedDB abortada"));
      }),
  );
}

function idbGet<T>(store: string, key: string): Promise<T | null> {
  return withDb(
    (db) =>
      new Promise<T | null>((resolve, reject) => {
        const req = db.transaction(store, "readonly").objectStore(store).get(key);
        req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
        req.onerror = () => reject(req.error ?? new Error("Falha ao ler do IndexedDB"));
      }),
  );
}

function idbHas(store: string, key: string): Promise<boolean> {
  return withDb(
    (db) =>
      new Promise<boolean>((resolve, reject) => {
        const req = db.transaction(store, "readonly").objectStore(store).count(key);
        req.onsuccess = () => resolve(req.result > 0);
        req.onerror = () => reject(req.error ?? new Error("Falha ao consultar IndexedDB"));
      }),
  );
}

// ─────────────────────────────────────────────────────────────
// Nativo: arquivos
// ─────────────────────────────────────────────────────────────
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
};
const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
};

// image/jpg é o mesmo que image/jpeg: sem normalizar, a foto gravada volta com
// outro rótulo, a comparação de conteúdo falha e ela nunca sai do JSON.
export function normalizeMime(mime?: string): string {
  const m = (mime || "image/jpeg").toLowerCase();
  return m === "image/jpg" ? "image/jpeg" : m;
}

function photosDir(): string {
  return `${FileSystem.documentDirectory}photos/`;
}

// Ids vêm de Date.now() ou "<categoria>_<timestamp>"; ainda assim, nada de
// separadores de caminho no nome do arquivo.
function safeName(id: string): string {
  return id.replace(/[^A-Za-z0-9_-]/g, "_");
}

function parseDataUri(dataUri: string): { mime: string; base64: string } {
  const match = /^data:([^;,]+)?(;base64)?,([\s\S]*)$/.exec(dataUri);
  if (!match) return { mime: "image/jpeg", base64: dataUri };
  return { mime: normalizeMime(match[1]), base64: match[3] };
}

let dirReady: Promise<void> | null = null;
function ensureDir(): Promise<void> {
  if (!dirReady) {
    dirReady = (async () => {
      const info = await FileSystem.getInfoAsync(photosDir());
      if (!info.exists) await FileSystem.makeDirectoryAsync(photosDir(), { intermediates: true });
    })();
    dirReady.catch(() => {
      dirReady = null;
    });
  }
  return dirReady;
}

async function findFile(id: string): Promise<string | null> {
  for (const ext of Object.keys(MIME_BY_EXT)) {
    const path = `${photosDir()}${safeName(id)}${ext}`;
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists && !info.isDirectory) return path;
  }
  return null;
}

async function fileSave(id: string, dataUri: string): Promise<void> {
  await ensureDir();
  const { mime, base64 } = parseDataUri(dataUri);
  const finalPath = `${photosDir()}${safeName(id)}${EXTENSIONS[mime] ?? ".jpg"}`;
  // Grava num temporário e move: um app morto no meio da escrita não deixa um
  // arquivo truncado com o nome definitivo.
  const tmpPath = `${finalPath}.tmp`;
  await FileSystem.writeAsStringAsync(tmpPath, base64, { encoding: "base64" });
  await FileSystem.moveAsync({ from: tmpPath, to: finalPath });
}

async function fileRead(id: string): Promise<string | null> {
  const path = await findFile(id);
  if (!path) return null;
  const ext = path.slice(path.lastIndexOf("."));
  const base64 = await FileSystem.readAsStringAsync(path, { encoding: "base64" });
  return `data:${MIME_BY_EXT[ext] ?? "image/jpeg"};base64,${base64}`;
}

// Índice de envios: id da foto → caminho no bucket. Fica no AsyncStorage em
// TODAS as plataformas de propósito: na web ele sobrevive a uma limpeza do
// IndexedDB, e é o que permite rebaixar a foto do bucket quando o binário local
// se perde. É pequeno (um caminho por foto).
const UPLOADS_KEY = "@firesafe_photo_uploads";
let uploadsCache: Record<string, string> | null = null;
// Escritas em fila: duas marcações simultâneas não podem sobrescrever uma à outra.
let uploadsWrite: Promise<void> = Promise.resolve();

async function loadUploads(): Promise<Record<string, string>> {
  if (!uploadsCache) {
    let loaded: Record<string, string> = {};
    try {
      const raw = await AsyncStorage.getItem(UPLOADS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === "object") loaded = parsed as Record<string, string>;
    } catch {
      /* índice ilegível: recomeça vazio (no pior caso, reenvia a foto) */
    }
    uploadsCache = loaded;
  }
  return uploadsCache;
}

// ─────────────────────────────────────────────────────────────
// API pública
// ─────────────────────────────────────────────────────────────
const isWeb = Platform.OS === "web";

/**
 * Pede ao navegador para tornar o armazenamento persistente. Sem isso o
 * IndexedDB é "best-effort": o Safari apaga dados de sites pouco visitados e o
 * Chrome pode descartá-los sob pressão de espaço — e as fotos sumiriam enquanto
 * os registros continuariam apontando para elas. Best-effort e silencioso.
 */
export async function requestPersistentStorage(): Promise<void> {
  if (!isWeb) return;
  try {
    const storage = (navigator as Navigator & { storage?: StorageManager }).storage;
    if (!storage?.persist || !storage.persisted) return;
    if (await storage.persisted()) return;
    await storage.persist();
  } catch {
    /* navegador sem suporte: segue sem persistência garantida */
  }
}

export const photoStore = {
  /** Grava o binário. Lança erro se o armazenamento local não estiver disponível. */
  save(id: string, dataUri: string): Promise<void> {
    return isWeb ? idbPut(PHOTOS, id, dataUri) : fileSave(id, dataUri);
  },

  /** Data URI da foto, ou null se não estiver guardada neste dispositivo. */
  read(id: string): Promise<string | null> {
    return isWeb ? idbGet<string>(PHOTOS, id) : fileRead(id);
  },

  async has(id: string): Promise<boolean> {
    return isWeb ? idbHas(PHOTOS, id) : (await findFile(id)) !== null;
  },

  /** URI para <Image>: caminho do arquivo no nativo; data URI na web. */
  async displayUri(id: string): Promise<string | null> {
    return isWeb ? idbGet<string>(PHOTOS, id) : findFile(id);
  },

  /** Caminho no bucket de uma foto já enviada por este dispositivo, se houver. */
  async getUploadedPath(id: string): Promise<string | null> {
    return (await loadUploads())[id] ?? null;
  },

  async setUploadedPath(id: string, storagePath: string): Promise<void> {
    const write = uploadsWrite.then(async () => {
      const uploads = await loadUploads();
      if (uploads[id] === storagePath) return;
      uploads[id] = storagePath;
      await AsyncStorage.setItem(UPLOADS_KEY, JSON.stringify(uploads));
    });
    uploadsWrite = write.catch(() => {});
    return write;
  },
};

const blobStore: PhotoBlobStore = {
  save: (id, dataUri) => photoStore.save(id, dataUri),
  read: (id) => photoStore.read(id),
};

/**
 * Tira do JSON os binários de foto embutidos, gravando-os no armazenamento de
 * fotos. Devolve a mesma string se não houver nada a mover. Nunca lança: em
 * falha, a foto continua embutida (comportamento antigo).
 */
export async function externalizeInlinePhotos(json: string): Promise<string> {
  try {
    return await externalizePhotosInJson(json, blobStore);
  } catch (e) {
    console.warn("[photos] não foi possível mover fotos para o armazenamento local:", e);
    return json;
  }
}
