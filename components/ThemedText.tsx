import { Text, type TextProps } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { Typography, Fonts } from "@/constants/theme";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "h1" | "h2" | "h3" | "h4" | "body" | "small" | "link";
  secondary?: boolean;
  /** Usa IBM Plex Mono (dados tecnicos: TAG, RPM, PSI, datas, codigos NFPA). */
  mono?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "body",
  secondary = false,
  mono = false,
  ...rest
}: ThemedTextProps) {
  const { isDark, fullTheme } = useTheme();

  const getColor = () => {
    if (isDark && darkColor) return darkColor;
    if (!isDark && lightColor) return lightColor;

    if (type === "link") {
      return fullTheme.colors.link;
    }

    if (secondary) {
      return fullTheme.colors.textSecondary;
    }

    return fullTheme.colors.textPrimary;
  };

  const getTypeStyle = () => {
    switch (type) {
      case "h1":
        return Typography.h1;
      case "h2":
        return Typography.h2;
      case "h3":
        return Typography.h3;
      case "h4":
        return Typography.h4;
      case "body":
        return Typography.body;
      case "small":
        return Typography.small;
      case "link":
        return Typography.link;
      default:
        return Typography.body;
    }
  };

  const fontFamily = mono ? Fonts?.mono : Fonts?.sans;

  return (
    <Text
      style={[
        { color: getColor() },
        getTypeStyle(),
        fontFamily ? { fontFamily } : null,
        style,
      ]}
      {...rest}
    />
  );
}
