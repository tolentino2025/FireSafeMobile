import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Property } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius } from "@/constants/theme";

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PropertyCard({ property, onPress }: PropertyCardProps) {
  const { fullTheme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        { 
          backgroundColor: fullTheme.colors.cardBackground,
          borderColor: fullTheme.colors.border,
        },
        animatedStyle,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${fullTheme.colors.primary}15` }]}>
        <Feather name="home" size={24} color={fullTheme.colors.primary} />
      </View>
      <View style={styles.content}>
        <ThemedText type="h4" numberOfLines={1}>
          {property.name}
        </ThemedText>
        {property.address ? (
          <ThemedText type="small" secondary numberOfLines={1}>
            {property.address}
          </ThemedText>
        ) : null}
        {property.contact ? (
          <ThemedText type="small" secondary numberOfLines={1}>
            {property.contact}
          </ThemedText>
        ) : null}
      </View>
      <Feather name="chevron-right" size={20} color={fullTheme.colors.textSecondary} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
    marginRight: Spacing.sm,
  },
});
