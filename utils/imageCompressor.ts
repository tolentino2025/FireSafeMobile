import * as ImageManipulator from 'expo-image-manipulator';

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 0.75;

export interface CompressedImage {
  uri: string;
  base64?: string;
  width: number;
  height: number;
}

export const compressImage = async (
  uri: string,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    includeBase64?: boolean;
  }
): Promise<CompressedImage> => {
  const maxWidth = options?.maxWidth || MAX_WIDTH;
  const maxHeight = options?.maxHeight || MAX_HEIGHT;
  const quality = options?.quality || QUALITY;
  const includeBase64 = options?.includeBase64 ?? true;

  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        },
      ],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: includeBase64,
      }
    );

    return {
      uri: result.uri,
      base64: result.base64 ? `data:image/jpeg;base64,${result.base64}` : undefined,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Image compression failed:', error);
    throw error;
  }
};

export const compressImageForUpload = async (uri: string): Promise<string> => {
  const result = await compressImage(uri, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.7,
    includeBase64: true,
  });
  
  if (!result.base64) {
    throw new Error('Failed to generate base64 for image');
  }
  
  return result.base64;
};

export const compressImageForThumbnail = async (uri: string): Promise<CompressedImage> => {
  return compressImage(uri, {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.6,
    includeBase64: true,
  });
};

export const getEstimatedSize = (base64: string): number => {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  return Math.ceil((base64Data.length * 3) / 4);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
