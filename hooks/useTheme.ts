import { useThemeContext } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/theme";

export type ThemeColors = typeof Colors.light | typeof Colors.dark;

export function useTheme() {
  const { theme, isDark, mode, setMode, resolvedTheme } = useThemeContext();

  return {
    theme,
    isDark,
    mode,
    setMode,
    resolvedTheme,
  };
}
