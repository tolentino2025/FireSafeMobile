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
import { useInspections, Property, Company, AppUser } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius, AppColors } from "@/constants/theme";
import { PropertiesStackParamList } from "@/navigation/PropertiesStackNavigator";

type PropertiesScreenProps = {
  navigation: NativeStackNavigationProp<PropertiesStackParamList, "PropertiesList">;
};

type TabType = "companies" | "properties" | "inspectors";

function UserCard({
  user,
  onPress,
}: {
  user: AppUser;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.userCard, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={[styles.userIconContainer, { backgroundColor: `${AppColors.secondary}15` }]}>
        <Feather name="user" size={24} color={AppColors.secondary} />
      </View>
      <View style={styles.userCardContent}>
        <ThemedText type="h4" numberOfLines={1}>{user.name}</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
          {user.role || "Inspetor"}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
          {user.phone || user.email || "-"}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );
}

export default function PropertiesScreen({ navigation }: PropertiesScreenProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { properties, companies, appUsers } = useInspections();

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

  const renderHeader = () => (
    <>
      <View style={[styles.searchContainer, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="search" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder={t.properties.search}
          placeholderTextColor={theme.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={20} color={theme.textSecondary} />
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
                activeTab === "companies" ? AppColors.primary : theme.backgroundDefault,
            },
          ]}
        >
          <Feather
            name="briefcase"
            size={16}
            color={activeTab === "companies" ? "#FFFFFF" : theme.text}
          />
          <ThemedText
            type="small"
            style={{
              color: activeTab === "companies" ? "#FFFFFF" : theme.text,
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
                activeTab === "inspectors" ? AppColors.secondary : theme.backgroundDefault,
            },
          ]}
        >
          <Feather
            name="users"
            size={16}
            color={activeTab === "inspectors" ? "#FFFFFF" : theme.text}
          />
          <ThemedText
            type="small"
            style={{
              color: activeTab === "inspectors" ? "#FFFFFF" : theme.text,
              marginLeft: Spacing.xs,
              fontWeight: "600",
            }}
          >
            {t.users?.title || "Inspetores"}
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => handleTabPress("properties")}
          style={[
            styles.tab,
            {
              backgroundColor:
                activeTab === "properties" ? AppColors.primary : theme.backgroundDefault,
            },
          ]}
        >
          <Feather
            name="home"
            size={16}
            color={activeTab === "properties" ? "#FFFFFF" : theme.text}
          />
          <ThemedText
            type="small"
            style={{
              color: activeTab === "properties" ? "#FFFFFF" : theme.text,
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
    let icon: "briefcase" | "users" | "home" = "briefcase";
    let message = t.companies?.noResults || t.properties.noResults;
    
    if (activeTab === "inspectors") {
      icon = "users";
      message = t.users?.noResults || "Nenhum inspetor cadastrado";
    } else if (activeTab === "properties") {
      icon = "home";
      message = t.properties.noResults;
    }

    return (
      <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name={icon} size={48} color={theme.textSecondary} />
        <Spacer height={Spacing.md} />
        <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
          {message}
        </ThemedText>
      </View>
    );
  };

  const getButtonColor = () => {
    if (activeTab === "inspectors") return AppColors.secondary;
    return AppColors.primary;
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
          { backgroundColor: getButtonColor(), opacity: pressed ? 0.9 : 1 },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
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
