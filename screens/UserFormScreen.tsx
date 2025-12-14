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
import { useInspections, AppUser } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { PropertiesStackParamList } from "@/navigation/PropertiesStackNavigator";
import { toUpperIfNotEmail } from "@/utils/textTransform";

type UserFormScreenProps = NativeStackScreenProps<PropertiesStackParamList, "UserForm">;

export default function UserFormScreen({ navigation, route }: UserFormScreenProps) {
  const { userId } = route.params || {};
  const { theme, fullTheme } = useTheme();
  const { t } = useLanguage();
  const { appUsers, addAppUser, updateAppUser } = useInspections();

  const existingUser = userId ? appUsers.find((u) => u.id === userId) : undefined;

  const [name, setName] = useState(existingUser?.name || "");
  const [email, setEmail] = useState(existingUser?.email || "");
  const [phone, setPhone] = useState(existingUser?.phone || "");
  const [role, setRole] = useState(existingUser?.role || "INSPETOR");

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert(t.common.error, t.form.required);
      return;
    }

    const userData: AppUser = {
      id: existingUser?.id || Date.now().toString(),
      name,
      email,
      phone,
      role,
      createdAt: existingUser?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (existingUser) {
        await updateAppUser(existingUser.id, userData);
      } else {
        await addAppUser(userData);
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error saving user:", error);
      Alert.alert(t.common.error, t.report.shareError);
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border },
  ];

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText type="h3">{t.users?.name || "Nome"}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={name}
        onChangeText={(text) => setName(toUpperIfNotEmail(text, "name"))}
        placeholder={t.users?.name || "Nome Completo"}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.users?.role || "Cargo"}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={role}
        onChangeText={(text) => setRole(toUpperIfNotEmail(text, "role"))}
        placeholder={t.users?.role || "Inspetor, Supervisor, etc."}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.companies?.email || "Email"}</ThemedText>
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

      <ThemedText type="h3">{t.form.propertyPhone}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={phone}
        onChangeText={setPhone}
        placeholder={t.form.propertyPhone}
        placeholderTextColor={theme.placeholder}
        keyboardType="phone-pad"
      />

      <Spacer height={Spacing["3xl"]} />

      <Button onPress={handleSubmit} variant="save">
        <View style={styles.saveButtonContent}>
          <Feather name="save" size={18} color="#111827" />
          <ThemedText type="body" style={[styles.saveButtonText, { color: "#111827" }]}>{t.form.save}</ThemedText>
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
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  saveButtonText: {
    fontWeight: "600",
  },
});
