import { useThemeContext } from "@/contexts/ThemeContext";
import { Colors, Theme } from "@/constants/theme";

export type ThemeColors = typeof Colors.light | typeof Colors.dark;

export function useTheme() {
  const { theme, isDark, mode, setMode, resolvedTheme, fullTheme } = useThemeContext();

  return {
    theme,
    isDark,
    mode,
    setMode,
    resolvedTheme,
    fullTheme,
  };
}
