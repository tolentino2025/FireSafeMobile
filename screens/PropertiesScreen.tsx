import React, { useState, useMemo } from "react";
import { View, StyleSheet, TextInput, Pressable, Platform } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ScreenFlatList } from "@/components/ScreenFlatList";
import { ThemedText } from "@/components/ThemedText";
import { PropertyCard } from "@/components/PropertyCard";
import { CompanyCard } from "@/components/CompanyCard";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections, Property, Company, AppUser, FirePump, Contractor } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { PropertiesStackParamList } from "@/navigation/PropertiesStackNavigator";

type PropertiesScreenProps = {
  navigation: NativeStackNavigationProp<PropertiesStackParamList, "PropertiesList">;
};

type TabType = "companies" | "contractors" | "properties" | "inspectors" | "pumps";

function UserCard({
  user,
  onPress,
}: {
  user: AppUser;
  onPress: () => void;
}) {
  const { fullTheme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.userCard, { 
        backgroundColor: fullTheme.colors.cardBackground,
        borderColor: fullTheme.colors.border,
      }]}
    >
      <View style={[styles.userIconContainer, { backgroundColor: `${fullTheme.colors.primary}15` }]}>
        <Feather name="user" size={24} color={fullTheme.colors.primary} />
      </View>
      <View style={styles.userCardContent}>
        <ThemedText type="h4" numberOfLines={1}>{user.name}</ThemedText>
        <ThemedText type="small" secondary numberOfLines={1}>
          {user.role || "Inspetor"}
        </ThemedText>
        <ThemedText type="small" secondary numberOfLines={1}>
          {user.phone || user.email || "-"}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={fullTheme.colors.textSecondary} />
    </Pressable>
  );
}

function FirePumpCard({
  pump,
  getPumpTypeLabel,
  onPress,
}: {
  pump: FirePump;
  getPumpTypeLabel: (type: string) => string;
  onPress: () => void;
}) {
  const { fullTheme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.userCard, { 
        backgroundColor: fullTheme.colors.cardBackground,
        borderColor: fullTheme.colors.border,
      }]}
    >
      <View style={[styles.userIconContainer, { backgroundColor: `${fullTheme.colors.primary}15` }]}>
        <Feather name="activity" size={24} color={fullTheme.colors.primary} />
      </View>
      <View style={styles.userCardContent}>
        <ThemedText type="h4" numberOfLines={1}>{pump.tag}</ThemedText>
        <ThemedText type="small" secondary numberOfLines={1}>
          {getPumpTypeLabel(pump.type)}
        </ThemedText>
        <ThemedText type="small" secondary numberOfLines={1}>
          {pump.manufacturer ? `${pump.manufacturer}` : ""}{pump.model ? ` - ${pump.model}` : ""}
        </ThemedText>
        {pump.ratedFlowGpm || pump.ratedPressurePsi ? (
          <ThemedText type="small" secondary numberOfLines={1}>
            {pump.ratedFlowGpm ? `${pump.ratedFlowGpm} GPM` : ""}{pump.ratedPressurePsi ? ` @ ${pump.ratedPressurePsi} PSI` : ""}
          </ThemedText>
        ) : null}
      </View>
      <Feather name="chevron-right" size={20} color={fullTheme.colors.textSecondary} />
    </Pressable>
  );
}

function ContractorCard({
  contractor,
  onPress,
}: {
  contractor: Contractor;
  onPress: () => void;
}) {
  const { fullTheme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.userCard, { 
        backgroundColor: fullTheme.colors.cardBackground,
        borderColor: fullTheme.colors.border,
      }]}
    >
      <View style={[styles.userIconContainer, { backgroundColor: `${fullTheme.colors.primary}15` }]}>
        <Feather name="tool" size={24} color={fullTheme.colors.primary} />
      </View>
      <View style={styles.userCardContent}>
        <ThemedText type="h4" numberOfLines={1}>{contractor.name}</ThemedText>
        <ThemedText type="small" secondary numberOfLines={1}>
          {contractor.licenseNumber ? `#${contractor.licenseNumber}` : "-"}
        </ThemedText>
        <ThemedText type="small" secondary numberOfLines={1}>
          {contractor.city ? `${contractor.city}` : ""}{contractor.state ? `, ${contractor.state}` : ""}
        </ThemedText>
        <ThemedText type="small" secondary numberOfLines={1}>
          {contractor.phone || contractor.email || "-"}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={fullTheme.colors.textSecondary} />
    </Pressable>
  );
}

