import { Platform } from "react-native";

export interface Theme {
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    cardBackground: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    inputBackground: string;
    placeholder: string;
    buttonText: string;
    tabIconDefault: string;
    tabIconSelected: string;
    link: string;
  };
  gradients: {
    header: string[];
    card: string[];
  };
  shadows: {
    small: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    medium: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    large: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: "#DC2626",
    primaryDark: "#A81E1E",
    primaryLight: "#F87171",
    background: "#F5F5F5",
    backgroundSecondary: "#EBEBEB",
    backgroundTertiary: "#E0E0E0",
    cardBackground: "#FFFFFF",
    textPrimary: "#111111",
    textSecondary: "#444444",
    border: "#E5E7EB",
    success: "#22C55E",
    warning: "#FACC15",
    error: "#DC2626",
    inputBackground: "#FFFFFF",
    placeholder: "#9CA3AF",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#DC2626",
    link: "#DC2626",
  },
  gradients: {
    header: ["#FEE2E2", "#F5F5F5"],
    card: ["#FFFFFF", "#FAFAFA"],
  },
  shadows: {
    small: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    large: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: "#EF4444",
    primaryDark: "#B91C1C",
    primaryLight: "#FCA5A5",
    background: "#0B0B0D",
    backgroundSecondary: "#18181B",
    backgroundTertiary: "#27272A",
    cardBackground: "#151518",
    textPrimary: "#FFFFFF",
    textSecondary: "#A1A1AA",
    border: "#27272A",
    success: "#22C55E",
    warning: "#FACC15",
    error: "#EF4444",
    inputBackground: "#151518",
    placeholder: "#71717A",
    buttonText: "#FFFFFF",
    tabIconDefault: "#71717A",
    tabIconSelected: "#EF4444",
    link: "#EF4444",
  },
  gradients: {
    header: ["#1E1E22", "#0B0B0D"],
    card: ["#1A1A1E", "#151518"],
  },
  shadows: {
    small: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 4,
      elevation: 2,
    },
    large: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.45,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

export type ResolvedTheme = "light" | "dark";

export function getTheme(resolvedTheme: ResolvedTheme): Theme {
  return resolvedTheme === "dark" ? darkTheme : lightTheme;
}

export const Colors = {
  light: {
    text: lightTheme.colors.textPrimary,
    textSecondary: lightTheme.colors.textSecondary,
    buttonText: lightTheme.colors.buttonText,
    tabIconDefault: lightTheme.colors.tabIconDefault,
    tabIconSelected: lightTheme.colors.tabIconSelected,
    link: lightTheme.colors.link,
    backgroundRoot: lightTheme.colors.background,
    backgroundDefault: lightTheme.colors.cardBackground,
    backgroundSecondary: lightTheme.colors.backgroundSecondary,
    backgroundTertiary: lightTheme.colors.backgroundTertiary,
    border: lightTheme.colors.border,
    inputBackground: lightTheme.colors.inputBackground,
    placeholder: lightTheme.colors.placeholder,
    primary: lightTheme.colors.primary,
    primaryDark: lightTheme.colors.primaryDark,
    primaryLight: lightTheme.colors.primaryLight,
    cardBackground: lightTheme.colors.cardBackground,
    success: lightTheme.colors.success,
    warning: lightTheme.colors.warning,
    error: lightTheme.colors.error,
  },
  dark: {
    text: darkTheme.colors.textPrimary,
    textSecondary: darkTheme.colors.textSecondary,
    buttonText: darkTheme.colors.buttonText,
    tabIconDefault: darkTheme.colors.tabIconDefault,
    tabIconSelected: darkTheme.colors.tabIconSelected,
    link: darkTheme.colors.link,
    backgroundRoot: darkTheme.colors.background,
    backgroundDefault: darkTheme.colors.cardBackground,
    backgroundSecondary: darkTheme.colors.backgroundSecondary,
    backgroundTertiary: darkTheme.colors.backgroundTertiary,
    border: darkTheme.colors.border,
    inputBackground: darkTheme.colors.inputBackground,
    placeholder: darkTheme.colors.placeholder,
    primary: darkTheme.colors.primary,
    primaryDark: darkTheme.colors.primaryDark,
    primaryLight: darkTheme.colors.primaryLight,
    cardBackground: darkTheme.colors.cardBackground,
    success: darkTheme.colors.success,
    warning: darkTheme.colors.warning,
    error: darkTheme.colors.error,
  },
};

export const AppColors = {
  primary: "#DC2626",
  primaryDark: "#A81E1E",
  primaryLight: "#F87171",
  success: "#22C55E",
  warning: "#FACC15",
  error: "#DC2626",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 22,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Shadows = {
  small: lightTheme.shadows.small,
  medium: lightTheme.shadows.medium,
  large: lightTheme.shadows.large,
};
