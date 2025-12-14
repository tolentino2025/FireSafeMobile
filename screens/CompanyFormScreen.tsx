import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections, Company } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { PropertiesStackParamList } from "@/navigation/PropertiesStackNavigator";
import { toUpperIfNotEmail } from "@/utils/textTransform";

type CompanyFormScreenProps = NativeStackScreenProps<PropertiesStackParamList, "CompanyForm">;

export default function CompanyFormScreen({ navigation, route }: CompanyFormScreenProps) {
  const { companyId } = route.params || {};
  const { theme, fullTheme } = useTheme();
  const { t } = useLanguage();
  const { companies, addCompany, updateCompany } = useInspections();

  const existingCompany = companyId ? companies.find((c) => c.id === companyId) : undefined;

  const [name, setName] = useState(existingCompany?.name || "");
  const [cnpj, setCnpj] = useState(existingCompany?.cnpj || "");
  const [address, setAddress] = useState(existingCompany?.address || "");
  const [city, setCity] = useState(existingCompany?.city || "");
  const [state, setState] = useState(existingCompany?.state || "");
  const [zipCode, setZipCode] = useState(existingCompany?.zipCode || "");
  const [contactName, setContactName] = useState(existingCompany?.contactName || "");
  const [contactPhone, setContactPhone] = useState(existingCompany?.contactPhone || "");
  const [contactEmail, setContactEmail] = useState(existingCompany?.contactEmail || "");

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert(t.common.error, t.form.required);
      return;
    }

    const companyData: Company = {
      id: existingCompany?.id || Date.now().toString(),
      name,
      cnpj,
      address,
      city,
      state,
      zipCode,
      contactName,
      contactPhone,
      contactEmail,
      createdAt: existingCompany?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (existingCompany) {
        await updateCompany(existingCompany.id, companyData);
      } else {
        await addCompany(companyData);
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error saving company:", error);
      Alert.alert(t.common.error, t.report.shareError);
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border },
  ];

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText type="h3">{t.companies?.name || "Nome da Empresa"}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={name}
        onChangeText={(text) => setName(toUpperIfNotEmail(text, "name"))}
        placeholder={t.companies?.name || "Nome da Empresa"}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.companies?.cnpj || "CNPJ"}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={cnpj}
        onChangeText={setCnpj}
        placeholder="00.000.000/0000-00"
        placeholderTextColor={theme.placeholder}
        keyboardType="numeric"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.form.propertyAddress}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={address}
        onChangeText={(text) => setAddress(toUpperIfNotEmail(text, "address"))}
        placeholder={t.form.propertyAddress}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <ThemedText type="h3">{t.companies?.city || "Cidade"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={city}
            onChangeText={(text) => setCity(toUpperIfNotEmail(text, "city"))}
            placeholder={t.companies?.city || "Cidade"}
            placeholderTextColor={theme.placeholder}
            autoCapitalize="characters"
          />
        </View>
        <View style={styles.halfField}>
          <ThemedText type="h3">{t.companies?.state || "Estado"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={state}
            onChangeText={(text) => setState(toUpperIfNotEmail(text, "state"))}
            placeholder="UF"
            placeholderTextColor={theme.placeholder}
            maxLength={2}
            autoCapitalize="characters"
          />
        </View>
      </View>

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.companies?.zipCode || "CEP"}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={zipCode}
        onChangeText={setZipCode}
        placeholder="00000-000"
        placeholderTextColor={theme.placeholder}
        keyboardType="numeric"
      />

      <Spacer height={Spacing["2xl"]} />

      <ThemedText type="h2">{t.companies?.contactInfo || "Dados do Contato"}</ThemedText>

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.companies?.contactName || "Nome do Contato"}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={contactName}
        onChangeText={(text) => setContactName(toUpperIfNotEmail(text, "contactName"))}
        placeholder={t.companies?.contactName || "Nome do Contato"}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <ThemedText type="h3">{t.form.propertyPhone}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder={t.form.propertyPhone}
            placeholderTextColor={theme.placeholder}
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.halfField}>
          <ThemedText type="h3">{t.companies?.email || "Email"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={contactEmail}
            onChangeText={(text) => setContactEmail(toUpperIfNotEmail(text, "email"))}
            placeholder="email@empresa.com"
            placeholderTextColor={theme.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <Spacer height={Spacing["3xl"]} />

      <Button onPress={handleSubmit}>
        <View style={styles.saveButtonContent}>
          <Feather name="save" size={18} color={fullTheme.colors.buttonText} />
          <ThemedText type="body" style={[styles.saveButtonText, { color: fullTheme.colors.buttonText }]}>{t.form.save}</ThemedText>
        </View>
      </Button>

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
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  saveButtonText: {
    fontWeight: "600",
  },
});