export default function PropertiesScreen({ navigation }: PropertiesScreenProps) {
  const { fullTheme } = useTheme();
  const { t } = useLanguage();
  const { properties, companies, appUsers, firePumps, contractors } = useInspections();

  const getPumpTypeLabel = (type: string) => {
    switch (type) {
      case "electric_main":
        return t.firePumps?.electricMain || "Elétrica Principal";
      case "diesel_main":
        return t.firePumps?.dieselMain || "Diesel Principal";
      case "jockey":
        return t.firePumps?.jockey || "Jockey";
      default:
        return type;
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("companies");

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    const query = searchQuery.toLowerCase();
    return companies.filter(
      (comp) =>
        comp.name.toLowerCase().includes(query) ||
        (comp.address && comp.address.toLowerCase().includes(query)) ||
        (comp.cnpj && comp.cnpj.toLowerCase().includes(query))
    );
  }, [companies, searchQuery]);

  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) return properties;
    const query = searchQuery.toLowerCase();
    return properties.filter(
      (prop) =>
        prop.name.toLowerCase().includes(query) ||
        prop.address.toLowerCase().includes(query)
    );
  }, [properties, searchQuery]);

  const filteredInspectors = useMemo(() => {
    if (!searchQuery.trim()) return appUsers;
    const query = searchQuery.toLowerCase();
    return appUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.role && user.role.toLowerCase().includes(query))
    );
  }, [appUsers, searchQuery]);

  const filteredPumps = useMemo(() => {
    if (!searchQuery.trim()) return firePumps;
    const query = searchQuery.toLowerCase();
    return firePumps.filter(
      (pump) =>
        pump.tag.toLowerCase().includes(query) ||
        (pump.manufacturer && pump.manufacturer.toLowerCase().includes(query)) ||
        (pump.model && pump.model.toLowerCase().includes(query))
    );
  }, [firePumps, searchQuery]);

  const filteredContractors = useMemo(() => {
    if (!searchQuery.trim()) return contractors;
    const query = searchQuery.toLowerCase();
    return contractors.filter(
      (contractor) =>
        contractor.name.toLowerCase().includes(query) ||
        (contractor.licenseNumber && contractor.licenseNumber.toLowerCase().includes(query)) ||
        (contractor.city && contractor.city.toLowerCase().includes(query))
    );
  }, [contractors, searchQuery]);

  const handleTabPress = (tab: TabType) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setActiveTab(tab);
  };

  const handleAddPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (activeTab === "companies") {
      navigation.navigate("CompanyForm", {});
    } else if (activeTab === "inspectors") {
      navigation.navigate("UserForm", {});
    } else if (activeTab === "pumps") {
      navigation.navigate("FirePumpList");
    } else if (activeTab === "contractors") {
      navigation.navigate("ContractorForm", {});
    } else {
      navigation.navigate("PropertyForm", { mode: "property" });
    }
  };

  const handleCompanyPress = (company: Company) => {
    navigation.navigate("CompanyForm", { companyId: company.id });
  };

  const handlePropertyPress = (property: Property) => {
    navigation.navigate("PropertyForm", { mode: "property", propertyId: property.id });
  };

  const handleInspectorPress = (user: AppUser) => {
    navigation.navigate("UserForm", { userId: user.id });
  };

  const handlePumpPress = (pump: FirePump) => {
    navigation.navigate("FirePumpForm", { pumpId: pump.id, companyId: pump.companyId });
  };

  const handleContractorPress = (contractor: Contractor) => {
    navigation.navigate("ContractorForm", { contractorId: contractor.id });
  };

  const renderCompanyItem = ({ item }: { item: Company }) => (
    <>
      <CompanyCard company={item} onPress={() => handleCompanyPress(item)} />
      <Spacer height={Spacing.md} />
    </>
  );

  const renderPropertyItem = ({ item }: { item: Property }) => (
    <>
      <PropertyCard property={item} onPress={() => handlePropertyPress(item)} />
      <Spacer height={Spacing.md} />
    </>
  );

  const renderInspectorItem = ({ item }: { item: AppUser }) => (
    <>
      <UserCard user={item} onPress={() => handleInspectorPress(item)} />
      <Spacer height={Spacing.md} />
    </>
  );

  const renderPumpItem = ({ item }: { item: FirePump }) => (
    <>
      <FirePumpCard pump={item} getPumpTypeLabel={getPumpTypeLabel} onPress={() => handlePumpPress(item)} />
      <Spacer height={Spacing.md} />
    </>
  );

  const renderContractorItem = ({ item }: { item: Contractor }) => (
    <>
      <ContractorCard contractor={item} onPress={() => handleContractorPress(item)} />
      <Spacer height={Spacing.md} />
    </>
  );

  const renderHeader = () => (
    <>
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

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => handleTabPress("companies")}
          style={[
            styles.tab,
            {
              backgroundColor:
                activeTab === "companies" ? fullTheme.colors.primary : fullTheme.colors.cardBackground,
              borderColor: fullTheme.colors.border,
            },
          ]}
        >
          <Feather
            name="briefcase"
            size={16}
            color={activeTab === "companies" ? "#FFFFFF" : fullTheme.colors.textPrimary}
          />
          <ThemedText
            type="small"
            style={{
              color: activeTab === "companies" ? "#FFFFFF" : fullTheme.colors.textPrimary,
              marginLeft: Spacing.xs,
              fontWeight: "600",
            }}
          >
            {t.properties.companies}
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => handleTabPress("inspectors")}
          style={[
            styles.tab,
            {
              backgroundColor:
                activeTab === "inspectors" ? fullTheme.colors.primary : fullTheme.colors.cardBackground,
              borderColor: fullTheme.colors.border,
            },
          ]}
        >
          <Feather
            name="users"
            size={16}
            color={activeTab === "inspectors" ? "#FFFFFF" : fullTheme.colors.textPrimary}
          />
          <ThemedText
            type="small"
            style={{
              color: activeTab === "inspectors" ? "#FFFFFF" : fullTheme.colors.textPrimary,
              marginLeft: Spacing.xs,
              fontWeight: "600",
            }}
          >
            {t.users?.title || "Inspetores"}
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => handleTabPress("pumps")}
          style={[
            styles.tab,
            {
              backgroundColor:
                activeTab === "pumps" ? fullTheme.colors.primary : fullTheme.colors.cardBackground,
              borderColor: fullTheme.colors.border,
            },
          ]}
        >
          <Feather
            name="activity"
            size={16}
            color={activeTab === "pumps" ? "#FFFFFF" : fullTheme.colors.textPrimary}
          />
          <ThemedText
            type="small"
            style={{
              color: activeTab === "pumps" ? "#FFFFFF" : fullTheme.colors.textPrimary,
              marginLeft: Spacing.xs,
              fontWeight: "600",
            }}
          >
            {t.firePumps?.title || "Bombas"}
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => handleTabPress("contractors")}
          style={[
            styles.tab,
            {
              backgroundColor:
                activeTab === "contractors" ? fullTheme.colors.primary : fullTheme.colors.cardBackground,
              borderColor: fullTheme.colors.border,
            },
          ]}
        >
          <Feather
            name="tool"
            size={16}
            color={activeTab === "contractors" ? "#FFFFFF" : fullTheme.colors.textPrimary}
          />
          <ThemedText
            type="small"
            style={{
              color: activeTab === "contractors" ? "#FFFFFF" : fullTheme.colors.textPrimary,
              marginLeft: Spacing.xs,
              fontWeight: "600",
            }}
          >
            {t.contractors?.title || "Contratantes"}
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => handleTabPress("properties")}
          style={[
            styles.tab,
            {
              backgroundColor:
                activeTab === "properties" ? fullTheme.colors.primary : fullTheme.colors.cardBackground,
              borderColor: fullTheme.colors.border,
            },
          ]}
        >
          <Feather
            name="home"
            size={16}
            color={activeTab === "properties" ? "#FFFFFF" : fullTheme.colors.textPrimary}
          />
          <ThemedText
            type="small"
            style={{
              color: activeTab === "properties" ? "#FFFFFF" : fullTheme.colors.textPrimary,
              marginLeft: Spacing.xs,
              fontWeight: "600",
            }}
          >
            {t.properties.properties}
          </ThemedText>
        </Pressable>
      </View>

      <Spacer height={Spacing.xl} />
    </>
  );

  const renderEmpty = () => {
    let icon: "briefcase" | "users" | "home" | "activity" | "tool" = "briefcase";
    let message = t.companies?.noResults || t.properties.noResults;
    
    if (activeTab === "inspectors") {
      icon = "users";
      message = t.users?.noResults || "Nenhum inspetor cadastrado";
    } else if (activeTab === "properties") {
      icon = "home";
      message = t.properties.noResults;
    } else if (activeTab === "pumps") {
      icon = "activity";
      message = t.firePumps?.noResults || "Nenhuma bomba cadastrada";
    } else if (activeTab === "contractors") {
      icon = "tool";
      message = t.contractors?.noResults || "Nenhum contratante cadastrado";
    }

    return (
      <View style={[styles.emptyState, { backgroundColor: fullTheme.colors.cardBackground }]}>
        <Feather name={icon} size={48} color={fullTheme.colors.textSecondary} />
        <Spacer height={Spacing.md} />
        <ThemedText type="body" secondary style={{ textAlign: "center" }}>
          {message}
        </ThemedText>
      </View>
    );
  };

  return (
    <>
      {activeTab === "companies" ? (
        <ScreenFlatList
          data={filteredCompanies}
          renderItem={renderCompanyItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
        />
      ) : activeTab === "inspectors" ? (
        <ScreenFlatList
          data={filteredInspectors}
          renderItem={renderInspectorItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
        />
      ) : activeTab === "pumps" ? (
        <ScreenFlatList
          data={filteredPumps}
          renderItem={renderPumpItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
        />
      ) : activeTab === "contractors" ? (
        <ScreenFlatList
          data={filteredContractors}
          renderItem={renderContractorItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <ScreenFlatList
          data={filteredProperties}
          renderItem={renderPropertyItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Pressable
        onPress={handleAddPress}
        style={({ pressed }) => [
          styles.addButton,
          { 
            backgroundColor: fullTheme.colors.primary, 
            opacity: pressed ? 0.9 : 1,
            ...fullTheme.shadows.large,
          },
        ]}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    height: 48,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  tabRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  emptyState: {
    padding: Spacing["3xl"],
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 100,
  },
  addButton: {
    position: "absolute",
    bottom: 100,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  userIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  userCardContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
});
