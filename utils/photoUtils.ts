import { readAsStringAsync } from "expo-file-system";

export interface InspectionPhoto {
  id: string;
  uri: string;
  base64?: string;
  caption: string;
  timestamp: string;
}

export async function ensurePhotoBase64(photo: InspectionPhoto): Promise<InspectionPhoto> {
  if (photo.base64) return photo;

  if (!photo.uri) return photo;

  try {
    const fileBase64 = await readAsStringAsync(photo.uri, {
      encoding: "base64",
    });

    return {
      ...photo,
      base64: `data:image/jpeg;base64,${fileBase64}`,
    };
  } catch (error) {
    console.log("Erro ao converter foto para base64:", error);
    return photo;
  }
}

export async function ensureAllPhotosBase64(photos: InspectionPhoto[]): Promise<InspectionPhoto[]> {
  if (!photos || photos.length === 0) return [];
  return Promise.all(photos.map(ensurePhotoBase64));
}
