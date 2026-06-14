import React from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
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

interface FloatingActionButtonProps {
  onPress: () => void;
}

function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  const { fullTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(1.1, { damping: 15, stiffness: 150 });
    rotation.value = withSpring(45, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    rotation.value = withSpring(0, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.fab,
        {
          bottom: insets.bottom + 70,
          backgroundColor: fullTheme.colors.primary,
          ...fullTheme.shadows.large,
        },
        animatedStyle,
      ]}
    >
      <Feather name="plus" size={28} color="#FFFFFF" />
    </AnimatedPressable>
  );
}

export default function MainTabNavigator() {
  const { fullTheme, isDark } = useTheme();
  const { t } = useLanguage();
  return (
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
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
});
