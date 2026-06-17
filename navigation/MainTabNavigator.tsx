import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import InspectionsStackNavigator from "@/navigation/InspectionsStackNavigator";
import ITMStackNavigator from "@/navigation/ITMStackNavigator";
import PropertiesStackNavigator from "@/navigation/PropertiesStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spacing, Fonts } from "@/constants/theme";

export type MainTabParamList = {
  HomeTab: undefined;
  InspectionsTab: undefined;
  ScheduleTab: undefined;
  PropertiesTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Telas RAIZ de cada aba — o FAB de Nova Inspeção só aparece nelas.
// Em telas internas (detalhe, formulário, etc.) o FAB fica oculto para
// nao cobrir os botoes de acao do rodape (PDF, enviar, salvar).
const ROOT_ROUTES = new Set([
  "Home",
  "InspectionsList",
  "ITMPlans",
  "PropertiesList",
  "Profile",
]);

// Caminha pelo state da navegacao ate a rota-folha ativa.
function getActiveLeafRouteName(state: any): string | undefined {
  if (!state || typeof state.index !== "number") return undefined;
  const route = state.routes?.[state.index];
  if (!route) return undefined;
  if (route.state) return getActiveLeafRouteName(route.state);
  return route.name;
}

interface FloatingActionButtonProps {
  onPress: () => void;
}

// FAB de Nova Inspecao (padrao Instrument): 54x54, radius 18, borda 4px na cor
// do fundo da tela, ember, flutuando acima do centro da barra (top -22px).
function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  const { fullTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(1.08, { damping: 15, stiffness: 150 });
    rotation.value = withSpring(90, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    rotation.value = withSpring(0, { damping: 15, stiffness: 150 });
  };

  // Barra = 78px de altura + safe area. FAB flutua a -22px acima do topo da barra.
  const bottom = insets.bottom + 78 - 22;

  return (
    <AnimatedPressable
      accessibilityLabel="Nova inspeção"
      testID="fab-new-inspection"
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.fab,
        {
          bottom,
          backgroundColor: fullTheme.colors.primary,
          borderColor: fullTheme.colors.background,
          ...fullTheme.shadows.large,
        },
        animatedStyle,
      ]}
    >
      <Feather name="plus" size={26} color="#FFFFFF" />
    </AnimatedPressable>
  );
}

export default function MainTabNavigator() {
  const { fullTheme, isDark } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation<any>();

  // So mostra o FAB nas telas raiz das abas (nao no detalhe/formulario).
  // Usa getState()+listener (nao useNavigationState) para nao lançar no nivel
  // do wrapper do navegador.
  const [showFab, setShowFab] = useState(true);
  useEffect(() => {
    const update = () => {
      try {
        const leaf = getActiveLeafRouteName(navigation.getState?.());
        setShowFab(leaf ? ROOT_ROUTES.has(leaf) : true);
      } catch {
        setShowFab(true);
      }
    };
    update();
    const unsub = navigation.addListener?.("state", update);
    return unsub;
  }, [navigation]);

  return (
    <View style={styles.root}>
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        tabBarActiveTintColor: fullTheme.colors.tabIconSelected,
        tabBarInactiveTintColor: fullTheme.colors.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          height: 78,
          paddingTop: 8,
          backgroundColor: Platform.select({
            ios: "transparent",
            android: fullTheme.colors.surface,
            default: fullTheme.colors.surface,
          }),
          borderTopWidth: 1,
          borderTopColor: fullTheme.colors.border,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          fontFamily: Fonts?.sans,
        },
        tabBarItemStyle: {
          paddingTop: 6,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={[StyleSheet.absoluteFill, { backgroundColor: fullTheme.colors.surface + "F2" }]}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: t.tabs.home,
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={23} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="InspectionsTab"
        component={InspectionsStackNavigator}
        options={{
          title: t.tabs.inspections,
          tabBarIcon: ({ color, size }) => (
            <Feather name="clipboard" size={23} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ScheduleTab"
        component={ITMStackNavigator}
        options={{
          title: t.tabs.schedule,
          tabBarIcon: ({ color, size }) => (
            <Feather name="calendar" size={23} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PropertiesTab"
        component={PropertiesStackNavigator}
        options={{
          title: t.tabs.properties,
          tabBarIcon: ({ color, size }) => (
            <Feather name="map-pin" size={23} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: t.tabs.profile,
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={23} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
    {showFab ? (
      <FloatingActionButton
        onPress={() =>
          navigation.navigate("HomeTab", { screen: "NewInspection" })
        }
      />
    ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    alignSelf: "center",
    width: 54,
    height: 54,
    borderRadius: 18,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
});
