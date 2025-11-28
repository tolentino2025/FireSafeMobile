import React, { useState, useMemo } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ScreenFlatList } from "@/components/ScreenFlatList";
import { ThemedText } from "@/components/ThemedText";
import { PropertyCard } from "@/components/PropertyCard";
import { CompanyCard } from "@/components/CompanyCard";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections, Property, Company } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius, AppColors } from "@/constants/theme";
import { PropertiesStackParamList } from "@/navigation/PropertiesStackNavigator";

type PropertiesScreenProps = {
  navigation: NativeStackNavigationProp<PropertiesStackParamList, "PropertiesList">;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PropertiesScreen({ navigation }: PropertiesScreenProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { properties, companies } = useInspections();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"companies" | "properties">("companies");

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    const query = searchQuery.toLowerCase();
    return companies.filter(
      (comp) =>
        comp.name.toLowerCase().includes(query) ||
        comp.address.toLowerCase().includes(query)
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

  const handleAddPress = () => {
    navigation.navigate("PropertyForm", {
      mode: activeTab === "companies" ? "company" : "property",
    });
  };

  const handleCompanyPress = (company: Company) => {
    navigation.navigate("PropertyForm", { mode: "company", companyId: company.id });
  };

  const handlePropertyPress = (property: Property) => {
    navigation.navigate("PropertyForm", { mode: "property", propertyId: property.id });
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
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={20} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>

      <Spacer height={Spacing.lg} />

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setActiveTab("companies")}
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
            size={18}
            color={activeTab === "companies" ? "#FFFFFF" : theme.text}
          />
          <ThemedText
            type="body"
            style={{
              color: activeTab === "companies" ? "#FFFFFF" : theme.text,
              marginLeft: Spacing.sm,
              fontWeight: "600",
            }}
          >
            {t.properties.companies}
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("properties")}
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
            size={18}
            color={activeTab === "properties" ? "#FFFFFF" : theme.text}
          />
          <ThemedText
            type="body"
            style={{
              color: activeTab === "properties" ? "#FFFFFF" : theme.text,
              marginLeft: Spacing.sm,
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

  const renderEmpty = () => (
    <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
      <Feather
        name={activeTab === "companies" ? "briefcase" : "home"}
        size={48}
        color={theme.textSecondary}
      />
      <Spacer height={Spacing.md} />
      <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
        {t.properties.noResults}
      </ThemedText>
    </View>
  );

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
          { backgroundColor: AppColors.primary, opacity: pressed ? 0.9 : 1 },
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
    gap: Spacing.md,
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
});
