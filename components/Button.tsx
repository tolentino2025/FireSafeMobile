import React, { ReactNode } from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "save";
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  onPress,
  children,
  style,
  disabled = false,
  variant = "primary",
}: ButtonProps) {
  const { fullTheme } = useTheme();
  const scale = useSharedValue(1);
  const pressed = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.98, springConfig);
      pressed.value = true;
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, springConfig);
      pressed.value = false;
    }
  };

  const getBackgroundColor = (isPressed: boolean) => {
    if (disabled) return "#9CA3AF";

    switch (variant) {
      case "primary":
        return isPressed ? fullTheme.colors.primaryDark : fullTheme.colors.primary;
      case "secondary":
        return isPressed ? fullTheme.colors.backgroundTertiary : fullTheme.colors.backgroundSecondary;
      case "outline":
      case "ghost":
        return isPressed ? fullTheme.colors.backgroundSecondary : "transparent";
      case "save":
        return isPressed ? "#D4D4D4" : "#EDEDED";
      default:
        return fullTheme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return "#E5E7EB";

    switch (variant) {
      case "primary":
        return fullTheme.colors.buttonText;
      case "secondary":
        return fullTheme.colors.textPrimary;
      case "outline":
      case "ghost":
        return fullTheme.colors.primary;
      case "save":
        return "#111827";
      default:
        return fullTheme.colors.buttonText;
    }
  };

  const getBorderColor = () => {
    if (variant === "outline") {
      return disabled ? "#9CA3AF" : fullTheme.colors.primary;
    }
    return "transparent";
  };

  const isStringChild = typeof children === "string";

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={({ pressed: isPressed }) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor(isPressed),
          borderColor: getBorderColor(),
          borderWidth: variant === "outline" ? 2 : 0,
          opacity: disabled ? 0.6 : 1,
        },
        style,
        animatedStyle,
      ]}
    >
      {isStringChild ? (
        <ThemedText
          type="body"
          style={[styles.buttonText, { color: getTextColor() }]}
        >
          {children}
        </ThemedText>
      ) : (
        children
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "600",
  },
});
