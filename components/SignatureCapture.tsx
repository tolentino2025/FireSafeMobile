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
  // Dimensoes reais do canvas (para o viewBox do SVG da assinatura).
  const layoutRef = useRef<{ width: number; height: number }>({
    width: 300,
    height: 150,
  });

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

    // Constroi um SVG data-URI deterministico a partir dos tracos desenhados.
    // Funciona em web E nativo (o PDF renderiza o <img> via webview),
    // ao contrario do captureRef (react-native-view-shot), que falha no web.
    try {
      const { width, height } = layoutRef.current;
      const pathEls = pathsRef.current
        .map(
          (d) =>
            `<path d="${d}" stroke="#1A365D" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
        )
        .join("");
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
        `viewBox="0 0 ${width} ${height}">` +
        `<rect width="100%" height="100%" fill="#FFFFFF"/>${pathEls}</svg>`;
      const encoded = encodeURIComponent(svg)
        .replace(/'/g, "%27")
        .replace(/"/g, "%22");
      onSignatureChange(`data:image/svg+xml,${encoded}`);
    } catch (error) {
      console.log("Error building signature SVG:", error);
      onSignatureChange(null);
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
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            if (width && height) layoutRef.current = { width, height };
          }}
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
