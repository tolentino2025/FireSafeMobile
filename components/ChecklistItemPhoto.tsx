import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  Modal,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { readAsStringAsync } from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChecklistItemPhoto as PhotoType } from "@/types/inspection";
import { Spacing, BorderRadius, AppColors } from "@/constants/theme";

interface ChecklistItemPhotoProps {
  photos: PhotoType[];
  onPhotosChange: (photos: PhotoType[]) => void;
  maxPhotos?: number;
}

const MAX_PHOTOS_DEFAULT = 3;

async function getBase64FromUri(uri: string): Promise<string | undefined> {
  try {
    if (Platform.OS === "web") {
      return undefined;
    }
    const base64 = await readAsStringAsync(uri, {
      encoding: "base64",
    });
    return base64;
  } catch (error) {
    console.log("Erro ao converter foto para base64:", error);
    return undefined;
  }
}

export function ChecklistItemPhoto({ 
  photos, 
  onPhotosChange, 
  maxPhotos = MAX_PHOTOS_DEFAULT 
}: ChecklistItemPhotoProps) {
  const { fullTheme } = useTheme();
  const { t } = useLanguage();
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoType | null>(null);
  const [editingCaption, setEditingCaption] = useState("");

  const canAddMore = photos.length < maxPhotos;

  const requestPermissions = async () => {
    if (Platform.OS === "web") {
      return true;
    }
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      Alert.alert(t.common.error, t.notifications.permissionRequired);
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    if (!canAddMore) {
      Alert.alert(
        t.common.error,
        `${maxPhotos} ${t.form.photos} max`
      );
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        let base64Data = asset.base64;

        if (!base64Data && asset.uri) {
          base64Data = await getBase64FromUri(asset.uri);
        }

        const newPhoto: PhotoType = {
          id: Date.now().toString(),
          uri: asset.uri,
          base64: base64Data ? `data:image/jpeg;base64,${base64Data}` : undefined,
          caption: "",
          timestamp: new Date().toISOString(),
        };
        onPhotosChange([...photos, newPhoto]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert(t.common.error, t.report.shareError);
    }
  };

  const pickFromGallery = async () => {
    if (!canAddMore) {
      Alert.alert(
        t.common.error,
        `${maxPhotos} ${t.form.photos} max`
      );
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        let base64Data = asset.base64;

        if (!base64Data && asset.uri) {
          base64Data = await getBase64FromUri(asset.uri);
        }

        const newPhoto: PhotoType = {
          id: Date.now().toString(),
          uri: asset.uri,
          base64: base64Data ? `data:image/jpeg;base64,${base64Data}` : undefined,
          caption: "",
          timestamp: new Date().toISOString(),
        };
        onPhotosChange([...photos, newPhoto]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(t.common.error, t.report.shareError);
    }
  };

  const removePhoto = (photoId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(t.common.confirm, t.form.removePhoto + "?", [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.common.delete,
        style: "destructive",
        onPress: () => {
          onPhotosChange(photos.filter((p) => p.id !== photoId));
          if (selectedPhoto?.id === photoId) {
            setSelectedPhoto(null);
          }
        },
      },
    ]);
  };

  const updateCaption = (photoId: string, caption: string) => {
    onPhotosChange(
      photos.map((p) => (p.id === photoId ? { ...p, caption: caption.toUpperCase() } : p))
    );
  };

  const showPhotoOptions = () => {
    if (Platform.OS === "web") {
      Alert.alert(t.common.error, t.common.runInExpoGo);
      return;
    }
    Alert.alert(t.form.addPhoto, "", [
      { text: t.form.takePhoto, onPress: takePhoto },
      { text: t.form.chooseFromGallery, onPress: pickFromGallery },
      { text: t.common.cancel, style: "cancel" },
    ]);
  };

  const openPhotoModal = (photo: PhotoType) => {
    setSelectedPhoto(photo);
    setEditingCaption(photo.caption);
  };

  const closeModal = () => {
    if (selectedPhoto) {
      updateCaption(selectedPhoto.id, editingCaption);
    }
    setSelectedPhoto(null);
    setEditingCaption("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.photosRow}>
        {photos.map((photo) => (
          <Animated.View
            key={photo.id}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
          >
            <Pressable onPress={() => openPhotoModal(photo)}>
              <View style={[styles.thumbnailContainer, { borderColor: fullTheme.colors.border }]}>
                <Image
                  source={{ uri: photo.base64 || photo.uri }}
                  style={styles.thumbnail}
                  contentFit="cover"
                />
                <Pressable
                  onPress={() => removePhoto(photo.id)}
                  style={[styles.removeButton, { backgroundColor: AppColors.error }]}
                >
                  <Feather name="x" size={10} color="#FFFFFF" />
                </Pressable>
                {photo.caption ? (
                  <View style={[styles.captionBadge, { backgroundColor: fullTheme.colors.primary }]}>
                    <Feather name="message-square" size={8} color="#FFFFFF" />
                  </View>
                ) : null}
              </View>
            </Pressable>
          </Animated.View>
        ))}

        {canAddMore && (
          <Pressable
            onPress={showPhotoOptions}
            style={[
              styles.addButton,
              { 
                backgroundColor: fullTheme.colors.inputBackground,
                borderColor: fullTheme.colors.border,
              },
            ]}
          >
            <Feather name="camera" size={16} color={fullTheme.colors.textSecondary} />
          </Pressable>
        )}
      </View>

      <Modal
        visible={selectedPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: fullTheme.colors.cardBackground }]}>
            {selectedPhoto && (
              <>
                <Image
                  source={{ uri: selectedPhoto.base64 || selectedPhoto.uri }}
                  style={styles.modalImage}
                  contentFit="contain"
                />
                <TextInput
                  style={[
                    styles.captionInput,
                    {
                      backgroundColor: fullTheme.colors.inputBackground,
                      color: fullTheme.colors.textPrimary,
                      borderColor: fullTheme.colors.border,
                    },
                  ]}
                  value={editingCaption}
                  onChangeText={(text) => setEditingCaption(text.toUpperCase())}
                  placeholder={t.form.photoCaption}
                  placeholderTextColor={fullTheme.colors.placeholder}
                  multiline
                  autoCapitalize="characters"
                />
                <View style={styles.modalButtons}>
                  <Pressable
                    onPress={() => removePhoto(selectedPhoto.id)}
                    style={[styles.modalButton, { backgroundColor: AppColors.error }]}
                  >
                    <Feather name="trash-2" size={16} color="#FFFFFF" />
                    <ThemedText type="small" style={{ color: "#FFFFFF", marginLeft: Spacing.xs }}>
                      {t.common.delete}
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={closeModal}
                    style={[styles.modalButton, { backgroundColor: fullTheme.colors.primary }]}
                  >
                    <Feather name="check" size={16} color="#FFFFFF" />
                    <ThemedText type="small" style={{ color: "#FFFFFF", marginLeft: Spacing.xs }}>
                      OK
                    </ThemedText>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
  },
  photosRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    alignItems: "center",
  },
  thumbnailContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
    borderWidth: 1,
  },
  thumbnail: {
    width: 50,
    height: 50,
  },
  removeButton: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  captionBadge: {
    position: "absolute",
    bottom: 2,
    left: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  modalImage: {
    width: "100%",
    height: 250,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  captionInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: "top",
    marginBottom: Spacing.md,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
});
