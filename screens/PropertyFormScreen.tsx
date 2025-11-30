import React, { useState, useLayoutEffect } from "react";
import { View, StyleSheet, TextInput, Alert, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections, Property, Company } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius, AppColors } from "@/constants/theme";
import { PropertiesStackParamList } from "@/navigation/PropertiesStackNavigator";
import { toUpperIfNotEmail } from "@/utils/textTransform";

type PropertyFormScreenProps = NativeStackScreenProps<PropertiesStackParamList, "PropertyForm">;

export default function PropertyFormScreen({ navigation, route }: PropertyFormScreenProps) {
  const { mode, propertyId, companyId } = route.params;
  const { theme } = useTheme();
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
  const existingItem =
    mode === "company"
      ? companies.find((c) => c.id === companyId)
      : properties.find((p) => p.id === propertyId);

  const [name, setName] = useState(existingItem?.name || "");
  const [address, setAddress] = useState(existingItem?.address || "");
  const [phone, setPhone] = useState(existingItem?.phone || "");
  const [contact, setContact] = useState(existingItem?.contact || "");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: isEditing
        ? mode === "company"
          ? t.common.edit + " " + t.properties.companies
          : t.common.edit + " " + t.properties.properties
        : mode === "company"
        ? t.properties.addCompany
        : t.properties.addProperty,
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()}>
          <ThemedText type="body" style={{ color: AppColors.primary }}>
            {t.form.cancel}
          </ThemedText>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable onPress={handleSave}>
          <ThemedText type="body" style={{ color: AppColors.primary, fontWeight: "600" }}>
            {t.form.save}
          </ThemedText>
        </Pressable>
      ),
    });
  }, [navigation, name, address, phone, contact]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t.common.error, "Name is required");
      return;
    }

    try {
      if (mode === "company") {
        const companyData: Company = {
          id: existingItem?.id || Date.now().toString(),
          name,
          address,
          phone,
          contact,
        };

        if (isEditing && existingItem) {
          await updateCompany(existingItem.id, companyData);
        } else {
          await addCompany(companyData);
        }
      } else {
        const propertyData: Property = {
          id: existingItem?.id || Date.now().toString(),
          name,
          address,
          phone,
          contact,
          companyId: "",
        };

        if (isEditing && existingItem) {
          await updateProperty(existingItem.id, propertyData);
        } else {
          await addProperty(propertyData);
        }
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert(t.common.error, "Failed to save");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t.common.delete,
      `Are you sure you want to delete this ${mode}?`,
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text: t.common.delete,
          style: "destructive",
          onPress: async () => {
            try {
              if (mode === "company" && existingItem) {
                await deleteCompany(existingItem.id);
              } else if (mode === "property" && existingItem) {
                await deleteProperty(existingItem.id);
              }
              navigation.goBack();
            } catch (error) {
              Alert.alert(t.common.error, "Failed to delete");
            }
          },
        },
      ]
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

      {isEditing ? (
        <>
          <Spacer height={Spacing["4xl"]} />
          <Button
            onPress={handleDelete}
            style={{ backgroundColor: AppColors.error }}
          >
            {t.common.delete}
          </Button>
        </>
      ) : null}
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
});
