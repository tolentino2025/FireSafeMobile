import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { SelectPicker } from "@/components/SelectPicker";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections, JobSite } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { PropertiesStackParamList } from "@/navigation/PropertiesStackNavigator";
import { toUpperIfNotEmail } from "@/utils/textTransform";
import { showAlert, showConfirm } from "@/utils/appAlert";

type JobSiteFormScreenProps = NativeStackScreenProps<PropertiesStackParamList, "JobSiteForm">;

export default function JobSiteFormScreen({ navigation, route }: JobSiteFormScreenProps) {
  const { jobSiteId, contractorId: routeContractorId } = route.params || {};
  const { theme, fullTheme } = useTheme();
  const { t } = useLanguage();
  const { jobSites, contractors, addJobSite, updateJobSite, deleteJobSite } = useInspections();

  const existingJobSite = jobSiteId ? jobSites.find((j) => j.id === jobSiteId) : undefined;

  const [contractorId, setContractorId] = useState(existingJobSite?.contractorId || routeContractorId || "");
  const [jobName, setJobName] = useState(existingJobSite?.jobName || "");
  const [jobNumber, setJobNumber] = useState(existingJobSite?.jobNumber || "");
  const [address, setAddress] = useState(existingJobSite?.address || "");
  const [city, setCity] = useState(existingJobSite?.city || "");
  const [state, setState] = useState(existingJobSite?.state || "");
  const [testLocation, setTestLocation] = useState(existingJobSite?.testLocation || "");
  const [testMethod, setTestMethod] = useState(existingJobSite?.testMethod || "");
  const [comments, setComments] = useState(existingJobSite?.comments || "");

  const contractorOptions = contractors.map((c) => ({
    id: c.id,
    label: c.name,
    sublabel: c.city ? `${c.city}, ${c.state}` : undefined,
  }));

  const handleSubmit = async () => {
    if (!jobName.trim()) {
      showAlert(t.common.error, t.form.required);
      return;
    }

    if (!contractorId) {
      showAlert(t.common.error, t.jobSites?.selectContractor || "Selecione um contratante");
      return;
    }

    const jobSiteData: JobSite = {
      id: existingJobSite?.id || Date.now().toString(),
      contractorId,
      jobName,
      jobNumber,
      address,
      city,
      state,
      testLocation,
      testMethod,
      comments,
      createdAt: existingJobSite?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (existingJobSite) {
        const updates: Partial<JobSite> = {
          contractorId,
          jobName,
          jobNumber,
          address,
          city,
          state,
          testLocation,
          testMethod,
          comments,
        };
        await updateJobSite(existingJobSite.id, updates);
      } else {
        await addJobSite(jobSiteData);
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error saving job site:", error);
      showAlert(t.common.error, t.report.shareError);
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border },
  ];

  const multilineInputStyle = [
    styles.multilineInput,
    { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border },
  ];

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText type="h2">{t.jobSites?.title || "Dados do Local"}</ThemedText>

      <Spacer height={Spacing.xl} />

      <ThemedText type="h3">{t.jobSites?.contractor || "Contratante"}</ThemedText>
      <Spacer height={Spacing.sm} />
      <SelectPicker
        selectedId={contractorId || undefined}
        options={contractorOptions}
        onSelect={setContractorId}
        placeholder={t.jobSites?.selectContractor || "Selecione o contratante"}
        title={t.jobSites?.contractor || "Contratante"}
        emptyText={t.contractors?.noResults || "Nenhuma prestadora cadastrada"}
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.jobSites?.jobName || "Nome do Local"}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={jobName}
        onChangeText={(text) => setJobName(toUpperIfNotEmail(text, "name"))}
        placeholder={t.jobSites?.jobName || "Nome do Local"}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.jobSites?.jobNumber || "Numero do Trabalho"}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={jobNumber}
        onChangeText={setJobNumber}
        placeholder={t.jobSites?.jobNumber || "Numero do Trabalho"}
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

      <Spacer height={Spacing["2xl"]} />

      <ThemedText type="h2">{t.jobSites?.testInfo || "Informacoes do Teste"}</ThemedText>

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.jobSites?.testLocation || "Local do Teste"}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={testLocation}
        onChangeText={(text) => setTestLocation(toUpperIfNotEmail(text, "location"))}
        placeholder={t.jobSites?.testLocation || "Local do Teste"}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.jobSites?.testMethod || "Metodo do Teste"}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={testMethod}
        onChangeText={(text) => setTestMethod(toUpperIfNotEmail(text, "method"))}
        placeholder={t.jobSites?.testMethod || "Metodo do Teste"}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.jobSites?.comments || "Observacoes"}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={multilineInputStyle}
        value={comments}
        onChangeText={setComments}
        placeholder={t.jobSites?.comments || "Observacoes"}
        placeholderTextColor={theme.placeholder}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <Spacer height={Spacing["3xl"]} />

      <View style={styles.buttonRow}>
        <Pressable
          onPress={handleSubmit}
          style={[styles.saveButton, { backgroundColor: fullTheme.colors.primary }]}
        >
          <Feather name="save" size={20} color="#FFFFFF" />
        </Pressable>
        {existingJobSite ? (
          <Pressable
            onPress={() => {
              showConfirm(
                t.common.confirm,
                `${t.common.delete} "${existingJobSite.jobName}"?`,
                async () => {
                  await deleteJobSite(existingJobSite.id);
                  navigation.goBack();
                },
                { confirmText: t.common.delete, cancelText: t.common.cancel, destructive: true }
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
  multilineInput: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
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
