// Exibe um nó de foto resolvendo a imagem de onde ela estiver (embutida,
// armazenamento local ou bucket da empresa). Enquanto resolve — ou se a foto
// ainda não chegou a este dispositivo — mostra um marcador neutro.
import React, { useEffect, useState } from "react";
import { StyleProp, StyleSheet, View, ImageStyle } from "react-native";
import { Image, ImageContentFit } from "expo-image";
import { Feather } from "@expo/vector-icons";

import { resolvePhotoDisplayUri } from "@/utils/photoResolver";
import { inlineDataUri, PhotoNode } from "@/utils/photoRefs";

interface StoredPhotoImageProps {
  photo: Pick<PhotoNode, "id" | "uri" | "base64" | "storagePath" | "stored">;
  style?: StyleProp<ImageStyle>;
  contentFit?: ImageContentFit;
  testID?: string;
}

export function StoredPhotoImage({ photo, style, contentFit = "cover", testID }: StoredPhotoImageProps) {
  const [uri, setUri] = useState<string | null>(() => inlineDataUri(photo as PhotoNode) || null);

  useEffect(() => {
    let alive = true;
    // Uma falha passageira (banco local ocupado logo após a captura, rede fora
    // ao baixar do bucket) não pode deixar a foto como marcador para sempre.
    const RETRY_DELAYS_MS = [0, 400, 1_200, 3_000];
    const attempt = async (index: number): Promise<void> => {
      if (!alive) return;
      const resolved = await resolvePhotoDisplayUri(photo);
      if (!alive) return;
      if (resolved) {
        setUri(resolved);
        return;
      }
      const next = index + 1;
      if (next < RETRY_DELAYS_MS.length) {
        setTimeout(() => void attempt(next), RETRY_DELAYS_MS[next]);
      }
    };
    void attempt(0);
    return () => {
      alive = false;
    };
    // Resolve de novo só quando a fonte da imagem muda (não a cada render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo.id, photo.base64, photo.uri, photo.storagePath, photo.stored]);

  if (!uri) {
    return (
      <View style={[style as StyleProp<any>, styles.placeholder]} testID={testID}>
        <Feather name="image" size={20} color="#9CA3AF" />
      </View>
    );
  }
  return <Image source={{ uri }} style={style} contentFit={contentFit} testID={testID} />;
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(156, 163, 175, 0.15)",
  },
});
