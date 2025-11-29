import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useDeviceColorScheme } from "react-native";
import { Colors } from "@/constants/theme";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedTheme: ResolvedTheme;
  isDark: boolean;
  theme: typeof Colors.light;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@firesafe_theme_preference";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [isLoading, setIsLoading] = useState(true);
  const deviceColorScheme = useDeviceColorScheme();

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme && (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system")) {
          setModeState(storedTheme as ThemeMode);
        }
      } catch (error) {
        console.error("Error loading theme preference:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
      setModeState(newMode);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (mode === "system") {
      return deviceColorScheme === "dark" ? "dark" : "light";
    }
    return mode;
  }, [mode, deviceColorScheme]);

  const isDark = resolvedTheme === "dark";
  const theme = Colors[resolvedTheme];

  const value = useMemo(() => ({
    mode,
    setMode,
    resolvedTheme,
    isDark,
    theme,
    isLoading,
  }), [mode, resolvedTheme, isDark, theme, isLoading]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

const defaultThemeContext: ThemeContextType = {
  mode: "system",
  setMode: () => {},
  resolvedTheme: "light",
  isDark: false,
  theme: Colors.light,
  isLoading: false,
};

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    return defaultThemeContext;
  }
  return context;
}
