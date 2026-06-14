import React, { useState, useMemo } from "react";
import { View, StyleSheet, TextInput, Pressable, Platform, useWindowDimensions } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ScreenFlatList } from "@/components/ScreenFlatList";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PropertyCard } from "@/components/PropertyCard";
import { CompanyCard } from "@/components/CompanyCard";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections, Property, Company, AppUser, TechnicalResponsible, FirePump, Contractor, JobSite } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { PropertiesStackParamList } from "@/navigation/PropertiesStackNavigator";

type PropertiesScreenProps = {
  navigation: NativeStackNavigationProp<PropertiesStackParamList, "PropertiesList">;
};

type TabType = "companies" | "contractors" | "properties" | "inspectors" | "techResponsible" | "pumps" | "jobSites";

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

function JobSiteCard({
  jobSite,
  contractorName,
  onPress,
}: {
  jobSite: JobSite;
  contractorName?: string;
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
        <Feather name="map-pin" size={24} color={fullTheme.colors.primary} />
      </View>
      <View style={styles.userCardContent}>
        <ThemedText type="h4" numberOfLines={1}>{jobSite.jobName}</ThemedText>
        <ThemedText type="small" secondary numberOfLines={1}>
          {jobSite.jobNumber ? `#${jobSite.jobNumber}` : "-"}
        </ThemedText>
        {contractorName ? (
          <ThemedText type="small" secondary numberOfLines={1}>
            {contractorName}
          </ThemedText>
        ) : null}
        <ThemedText type="small" secondary numberOfLines={1}>
          {jobSite.city ? `${jobSite.city}` : ""}{jobSite.state ? `, ${jobSite.state}` : ""}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={fullTheme.colors.textSecondary} />
    </Pressable>
  );
}

