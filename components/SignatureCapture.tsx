import React, { useRef, useState, useCallback } from "react";
import { View, StyleSheet, Pressable, PanResponder, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import ViewShot, { captureRef } from "react-native-view-shot";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SignatureCaptureProps {
  signature: string | null;
  onSignatureChange: (signature: string | null) => void;
}

export function SignatureCapture({ signature, onSignatureChange }: SignatureCaptureProps) {
  const { fullTheme, isDark } = useTheme();
  const { t } = useLanguage();
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const viewShotRef = useRef<ViewShot>(null);

  const captureSignature = useCallback(async () => {
    if (paths.length === 0 && !currentPath) {
      onSignatureChange(null);
      return;
    }

    try {
      if (viewShotRef.current) {
        const uri = await captureRef(viewShotRef, {
          format: "png",
          quality: 1,
          result: "data-uri",
        });
        onSignatureChange(uri);
      }
    } catch (error) {
      console.log("Error capturing signature:", error);
      onSignatureChange("signature_captured");
    }
  }, [paths, currentPath, onSignatureChange]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(`M${locationX},${locationY}`);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath((prev) => `${prev} L${locationX},${locationY}`);
      },
      onPanResponderRelease: () => {
        if (currentPath) {
          const newPaths = [...paths, currentPath];
          setPaths(newPaths);
          setCurrentPath("");
          setTimeout(() => {
            captureSignature();
          }, 100);
        }
      },
    })
  ).current;

  const handleClear = () => {
    setPaths([]);
    setCurrentPath("");
    onSignatureChange(null);
  };

  const strokeColor = isDark ? "#FFFFFF" : fullTheme.colors.textPrimary;

  return (
    <View style={styles.container}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: "png", quality: 1 }}
        style={[
          styles.canvasContainer,
          { 
            backgroundColor: fullTheme.colors.cardBackground, 
            borderColor: fullTheme.colors.border 
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Svg style={styles.canvas}>
          {paths.map((path, index) => (
            <Path
              key={index}
              d={path}
              stroke={strokeColor}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {currentPath ? (
            <Path
              d={currentPath}
              stroke={strokeColor}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </Svg>

        {paths.length === 0 && !currentPath && !signature && (
          <View style={styles.placeholder}>
            <ThemedText type="small" secondary>
              {t.form.signature}
            </ThemedText>
          </View>
        )}
      </ViewShot>

      <Pressable
        onPress={handleClear}
        style={({ pressed }) => [
          styles.clearButton,
          { 
            backgroundColor: fullTheme.colors.backgroundSecondary, 
            opacity: pressed ? 0.7 : 1 
          },
        ]}
      >
        <Feather name="trash-2" size={16} color={fullTheme.colors.textSecondary} />
        <ThemedText type="small" secondary style={{ marginLeft: Spacing.xs }}>
          {t.form.clearSignature}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  canvasContainer: {
    height: 150,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  canvas: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  clearButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
});
