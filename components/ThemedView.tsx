import { View, type ViewProps } from "react-native";

import { useTheme } from "@/hooks/useTheme";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: "root" | "card" | "secondary" | "tertiary";
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  variant = "root",
  ...otherProps
}: ThemedViewProps) {
  const { theme, isDark, fullTheme } = useTheme();

  const getBackgroundColor = () => {
    if (isDark && darkColor) return darkColor;
    if (!isDark && lightColor) return lightColor;

    switch (variant) {
      case "card":
        return fullTheme.colors.cardBackground;
      case "secondary":
        return fullTheme.colors.backgroundSecondary;
      case "tertiary":
        return fullTheme.colors.backgroundTertiary;
      case "root":
      default:
        return fullTheme.colors.background;
    }
  };

  return <View style={[{ backgroundColor: getBackgroundColor() }, style]} {...otherProps} />;
}
