import React, { useState } from "react";
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
import { useInspections, Company } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius, AppColors } from "@/constants/theme";
import { PropertiesStackParamList } from "@/navigation/PropertiesStackNavigator";

type CompaniesScreenProps = {
  navigation: NativeStackNavigationProp<PropertiesStackParamList, "Companies">;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CompanyCard({
  company,
  onPress,
  onDelete,
}: {
  company: Company;
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
        <Feather name="briefcase" size={24} color={AppColors.primary} />
      </View>
      <View style={styles.cardContent}>
        <ThemedText type="h4" numberOfLines={1}>{company.name}</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
          {company.cnpj || "-"}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
          {company.city ? `${company.city}, ${company.state}` : company.address || "-"}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </AnimatedPressable>
  );
}

export default function CompaniesScreen({ navigation }: CompaniesScreenProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { companies, deleteCompany } = useInspections();

  const handleAddCompany = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("CompanyForm", {});
  };

  const handleEditCompany = (company: Company) => {
    navigation.navigate("CompanyForm", { companyId: company.id });
  };

  const handleDeleteCompany = (company: Company) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      t.common.confirm,
      `${t.common.delete} "${company.name}"?`,
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text: t.common.delete,
          style: "destructive",
          onPress: () => deleteCompany(company.id),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Company }) => (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <CompanyCard
        company={item}
        onPress={() => handleEditCompany(item)}
        onDelete={() => handleDeleteCompany(item)}
      />
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScreenFlatList
        data={companies}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <Pressable
              onPress={handleAddCompany}
              style={[styles.addButton, { backgroundColor: AppColors.primary }]}
            >
              <Feather name="plus" size={20} color="#FFFFFF" />
              <ThemedText type="body" style={{ color: "#FFFFFF", marginLeft: Spacing.sm }}>
                {t.companies?.add || "Adicionar Empresa"}
              </ThemedText>
            </Pressable>
            <Spacer height={Spacing.lg} />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="briefcase" size={48} color={theme.placeholder} />
            <Spacer height={Spacing.md} />
            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
              {t.companies?.noResults || "Nenhuma empresa cadastrada"}
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
