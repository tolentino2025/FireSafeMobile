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
    // ── Instrument v1.0 tokens ──
    primaryDeep: string;
    primarySoft: string;
    successSoft: string;
    warningSoft: string;
    errorSoft: string;
    borderStrong: string;
    ink: string;
    inkSoft: string;
    inkFaint: string;
    surface: string;
    surfaceAlt: string;
    // Placa de aço (constante nos dois temas)
    steelBg: string;
    steelBg1: string;
    steelBg2: string;
    steelInk: string;
    steelLabel: string;
    steelLine: string;
  };
  gradients: {
    header: string[];
    card: string[];
    steel: string[];
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
    primary: "#CE3A26",
    primaryDark: "#A52A1A",
    primaryLight: "#E8634F",
    background: "#E9E4DC",
    backgroundSecondary: "#F1ECE4",
    backgroundTertiary: "#E2DCD2",
    cardBackground: "#FBFAF6",
    textPrimary: "#181410",
    textSecondary: "#6B6258",
    border: "rgba(24,20,16,0.09)",
    success: "#2C7A57",
    warning: "#B7791B",
    error: "#CE3A26",
    inputBackground: "#F1ECE4",
    placeholder: "#A39A8E",
    buttonText: "#FFFFFF",
    tabIconDefault: "#A39A8E",
    tabIconSelected: "#CE3A26",
    link: "#CE3A26",
    primaryDeep: "#A52A1A",
    primarySoft: "rgba(206,58,38,0.10)",
    successSoft: "rgba(44,122,87,0.12)",
    warningSoft: "rgba(183,121,27,0.12)",
    errorSoft: "rgba(206,58,38,0.10)",
    borderStrong: "rgba(24,20,16,0.14)",
    ink: "#181410",
    inkSoft: "#6B6258",
    inkFaint: "#A39A8E",
    surface: "#FBFAF6",
    surfaceAlt: "#F1ECE4",
    steelBg: "#1c2a33",
    steelBg1: "#22323d",
    steelBg2: "#16222a",
    steelInk: "#eef4f8",
    steelLabel: "#7f94a3",
    steelLine: "rgba(255,255,255,0.04)",
  },
  gradients: {
    header: ["#F1ECE4", "#E9E4DC"],
    card: ["#FBFAF6", "#F1ECE4"],
    steel: ["#22323d", "#16222a"],
  },
  shadows: {
    small: {
      shadowColor: "#281A12",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: "#281A12",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.18,
      shadowRadius: 22,
      elevation: 6,
    },
    large: {
      shadowColor: "#281A12",
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: 0.28,
      shadowRadius: 40,
      elevation: 12,
    },
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: "#F2553C",
    primaryDark: "#C5381F",
    primaryLight: "#F87A66",
    background: "#100E0C",
    backgroundSecondary: "#231E1A",
    backgroundTertiary: "#15110F",
    cardBackground: "#1B1714",
    textPrimary: "#F3EEE7",
    textSecondary: "#9C9286",
    border: "rgba(255,255,255,0.09)",
    success: "#4FBE8E",
    warning: "#E6A23D",
    error: "#F2553C",
    inputBackground: "#231E1A",
    placeholder: "#6E655B",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6E655B",
    tabIconSelected: "#F2553C",
    link: "#F2553C",
    primaryDeep: "#C5381F",
    primarySoft: "rgba(242,85,60,0.15)",
    successSoft: "rgba(79,190,142,0.16)",
    warningSoft: "rgba(230,162,61,0.16)",
    errorSoft: "rgba(242,85,60,0.15)",
    borderStrong: "rgba(255,255,255,0.16)",
    ink: "#F3EEE7",
    inkSoft: "#9C9286",
    inkFaint: "#6E655B",
    surface: "#1B1714",
    surfaceAlt: "#231E1A",
    steelBg: "#1c2a33",
    steelBg1: "#22323d",
    steelBg2: "#16222a",
    steelInk: "#eef4f8",
    steelLabel: "#7f94a3",
    steelLine: "rgba(255,255,255,0.04)",
  },
  gradients: {
    header: ["#15110F", "#100E0C"],
    card: ["#231E1A", "#1B1714"],
    steel: ["#22323d", "#16222a"],
  },
  shadows: {
    small: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.55,
      shadowRadius: 24,
      elevation: 6,
    },
    large: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.7,
      shadowRadius: 50,
      elevation: 12,
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
  primary: "#CE3A26",
  primaryDark: "#A52A1A",
  primaryLight: "#E8634F",
  success: "#2C7A57",
  warning: "#B7791B",
  error: "#CE3A26",
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

// Padrao Instrument: Archivo (editorial) para titulos/texto, IBM Plex Mono (tecnico)
// para dados/codigos. Pesos seguem o design system.
export const Typography = {
  h1: {
    fontSize: 22,
    fontWeight: "800" as const,
    letterSpacing: -0.4,
  },
  h2: {
    fontSize: 19,
    fontWeight: "800" as const,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  h4: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  body: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
};

// Familias de fonte do padrao Instrument.
// 'Archivo' e 'IBM Plex Mono' sao injetadas no web via Google Fonts (ver utils/fonts).
const ARCHIVO = "Archivo, system-ui, -apple-system, sans-serif";
const PLEX_MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

export const Fonts = Platform.select({
  ios: {
    sans: "Archivo",
    serif: "ui-serif",
    rounded: "Archivo",
    mono: "IBM Plex Mono",
  },
  android: {
    sans: "Archivo",
    serif: "serif",
    rounded: "Archivo",
    mono: "IBM Plex Mono",
  },
  default: {
    sans: ARCHIVO,
    serif: "serif",
    rounded: ARCHIVO,
    mono: PLEX_MONO,
  },
  web: {
    sans: ARCHIVO,
    serif: "Georgia, 'Times New Roman', serif",
    rounded: ARCHIVO,
    mono: PLEX_MONO,
  },
});

export const Shadows = {
  small: lightTheme.shadows.small,
  medium: lightTheme.shadows.medium,
  large: lightTheme.shadows.large,
};
