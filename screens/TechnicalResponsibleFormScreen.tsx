import React, { useState } from "react";
import { View, StyleSheet, TextInput, Alert, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections, TechnicalResponsible } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { PropertiesStackParamList } from "@/navigation/PropertiesStackNavigator";
import { toUpperIfNotEmail } from "@/utils/textTransform";

type TechnicalResponsibleFormScreenProps = NativeStackScreenProps<PropertiesStackParamList, "TechnicalResponsibleForm">;

export default function TechnicalResponsibleFormScreen({ navigation, route }: TechnicalResponsibleFormScreenProps) {
  const { techResponsibleId } = route.params || {};
  const { theme, fullTheme } = useTheme();
  const { t } = useLanguage();
  const { technicalResponsibles, addTechnicalResponsible, updateTechnicalResponsible, deleteTechnicalResponsible } = useInspections();

  const existingTechResp = techResponsibleId ? technicalResponsibles.find((tr) => tr.id === techResponsibleId) : undefined;

  const [name, setName] = useState(existingTechResp?.name || "");
  const [creaCAU, setCreaCAU] = useState(existingTechResp?.creaCAU || "");
  const [email, setEmail] = useState(existingTechResp?.email || "");
  const [phone, setPhone] = useState(existingTechResp?.phone || "");
  const [role, setRole] = useState(existingTechResp?.role || "");

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert(t.common.error, t.form.required);
      return;
    }

    const techRespData: TechnicalResponsible = {
      id: existingTechResp?.id || Date.now().toString(),
      name,
      creaCAU,
      email,
      phone,
      role,
      createdAt: existingTechResp?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (existingTechResp) {
        await updateTechnicalResponsible(existingTechResp.id, techRespData);
      } else {
        await addTechnicalResponsible(techRespData);
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error saving technical responsible:", error);
      Alert.alert(t.common.error, t.report.shareError);
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border },
  ];

  const tr = t.technicalResponsible || {
    name: "Nome",
    creaCAU: "CREA/CAU",
    email: "Email",
    phone: "Telefone",
    role: "Cargo",
  };

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText type="h3">{tr.name}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={name}
        onChangeText={(text) => setName(toUpperIfNotEmail(text, "name"))}
        placeholder={tr.name}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{tr.creaCAU}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={creaCAU}
        onChangeText={(text) => setCreaCAU(toUpperIfNotEmail(text, "creaCAU"))}
        placeholder={tr.creaCAU}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{tr.email}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={email}
        onChangeText={(text) => setEmail(toUpperIfNotEmail(text, "email"))}
        placeholder="email@exemplo.com"
        placeholderTextColor={theme.placeholder}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{tr.phone}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={phone}
        onChangeText={setPhone}
        placeholder={tr.phone}
        placeholderTextColor={theme.placeholder}
        keyboardType="phone-pad"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{tr.role}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={role}
        onChangeText={(text) => setRole(toUpperIfNotEmail(text, "role"))}
        placeholder={tr.role}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing["3xl"]} />

      <View style={styles.buttonRow}>
        <View style={styles.saveButtonContainer}>
          <Button onPress={handleSubmit} variant="save">
            <View style={styles.saveButtonContent}>
              <Feather name="save" size={18} color="#111827" />
              <ThemedText type="body" style={[styles.saveButtonText, { color: "#111827" }]}>{t.form.save}</ThemedText>
            </View>
          </Button>
        </View>
        {existingTechResp ? (
          <Pressable
            onPress={() => {
              Alert.alert(
                t.common.confirm,
                `${t.common.delete} "${existingTechResp.name}"?`,
                [
                  { text: t.common.cancel, style: "cancel" },
                  {
                    text: t.common.delete,
                    style: "destructive",
                    onPress: async () => {
                      await deleteTechnicalResponsible(existingTechResp.id);
                      navigation.goBack();
                    },
                  },
                ]
              );
            }}
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
  saveButtonContainer: {
    flex: 1,
  },
  deleteButton: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
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
