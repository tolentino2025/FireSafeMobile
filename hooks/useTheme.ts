import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/useColorScheme";

export type ThemeColors = (typeof Colors)["light"] | (typeof Colors)["dark"];

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];

  return {
    theme,
    isDark,
  };
}
