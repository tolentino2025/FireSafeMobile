import { resolvePhotoDataUri } from "@/utils/photoResolver";

export interface InspectionPhoto {
  id: string;
  uri: string;
  base64?: string;
  storagePath?: string;
  stored?: boolean;
  caption: string;
  timestamp: string;
}

// Garante o base64 da foto para embutir no PDF. A foto pode estar embutida
// (dados antigos), no armazenamento local de fotos ou só no bucket da empresa.
export async function ensurePhotoBase64(photo: InspectionPhoto): Promise<InspectionPhoto> {
  if (photo.base64) return photo;
  const dataUri = await resolvePhotoDataUri(photo);
  return dataUri ? { ...photo, base64: dataUri } : photo;
}

export async function ensureAllPhotosBase64(photos: InspectionPhoto[]): Promise<InspectionPhoto[]> {
  if (!photos || photos.length === 0) return [];
  return Promise.all(photos.map(ensurePhotoBase64));
}
