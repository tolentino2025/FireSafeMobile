import React, { useState } from "react";
import { View, StyleSheet, TextInput, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections, Contractor } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { PropertiesStackParamList } from "@/navigation/PropertiesStackNavigator";
import { toUpperIfNotEmail } from "@/utils/textTransform";

type ContractorFormScreenProps = NativeStackScreenProps<PropertiesStackParamList, "ContractorForm">;

export default function ContractorFormScreen({ navigation, route }: ContractorFormScreenProps) {
  const { contractorId } = route.params || {};
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { contractors, addContractor, updateContractor } = useInspections();

  const existingContractor = contractorId ? contractors.find((c) => c.id === contractorId) : undefined;

  const [name, setName] = useState(existingContractor?.name || "");
  const [licenseNumber, setLicenseNumber] = useState(existingContractor?.licenseNumber || "");
  const [address, setAddress] = useState(existingContractor?.address || "");
  const [city, setCity] = useState(existingContractor?.city || "");
  const [state, setState] = useState(existingContractor?.state || "");
  const [zipCode, setZipCode] = useState(existingContractor?.zipCode || "");
  const [phone, setPhone] = useState(existingContractor?.phone || "");
  const [fax, setFax] = useState(existingContractor?.fax || "");
  const [email, setEmail] = useState(existingContractor?.email || "");

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert(t.common.error, t.form.required);
      return;
    }

    const contractorData: Contractor = {
      id: existingContractor?.id || Date.now().toString(),
      name,
      licenseNumber,
      address,
      city,
      state,
      zipCode,
      phone,
      fax,
      email,
      createdAt: existingContractor?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (existingContractor) {
        const updates: Partial<Contractor> = {
          name,
          licenseNumber,
          address,
          city,
          state,
          zipCode,
          phone,
          fax,
          email,
        };
        await updateContractor(existingContractor.id, updates);
      } else {
        await addContractor(contractorData);
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error saving contractor:", error);
      Alert.alert(t.common.error, t.report.shareError);
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border },
  ];

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText type="h3">{t.contractors?.name || "Nome do Contratante"}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={name}
        onChangeText={(text) => setName(toUpperIfNotEmail(text, "name"))}
        placeholder={t.contractors?.name || "Nome do Contratante"}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.contractors?.licenseNumber || "Numero da Licenca"}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={licenseNumber}
        onChangeText={setLicenseNumber}
        placeholder={t.contractors?.licenseNumber || "Numero da Licenca"}
        placeholderTextColor={theme.placeholder}
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
          <ThemedText type="h3">{t.contractors?.city || "Cidade"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={city}
            onChangeText={(text) => setCity(toUpperIfNotEmail(text, "city"))}
            placeholder={t.contractors?.city || "Cidade"}
            placeholderTextColor={theme.placeholder}
            autoCapitalize="characters"
          />
        </View>
        <View style={styles.halfField}>
          <ThemedText type="h3">{t.contractors?.state || "Estado"}</ThemedText>
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

      <ThemedText type="h3">{t.contractors?.zipCode || "CEP"}</ThemedText>
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

      <ThemedText type="h2">{t.contractors?.contactInfo || "Dados de Contato"}</ThemedText>

      <Spacer height={Spacing.lg} />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <ThemedText type="h3">{t.contractors?.phone || "Telefone"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={phone}
            onChangeText={setPhone}
            placeholder={t.contractors?.phone || "Telefone"}
            placeholderTextColor={theme.placeholder}
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.halfField}>
          <ThemedText type="h3">{t.contractors?.fax || "Fax"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={fax}
            onChangeText={setFax}
            placeholder={t.contractors?.fax || "Fax"}
            placeholderTextColor={theme.placeholder}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.contractors?.email || "Email"}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={email}
        onChangeText={(text) => setEmail(toUpperIfNotEmail(text, "email"))}
        placeholder="email@contratante.com"
        placeholderTextColor={theme.placeholder}
        keyboardType="email-address"
        autoCapitalize="none"
      />

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
