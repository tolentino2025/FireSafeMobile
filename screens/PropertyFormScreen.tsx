import React, { useState, useLayoutEffect } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections, Property, Company } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius, AppColors } from "@/constants/theme";
import { PropertiesStackParamList } from "@/navigation/PropertiesStackNavigator";
import { toUpperIfNotEmail } from "@/utils/textTransform";
import { showAlert, showConfirm } from "@/utils/appAlert";

type PropertyFormScreenProps = NativeStackScreenProps<PropertiesStackParamList, "PropertyForm">;

export default function PropertyFormScreen({ navigation, route }: PropertyFormScreenProps) {
  const { mode, propertyId, companyId } = route.params;
  const { theme, fullTheme } = useTheme();
  const { t } = useLanguage();
  const {
    properties,
    companies,
    addProperty,
    updateProperty,
    deleteProperty,
    addCompany,
    updateCompany,
    deleteCompany,
  } = useInspections();

  const isEditing = mode === "company" ? !!companyId : !!propertyId;
  const existingCompany = mode === "company" ? companies.find((c) => c.id === companyId) : undefined;
  const existingProperty = mode === "property" ? properties.find((p) => p.id === propertyId) : undefined;

  const [name, setName] = useState(
    mode === "company" ? (existingCompany?.name || "") : (existingProperty?.name || "")
  );
  const [address, setAddress] = useState(
    mode === "company" ? (existingCompany?.address || "") : (existingProperty?.address || "")
  );
  const [phone, setPhone] = useState(
    mode === "company" ? (existingCompany?.contactPhone || "") : (existingProperty?.phone || "")
  );
  const [contact, setContact] = useState(
    mode === "company" ? (existingCompany?.contactName || "") : (existingProperty?.contact || "")
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: isEditing
        ? mode === "company"
          ? t.common.edit + " " + t.properties.companies
          : t.common.edit + " " + t.properties.properties
        : mode === "company"
        ? t.properties.addCompany
        : t.properties.addProperty,
    });
  }, [navigation, isEditing, mode, t]);

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert(t.common.error, "Name is required");
      return;
    }

    try {
      if (mode === "company") {
        const companyData: Partial<Company> = {
          id: existingCompany?.id || Date.now().toString(),
          name,
          address,
          contactPhone: phone,
          contactName: contact,
          cnpj: existingCompany?.cnpj || "",
          city: existingCompany?.city || "",
          state: existingCompany?.state || "",
          zipCode: existingCompany?.zipCode || "",
          contactEmail: existingCompany?.contactEmail || "",
          createdAt: existingCompany?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (isEditing && existingCompany) {
          await updateCompany(existingCompany.id, companyData);
        } else {
          await addCompany(companyData as Company);
        }
      } else {
        const propertyData: Property = {
          id: existingProperty?.id || Date.now().toString(),
          name,
          address,
          phone,
          contact,
          companyId: existingProperty?.companyId || "",
        };

        if (isEditing && existingProperty) {
          await updateProperty(existingProperty.id, propertyData);
        } else {
          await addProperty(propertyData);
        }
      }
      navigation.goBack();
    } catch (error) {
      showAlert(t.common.error, "Failed to save");
    }
  };

  const handleDelete = () => {
    const itemName = mode === "company" ? existingCompany?.name : existingProperty?.name;
    showConfirm(
      t.common.confirm,
      `${t.common.delete} "${itemName}"?`,
      async () => {
        try {
          if (mode === "company" && existingCompany) {
            await deleteCompany(existingCompany.id);
          } else if (mode === "property" && existingProperty) {
            await deleteProperty(existingProperty.id);
          }
          navigation.goBack();
        } catch (error) {
          showAlert(t.common.error, "Failed to delete");
        }
      },
      { confirmText: t.common.delete, cancelText: t.common.cancel, destructive: true }
    );
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border },
  ];

  return (
    <ScreenKeyboardAwareScrollView>
      <Spacer height={Spacing.xl} />

      <ThemedText type="h3">{t.properties.name}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={name}
        onChangeText={(text) => setName(toUpperIfNotEmail(text, "name"))}
        placeholder={t.properties.name}
        placeholderTextColor={theme.placeholder}
        autoFocus
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.properties.address}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={address}
        onChangeText={(text) => setAddress(toUpperIfNotEmail(text, "address"))}
        placeholder={t.properties.address}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.properties.phone}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={phone}
        onChangeText={setPhone}
        placeholder={t.properties.phone}
        placeholderTextColor={theme.placeholder}
        keyboardType="phone-pad"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.properties.contact}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={contact}
        onChangeText={(text) => setContact(toUpperIfNotEmail(text, "contact"))}
        placeholder={t.properties.contact}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing["3xl"]} />

      <View style={styles.buttonRow}>
        <Pressable
          onPress={handleSave}
          style={[styles.saveButton, { backgroundColor: fullTheme.colors.primary }]}
        >
          <Feather name="save" size={20} color="#FFFFFF" />
        </Pressable>
        {isEditing ? (
          <Pressable
            onPress={handleDelete}
            style={[styles.deleteButton, { backgroundColor: fullTheme.colors.error }]}
          >
            <Feather name="trash-2" size={20} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>

      <Spacer height={Spacing["4xl"]} />
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  saveButton: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
