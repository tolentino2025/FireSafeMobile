import { Platform } from "react-native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { isLiquidGlassAvailable } from "expo-glass-effect";

interface ScreenOptionsParams {
  theme: {
    backgroundRoot?: string;
    text?: string;
    background?: string;
    textPrimary?: string;
  };
  isDark: boolean;
  transparent?: boolean;
}

export const getCommonScreenOptions = ({
  theme,
  isDark,
  transparent = true,
}: ScreenOptionsParams): NativeStackNavigationOptions => {
  const backgroundColor = theme.background || theme.backgroundRoot || "#F5F5F5";
  const textColor = theme.textPrimary || theme.text || "#111111";
  
  return {
    headerTitleAlign: "center",
    headerTransparent: transparent,
    headerBlurEffect: isDark ? "dark" : "light",
    headerTintColor: textColor,
    headerStyle: {
      backgroundColor: Platform.select({
        ios: undefined,
        android: backgroundColor,
        web: backgroundColor,
      }),
    },
    gestureEnabled: true,
    gestureDirection: "horizontal",
    fullScreenGestureEnabled: isLiquidGlassAvailable() ? false : true,
    contentStyle: {
      backgroundColor: backgroundColor,
    },
  };
};