export default function PropertiesScreen({ navigation }: PropertiesScreenProps) {
  const { fullTheme } = useTheme();
  const { t } = useLanguage();
  const { properties, companies, appUsers, technicalResponsibles, firePumps, contractors, jobSites, getContractorById } = useInspections();
  const { width: screenWidth } = useWindowDimensions();
  
  const numColumns = screenWidth < 380 ? 2 : screenWidth < 640 ? 3 : 4;
  const tileWidth = (screenWidth - Spacing.xl * 2 - Spacing.sm * (numColumns - 1)) / numColumns;

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

  const filteredTechResponsibles = useMemo(() => {
    if (!searchQuery.trim()) return technicalResponsibles;
    const query = searchQuery.toLowerCase();
    return technicalResponsibles.filter(
      (tr) =>
        tr.name.toLowerCase().includes(query) ||
        (tr.creaCAU && tr.creaCAU.toLowerCase().includes(query)) ||
        (tr.email && tr.email.toLowerCase().includes(query)) ||
        (tr.role && tr.role.toLowerCase().includes(query))
    );
  }, [technicalResponsibles, searchQuery]);

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

  const filteredJobSites = useMemo(() => {
    if (!searchQuery.trim()) return jobSites;
    const query = searchQuery.toLowerCase();
    return jobSites.filter(
      (jobSite) =>
        jobSite.jobName.toLowerCase().includes(query) ||
        (jobSite.jobNumber && jobSite.jobNumber.toLowerCase().includes(query)) ||
        (jobSite.city && jobSite.city.toLowerCase().includes(query))
    );
  }, [jobSites, searchQuery]);

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
    } else if (activeTab === "techResponsible") {
      navigation.navigate("TechnicalResponsibleForm", {});
    } else if (activeTab === "pumps") {
      navigation.navigate("FirePumpList");
    } else if (activeTab === "contractors") {
      navigation.navigate("ContractorForm", {});
    } else if (activeTab === "jobSites") {
      navigation.navigate("JobSiteForm", {});
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

  const handleTechResponsiblePress = (tr: TechnicalResponsible) => {
    navigation.navigate("TechnicalResponsibleForm", { techResponsibleId: tr.id });
  };

  const handlePumpPress = (pump: FirePump) => {
    navigation.navigate("FirePumpForm", { pumpId: pump.id, companyId: pump.companyId });
  };

  const handleContractorPress = (contractor: Contractor) => {
    navigation.navigate("ContractorForm", { contractorId: contractor.id });
  };

  const handleJobSitePress = (jobSite: JobSite) => {
    navigation.navigate("JobSiteForm", { jobSiteId: jobSite.id });
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

  const renderTechResponsibleItem = ({ item }: { item: TechnicalResponsible }) => (
    <>
      <Pressable
        onPress={() => handleTechResponsiblePress(item)}
        style={[styles.userCard, { 
          backgroundColor: fullTheme.colors.cardBackground,
          borderColor: fullTheme.colors.border,
        }]}
      >
        <View style={[styles.userIconContainer, { backgroundColor: `${fullTheme.colors.primary}15` }]}>
          <Feather name="award" size={24} color={fullTheme.colors.primary} />
        </View>
        <View style={styles.userCardContent}>
          <ThemedText type="h4" numberOfLines={1}>{item.name}</ThemedText>
          <ThemedText type="small" secondary numberOfLines={1}>
            {item.creaCAU || "-"}
          </ThemedText>
          <ThemedText type="small" secondary numberOfLines={1}>
            {item.role || "-"}
          </ThemedText>
          <ThemedText type="small" secondary numberOfLines={1}>
            {item.phone || item.email || "-"}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={fullTheme.colors.textSecondary} />
      </Pressable>
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

  const renderJobSiteItem = ({ item }: { item: JobSite }) => {
    const contractor = getContractorById(item.contractorId);
    return (
      <>
        <JobSiteCard jobSite={item} contractorName={contractor?.name} onPress={() => handleJobSitePress(item)} />
        <Spacer height={Spacing.md} />
      </>
    );
  };

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

      <View style={styles.tabGrid}>
        {[
          { id: "companies" as TabType, icon: "briefcase" as const, label: t.properties.companies },
          { id: "inspectors" as TabType, icon: "users" as const, label: t.users?.title || "Inspetores" },
          { id: "techResponsible" as TabType, icon: "award" as const, label: t.technicalResponsible?.title || "Resp. Técnico" },
          { id: "pumps" as TabType, icon: "activity" as const, label: t.firePumps?.title || "Bombas" },
          { id: "contractors" as TabType, icon: "tool" as const, label: t.contractors?.title || "Prestadoras" },
          { id: "jobSites" as TabType, icon: "map-pin" as const, label: t.jobSites?.title || "Locais" },
          { id: "properties" as TabType, icon: "home" as const, label: t.properties.properties },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => handleTabPress(tab.id)}
              style={[
                styles.tabTile,
                {
                  width: tileWidth,
                  backgroundColor: isActive ? fullTheme.colors.primary : fullTheme.colors.cardBackground,
                  borderColor: isActive ? fullTheme.colors.primary : fullTheme.colors.border,
                },
              ]}
            >
              <Feather
                name={tab.icon}
                size={22}
                color={isActive ? "#FFFFFF" : fullTheme.colors.textPrimary}
              />
              <ThemedText
                type="small"
                numberOfLines={2}
                style={[
                  styles.tabTileText,
                  { color: isActive ? "#FFFFFF" : fullTheme.colors.textPrimary },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <Spacer height={Spacing.xl} />
    </>
  );

  const renderEmpty = () => {
    let icon: "briefcase" | "users" | "home" | "activity" | "tool" | "map-pin" | "award" = "briefcase";
    let message = t.companies?.noResults || t.properties.noResults;
    
    if (activeTab === "inspectors") {
      icon = "users";
      message = t.users?.noResults || "Nenhum inspetor cadastrado";
    } else if (activeTab === "techResponsible") {
      icon = "award";
      message = t.technicalResponsible?.noResults || "Nenhum responsável técnico cadastrado";
    } else if (activeTab === "properties") {
      icon = "home";
      message = t.properties.noResults;
    } else if (activeTab === "pumps") {
      icon = "activity";
      message = t.firePumps?.noResults || "Nenhuma bomba cadastrada";
    } else if (activeTab === "contractors") {
      icon = "tool";
      message = t.contractors?.noResults || "Nenhum contratante cadastrado";
    } else if (activeTab === "jobSites") {
      icon = "map-pin";
      message = t.jobSites?.noResults || "Nenhum local cadastrado";
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
    <ThemedView style={styles.screen}>
      <ScreenHeader title={t.properties.title} subtitle={t.properties.eyebrow} />
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
      ) : activeTab === "techResponsible" ? (
        <ScreenFlatList
          data={filteredTechResponsibles}
          renderItem={renderTechResponsibleItem}
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
      ) : activeTab === "jobSites" ? (
        <ScreenFlatList
          data={filteredJobSites}
          renderItem={renderJobSiteItem}
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
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
  tabGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tabTile: {
    minHeight: 72,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  tabTileText: {
    fontWeight: "600",
    textAlign: "center",
    fontSize: 11,
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
