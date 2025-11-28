import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { InspectionPhoto } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius, AppColors } from "@/constants/theme";

interface PhotoCaptureProps {
  photos: InspectionPhoto[];
  onPhotosChange: (photos: InspectionPhoto[]) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PhotoCapture({ photos, onPhotosChange }: PhotoCaptureProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const requestPermissions = async () => {
    if (Platform.OS === "web") {
      return true;
    }
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      Alert.alert(
        t.common.error,
        t.notifications.permissionRequired
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto: InspectionPhoto = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
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
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto: InspectionPhoto = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
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
        },
      },
    ]);
  };

  const updateCaption = (photoId: string, caption: string) => {
    onPhotosChange(
      photos.map((p) => (p.id === photoId ? { ...p, caption } : p))
    );
  };

  const showPhotoOptions = () => {
    Alert.alert(t.form.addPhoto, "", [
      { text: t.form.takePhoto, onPress: takePhoto },
      { text: t.form.chooseFromGallery, onPress: pickFromGallery },
      { text: t.common.cancel, style: "cancel" },
    ]);
  };

  return (
    <View>
      <View style={styles.buttonRow}>
        <AnimatedPressable
          onPress={showPhotoOptions}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.addButton,
            { backgroundColor: theme.backgroundDefault },
            animatedStyle,
          ]}
        >
          <Feather name="camera" size={20} color={AppColors.primary} />
          <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
            {t.form.addPhoto}
          </ThemedText>
        </AnimatedPressable>
      </View>

      {photos.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoList}
        >
          {photos.map((photo) => (
            <Animated.View
              key={photo.id}
              entering={FadeIn}
              exiting={FadeOut}
              style={[styles.photoCard, { backgroundColor: theme.backgroundDefault }]}
            >
              <Image
                source={{ uri: photo.uri }}
                style={styles.photoImage}
                contentFit="cover"
              />
              <Pressable
                onPress={() => removePhoto(photo.id)}
                style={[styles.removeButton, { backgroundColor: AppColors.error }]}
              >
                <Feather name="x" size={16} color="#FFFFFF" />
              </Pressable>
              <TextInput
                style={[
                  styles.captionInput,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={photo.caption}
                onChangeText={(text) => updateCaption(photo.id, text)}
                placeholder={t.form.photoCaption}
                placeholderTextColor={theme.placeholder}
                multiline
                numberOfLines={2}
              />
            </Animated.View>
          ))}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.emptyState,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <Feather name="image" size={32} color={theme.placeholder} />
          <ThemedText type="small" style={{ color: theme.placeholder, marginTop: Spacing.sm }}>
            {Platform.OS === "web"
              ? "Run in Expo Go to use camera"
              : t.form.addPhoto}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  photoList: {
    gap: Spacing.md,
    paddingRight: Spacing.md,
  },
  photoCard: {
    width: 160,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  photoImage: {
    width: 160,
    height: 120,
  },
  removeButton: {
    position: "absolute",
    top: Spacing.xs,
    right: Spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  captionInput: {
    fontSize: 12,
    padding: Spacing.sm,
    borderWidth: 0,
    borderTopWidth: 1,
    minHeight: 40,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
  },
});
