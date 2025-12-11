import React, { useRef, useState, useCallback, useEffect } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import ViewShot, { captureRef } from "react-native-view-shot";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS } from "react-native-reanimated";

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
  const currentPathRef = useRef<string>("");
  const pathsRef = useRef<string[]>([]);

  useEffect(() => {
    currentPathRef.current = currentPath;
  }, [currentPath]);

  useEffect(() => {
    pathsRef.current = paths;
  }, [paths]);

  const captureSignature = useCallback(async () => {
    if (pathsRef.current.length === 0) {
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
  }, [onSignatureChange]);

  const handlePathStart = useCallback((x: number, y: number) => {
    const newPath = `M${x.toFixed(1)},${y.toFixed(1)}`;
    setCurrentPath(newPath);
    currentPathRef.current = newPath;
  }, []);

  const handlePathMove = useCallback((x: number, y: number) => {
    const updated = `${currentPathRef.current} L${x.toFixed(1)},${y.toFixed(1)}`;
    setCurrentPath(updated);
    currentPathRef.current = updated;
  }, []);

  const handlePathEnd = useCallback(() => {
    if (currentPathRef.current) {
      const newPaths = [...pathsRef.current, currentPathRef.current];
      setPaths(newPaths);
      pathsRef.current = newPaths;
      setCurrentPath("");
      currentPathRef.current = "";
      setTimeout(() => {
        captureSignature();
      }, 150);
    }
  }, [captureSignature]);

  const panGesture = Gesture.Pan()
    .minDistance(0)
    .onStart((e) => {
      runOnJS(handlePathStart)(e.x, e.y);
    })
    .onUpdate((e) => {
      runOnJS(handlePathMove)(e.x, e.y);
    })
    .onEnd(() => {
      runOnJS(handlePathEnd)();
    });

  const handleClear = useCallback(() => {
    setPaths([]);
    setCurrentPath("");
    pathsRef.current = [];
    currentPathRef.current = "";
    onSignatureChange(null);
  }, [onSignatureChange]);

  const strokeColor = isDark ? "#FFFFFF" : fullTheme.colors.textPrimary;
  const isEmpty = paths.length === 0 && !currentPath && !signature;

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.canvasContainer,
            { 
              backgroundColor: fullTheme.colors.cardBackground, 
              borderColor: fullTheme.colors.border 
            },
          ]}
        >
          <ViewShot
            ref={viewShotRef}
            options={{ format: "png", quality: 1 }}
            style={styles.viewShot}
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
          </ViewShot>

          {isEmpty ? (
            <View style={styles.placeholder}>
              <Feather name="edit-3" size={24} color={fullTheme.colors.textSecondary} />
              <ThemedText type="small" secondary style={{ marginTop: Spacing.xs }}>
                {t.form.signature}
              </ThemedText>
            </View>
          ) : null}
        </Animated.View>
      </GestureDetector>

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
  viewShot: {
    flex: 1,
    width: "100%",
    height: "100%",
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
