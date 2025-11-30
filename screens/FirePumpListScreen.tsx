import React, { useState, useMemo } from "react";
import { View, StyleSheet, TextInput, Pressable, Platform, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ScreenFlatList } from "@/components/ScreenFlatList";
import { ThemedText } from "@/components/ThemedText";
import { SelectPicker } from "@/components/SelectPicker";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections, FirePump, FirePumpControlPanel, Company } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { PropertiesStackParamList } from "@/navigation/PropertiesStackNavigator";

type FirePumpListScreenProps = NativeStackScreenProps<PropertiesStackParamList, "FirePumpList">;

function PumpCard({
  pump,
  panelCount,
  onPress,
  onDelete,
  pumpTypeLabel,
}: {
  pump: FirePump;
  panelCount: number;
  onPress: () => void;
  onDelete: () => void;
  pumpTypeLabel: string;
}) {
  const { fullTheme } = useTheme();

  const handleLongPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onDelete();
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={handleLongPress}
      style={[styles.pumpCard, { 
        backgroundColor: fullTheme.colors.cardBackground,
        borderColor: fullTheme.colors.border,
      }]}
    >
      <View style={[styles.pumpIconContainer, { backgroundColor: `${fullTheme.colors.primary}15` }]}>
        <Feather name="activity" size={24} color={fullTheme.colors.primary} />
      </View>
      <View style={styles.pumpCardContent}>
        <ThemedText type="h4" numberOfLines={1}>{pump.tag}</ThemedText>
        <ThemedText type="small" secondary numberOfLines={1}>
          {pumpTypeLabel}
        </ThemedText>
        <ThemedText type="small" secondary numberOfLines={1}>
          {pump.manufacturer ? `${pump.manufacturer}` : ""}{pump.model ? ` - ${pump.model}` : ""}
        </ThemedText>
        {pump.ratedFlowGpm || pump.ratedPressurePsi ? (
          <ThemedText type="small" secondary numberOfLines={1}>
            {pump.ratedFlowGpm ? `${pump.ratedFlowGpm} GPM` : ""}{pump.ratedPressurePsi ? ` @ ${pump.ratedPressurePsi} PSI` : ""}
          </ThemedText>
        ) : null}
        {panelCount > 0 ? (
          <View style={styles.panelBadge}>
            <Feather name="cpu" size={12} color={fullTheme.colors.textSecondary} />
            <ThemedText type="small" secondary style={{ marginLeft: 4 }}>
              {panelCount} {panelCount === 1 ? "painel" : "painéis"}
            </ThemedText>
          </View>
        ) : null}
      </View>
      <Feather name="chevron-right" size={20} color={fullTheme.colors.textSecondary} />
    </Pressable>
  );
}

export default function FirePumpListScreen({ navigation }: FirePumpListScreenProps) {
  const { fullTheme } = useTheme();
  const { t } = useLanguage();
  const { firePumps, firePumpPanels, companies, deleteFirePump, getPanelsByPump } = useInspections();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  const companyOptions = useMemo(() => {
    return companies.map((company) => ({
      id: company.id,
      label: company.name,
      sublabel: company.cnpj || company.address || "",
    }));
  }, [companies]);

  const getPumpTypeLabel = (type: string) => {
    switch (type) {
      case "electric_main":
        return t.firePumps.electricMain;
      case "diesel_main":
        return t.firePumps.dieselMain;
      case "jockey":
        return t.firePumps.jockey;
      default:
        return type;
    }
  };

  const filteredPumps = useMemo(() => {
    let pumps = firePumps;
    
    if (selectedCompanyId) {
      pumps = pumps.filter((pump) => pump.companyId === selectedCompanyId);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      pumps = pumps.filter(
        (pump) =>
          pump.tag.toLowerCase().includes(query) ||
          (pump.manufacturer && pump.manufacturer.toLowerCase().includes(query)) ||
          (pump.model && pump.model.toLowerCase().includes(query))
      );
    }
    
    return pumps;
  }, [firePumps, selectedCompanyId, searchQuery]);

  const handleAddPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (!selectedCompanyId && companies.length > 0) {
      Alert.alert(t.common.error, t.firePumps.selectCompanyFirst);
      return;
    }
    navigation.navigate("FirePumpForm", { companyId: selectedCompanyId });
  };

  const handlePumpPress = (pump: FirePump) => {
    navigation.navigate("FirePumpForm", { pumpId: pump.id, companyId: pump.companyId });
  };

  const handleDeletePump = (pump: FirePump) => {
    Alert.alert(
      t.common.delete,
      t.firePumps.deleteConfirmation,
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text: t.common.delete,
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFirePump(pump.id);
            } catch (error) {
              console.error("Error deleting pump:", error);
            }
          },
        },
      ]
    );
  };

  const renderPumpItem = ({ item }: { item: FirePump }) => {
    const panelCount = getPanelsByPump(item.id).length;
    return (
      <>
        <PumpCard
          pump={item}
          panelCount={panelCount}
          onPress={() => handlePumpPress(item)}
          onDelete={() => handleDeletePump(item)}
          pumpTypeLabel={getPumpTypeLabel(item.type)}
        />
        <Spacer height={Spacing.md} />
      </>
    );
  };

  const renderHeader = () => (
    <>
      <ThemedText type="h3" style={{ marginBottom: Spacing.md }}>
        {t.companies.selectCompany}
      </ThemedText>
      <SelectPicker
        options={companyOptions}
        selectedId={selectedCompanyId}
        onSelect={setSelectedCompanyId}
        placeholder={t.companies.selectCompany}
        title={t.companies.selectCompany}
      />

      <Spacer height={Spacing.lg} />

      <View style={[styles.searchContainer, { 
        backgroundColor: fullTheme.colors.cardBackground,
        borderColor: fullTheme.colors.border,
      }]}>
        <Feather name="search" size={20} color={fullTheme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: fullTheme.colors.textPrimary }]}
          placeholder={t.properties.search}
          placeholderTextColor={fullTheme.colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={20} color={fullTheme.colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <Spacer height={Spacing.lg} />

      {selectedCompanyId || companies.length === 0 ? (
        <Pressable
          onPress={handleAddPress}
          style={[styles.addButton, { 
            backgroundColor: fullTheme.colors.primary,
          }]}
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
          <ThemedText type="body" style={{ color: "#FFFFFF", marginLeft: Spacing.sm, fontWeight: "600" }}>
            {t.firePumps.add}
          </ThemedText>
        </Pressable>
      ) : null}

      <Spacer height={Spacing.lg} />
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="activity" size={48} color={fullTheme.colors.textSecondary} />
      <Spacer height={Spacing.md} />
      <ThemedText type="body" secondary style={{ textAlign: "center" }}>
        {t.firePumps.noResults}
      </ThemedText>
    </View>
  );

  return (
    <ScreenFlatList
      data={filteredPumps}
      keyExtractor={(item) => item.id}
      renderItem={renderPumpItem}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
    />
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  pumpCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  pumpIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  pumpCardContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  panelBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
});
