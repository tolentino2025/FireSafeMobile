import React from "react";
import { View, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { ScreenFlatList } from "@/components/ScreenFlatList";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections, Contractor } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius, AppColors } from "@/constants/theme";
import { PropertiesStackParamList } from "@/navigation/PropertiesStackNavigator";

type ContractorsScreenProps = {
  navigation: NativeStackNavigationProp<PropertiesStackParamList, "Contractors">;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ContractorCard({
  contractor,
  onPress,
  onDelete,
}: {
  contractor: Contractor;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={onDelete}
      style={[styles.card, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${AppColors.primary}15` }]}>
        <Feather name="tool" size={24} color={AppColors.primary} />
      </View>
      <View style={styles.cardContent}>
        <ThemedText type="h4" numberOfLines={1}>{contractor.name}</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
          {contractor.licenseNumber ? `#${contractor.licenseNumber}` : "-"}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
          {contractor.city ? `${contractor.city}, ${contractor.state}` : contractor.address || "-"}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </AnimatedPressable>
  );
}

export default function ContractorsScreen({ navigation }: ContractorsScreenProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { contractors, deleteContractor } = useInspections();

  const handleAddContractor = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("ContractorForm", {});
  };

  const handleEditContractor = (contractor: Contractor) => {
    navigation.navigate("ContractorForm", { contractorId: contractor.id });
  };

  const handleDeleteContractor = (contractor: Contractor) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      t.common.confirm,
      `${t.common.delete} "${contractor.name}"?`,
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text: t.common.delete,
          style: "destructive",
          onPress: () => deleteContractor(contractor.id),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Contractor }) => (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <ContractorCard
        contractor={item}
        onPress={() => handleEditContractor(item)}
        onDelete={() => handleDeleteContractor(item)}
      />
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScreenFlatList
        data={contractors}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <Pressable
              onPress={handleAddContractor}
              style={[styles.addButton, { backgroundColor: AppColors.primary }]}
            >
              <Feather name="plus" size={20} color="#FFFFFF" />
              <ThemedText type="body" style={{ color: "#FFFFFF", marginLeft: Spacing.sm }}>
                {t.contractors?.add || "Adicionar Contratante"}
              </ThemedText>
            </Pressable>
            <Spacer height={Spacing.lg} />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="tool" size={48} color={theme.placeholder} />
            <Spacer height={Spacing.md} />
            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
              {t.contractors?.noResults || "Nenhum contratante cadastrado"}
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["4xl"],
  },
});
