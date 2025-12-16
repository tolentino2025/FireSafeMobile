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
import { useInspections, JobSite, Contractor } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius, AppColors } from "@/constants/theme";
import { PropertiesStackParamList } from "@/navigation/PropertiesStackNavigator";

type JobSitesScreenProps = {
  navigation: NativeStackNavigationProp<PropertiesStackParamList, "JobSites">;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function JobSiteCard({
  jobSite,
  contractor,
  onPress,
  onDelete,
}: {
  jobSite: JobSite;
  contractor?: Contractor;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { fullTheme } = useTheme();
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
      style={[styles.card, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border, borderWidth: 1 }, animatedStyle]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${fullTheme.colors.primary}15` }]}>
        <Feather name="map-pin" size={24} color={fullTheme.colors.primary} />
      </View>
      <View style={styles.cardContent}>
        <ThemedText type="h4" numberOfLines={1}>{jobSite.jobName}</ThemedText>
        <ThemedText type="small" style={{ color: fullTheme.colors.textSecondary }} numberOfLines={1}>
          {jobSite.jobNumber ? `#${jobSite.jobNumber}` : "-"}
        </ThemedText>
        <ThemedText type="small" style={{ color: fullTheme.colors.textSecondary }} numberOfLines={1}>
          {contractor?.name || "-"}
        </ThemedText>
        <ThemedText type="small" style={{ color: fullTheme.colors.textSecondary }} numberOfLines={1}>
          {jobSite.city ? `${jobSite.city}, ${jobSite.state}` : jobSite.address || "-"}
        </ThemedText>
      </View>
      <View style={styles.actionButtons}>
        <Pressable
          onPress={onPress}
          style={[styles.actionButton, { backgroundColor: `${fullTheme.colors.primary}15` }]}
          hitSlop={8}
        >
          <Feather name="edit-2" size={18} color={fullTheme.colors.primary} />
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={[styles.actionButton, { backgroundColor: `${fullTheme.colors.error}15` }]}
          hitSlop={8}
        >
          <Feather name="trash-2" size={18} color={fullTheme.colors.error} />
        </Pressable>
      </View>
    </AnimatedPressable>
  );
}

export default function JobSitesScreen({ navigation }: JobSitesScreenProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { jobSites, contractors, deleteJobSite, getContractorById } = useInspections();

  const handleAddJobSite = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("JobSiteForm", {});
  };

  const handleEditJobSite = (jobSite: JobSite) => {
    navigation.navigate("JobSiteForm", { jobSiteId: jobSite.id });
  };

  const handleDeleteJobSite = (jobSite: JobSite) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      t.common.confirm,
      `${t.common.delete} "${jobSite.jobName}"?`,
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text: t.common.delete,
          style: "destructive",
          onPress: () => deleteJobSite(jobSite.id),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: JobSite }) => {
    const contractor = getContractorById(item.contractorId);
    return (
      <Animated.View entering={FadeIn} exiting={FadeOut}>
        <JobSiteCard
          jobSite={item}
          contractor={contractor}
          onPress={() => handleEditJobSite(item)}
          onDelete={() => handleDeleteJobSite(item)}
        />
      </Animated.View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenFlatList
        data={jobSites}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <Pressable
              onPress={handleAddJobSite}
              style={[styles.addButton, { backgroundColor: AppColors.primary }]}
            >
              <Feather name="plus" size={20} color="#FFFFFF" />
              <ThemedText type="body" style={{ color: "#FFFFFF", marginLeft: Spacing.sm }}>
                {t.jobSites?.add || "Adicionar Local"}
              </ThemedText>
            </Pressable>
            <Spacer height={Spacing.lg} />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="map-pin" size={48} color={theme.placeholder} />
            <Spacer height={Spacing.md} />
            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
              {t.jobSites?.noResults || "Nenhum local cadastrado"}
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
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["4xl"],
  },
});
