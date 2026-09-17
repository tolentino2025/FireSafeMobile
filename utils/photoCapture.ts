// Entrada de foto no app: reduz e guarda o binário no armazenamento local,
// devolvendo só a referência para o registro da inspeção.
//
// Redução: lado maior até 1920 px, JPEG 75%. Legível para manômetro e placa de
// equipamento, e uma foto de câmera de 3–5 MB cai para ~200–400 KB.
import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { readAsStringAsync } from "expo-file-system/legacy";

import { photoStore } from "@/utils/photoStore";

/** Id único global: o id da foto é chave do arquivo local, do objeto no bucket
 * e do índice de envio — `Date.now()` colidia entre dispositivos e backups. */
export function newPhotoId(prefix?: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix ? `${prefix}_` : ""}${Date.now()}-${random}`;
}

const MAX_EDGE = 1920;
const JPEG_QUALITY = 0.75;

// Opções comuns para os seletores: sem base64 (a leitura é feita aqui, uma vez)
// e qualidade máxima na origem para não comprimir duas vezes.
export const PICKER_OPTIONS = { base64: false, quality: 1 } as const;

async function readAsDataUri(asset: ImagePicker.ImagePickerAsset): Promise<string | null> {
  const mime = asset.mimeType || "image/jpeg";
  if (asset.base64) return `data:${mime};base64,${asset.base64}`;
  try {
    if (Platform.OS === "web") {
      const blob = await (await fetch(asset.uri)).blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    }
    const base64 = await readAsStringAsync(asset.uri, { encoding: "base64" });
    return `data:${mime};base64,${base64}`;
  } catch (e) {
    console.warn("[photos] não foi possível ler a foto selecionada:", e);
    return null;
  }
}

async function compress(asset: ImagePicker.ImagePickerAsset): Promise<string | null> {
  try {
    const { width, height } = asset;
    const actions: ImageManipulator.Action[] =
      width && height && Math.max(width, height) > MAX_EDGE
        ? [{ resize: width >= height ? { width: MAX_EDGE } : { height: MAX_EDGE } }]
        : [];
    const result = await ImageManipulator.manipulateAsync(asset.uri, actions, {
      compress: JPEG_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
    if (!result.base64) return null;
    // Uma foto pequena e já comprimida pode CRESCER ao ser recodificada; nesse
    // caso o original é melhor.
    const compressedBytes = Math.ceil((result.base64.length * 3) / 4);
    if (!actions.length && asset.fileSize && compressedBytes >= asset.fileSize) return null;
    return `data:image/jpeg;base64,${result.base64}`;
  } catch (e) {
    console.warn("[photos] redução da foto falhou, usando o original:", e);
    return null;
  }
}

export interface StoredPhotoFields {
  uri: string;
  base64?: string;
  stored?: boolean;
}

/**
 * Processa a foto escolhida/tirada e devolve os campos de imagem do nó.
 * Normal: { uri: "", stored: true }. Se o armazenamento local de fotos não
 * estiver disponível (ex.: navegador que bloqueia IndexedDB), cai no formato
 * antigo com o base64 embutido, para não perder a foto.
 */
export async function storePickedPhoto(
  asset: ImagePicker.ImagePickerAsset,
  id: string,
): Promise<StoredPhotoFields> {
  const dataUri = (await compress(asset)) ?? (await readAsDataUri(asset));
  if (!dataUri) throw new Error("Não foi possível ler a foto");
  try {
    await photoStore.save(id, dataUri);
    return { uri: "", stored: true };
  } catch (e) {
    console.warn("[photos] armazenamento local indisponível; foto fica embutida:", e);
    return { uri: "", base64: dataUri };
  }
}
