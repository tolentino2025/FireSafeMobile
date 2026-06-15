import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Switch, Alert, Linking, Platform, Modal, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedView } from "@/components/ThemedView";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections } from "@/contexts/InspectionContext";
import { useSubscription, FREE_INSPECTION_LIMIT } from "@/contexts/SubscriptionContext";
import { ThemeMode } from "@/contexts/ThemeContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermissions,
  checkNotificationPermissions,
  sendTestNotification,
} from "@/utils/notifications";
import { shareUserManualPdf } from "@/utils/manualPdfGenerator";
import { exportAllData, importAllData } from "@/utils/backupUtils";

const ADMIN_EMAIL = "suporte@firesafeitm.com";

type HelpType = "question" | "comment" | "suggestion" | "bugReport" | "other";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { fullTheme, mode, setMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { inspections, refreshData } = useInspections();
  const { isPremium, activePlan, showPaywall } = useSubscription();
  const { user, isConfigured, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [generatingManual, setGeneratingManual] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    const settings = await getNotificationSettings();
    setNotificationsEnabled(settings.enabled);
    const permission = await checkNotificationPermissions();
    setHasPermission(permission);
  };

  const toggleLanguage = () => {
    setLanguage(language === "pt-BR" ? "en" : "pt-BR");
  };

  const handleThemeChange = (newMode: ThemeMode) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setMode(newMode);
  };

  const handleAbout = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setAboutModalVisible(true);
  };

  const handleHelp = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setHelpModalVisible(true);
  };

  const handleDownloadManual = async () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setGeneratingManual(true);
    try {
      const success = await shareUserManualPdf(language as "pt-BR" | "en");
      if (!success) {
        Alert.alert(
          language === "pt-BR" ? "Erro" : "Error",
          language === "pt-BR" 
            ? "Não foi possível gerar o manual. Tente novamente." 
            : "Could not generate the manual. Please try again."
        );
      }
    } catch (error) {
      console.error("Error generating manual:", error);
      Alert.alert(
        language === "pt-BR" ? "Erro" : "Error",
        language === "pt-BR" 
          ? "Ocorreu um erro ao gerar o manual." 
          : "An error occurred while generating the manual."
      );
    } finally {
      setGeneratingManual(false);
    }
  };

  const sendHelpRequest = async (type: HelpType) => {
    setHelpModalVisible(false);

    const subjectMap: Record<HelpType, string> = {
      question: t.profile.helpEmailSubjectQuestion,
      comment: t.profile.helpEmailSubjectComment,
      suggestion: t.profile.helpEmailSubjectSuggestion,
      bugReport: t.profile.helpEmailSubjectBugReport,
      other: t.profile.helpEmailSubjectOther,
    };

    const mailtoUrl = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subjectMap[type])}&body=${encodeURIComponent(t.profile.helpEmailBody)}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          language === "pt-BR" ? "E-mail não configurado" : "Email not configured",
          `${language === "pt-BR" ? "Entre em contato pelo e-mail:" : "Please contact us at:"} ${ADMIN_EMAIL}`
        );
      }
    } catch (error) {
      console.error("Error opening mail:", error);
      Alert.alert(
        language === "pt-BR" ? "E-mail não configurado" : "Email not configured",
        `${language === "pt-BR" ? "Entre em contato pelo e-mail:" : "Please contact us at:"} ${ADMIN_EMAIL}`
      );
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    if (value && !hasPermission) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          t.notifications.title,
          t.notifications.permissionRequired,
          [
            { text: t.common.cancel, style: "cancel" },
            Platform.OS !== "web"
              ? {
                  text: "Settings",
                  onPress: () => {
                    try {
                      Linking.openSettings();
                    } catch (error) {
                      console.error("Failed to open settings:", error);
                    }
                  },
                }
              : null,
          ].filter(Boolean) as any
        );
        return;
      }
      setHasPermission(true);
    }

    setNotificationsEnabled(value);
    await saveNotificationSettings({ enabled: value, reminderDaysBefore: 1 });

    if (value) {
      try {
        await sendTestNotification(language as "en" | "pt-BR");
      } catch (error) {
        console.error("Error sending test notification:", error);
      }
    }
  };

  const handleExportData = async () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setIsExporting(true);
    try {
      const result = await exportAllData();
      if (result.success) {
        Alert.alert(t.common.success, t.profile.exportSuccess);
      } else {
        Alert.alert(t.common.error, t.profile.exportError);
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert(t.common.error, t.profile.exportError);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    Alert.alert(
      t.profile.importConfirmTitle,
      t.profile.importConfirmMessage,
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text: t.common.confirm,
          style: "destructive",
          onPress: async () => {
            setIsImporting(true);
            try {
              const result = await importAllData();
              if (result.success && result.counts) {
                await refreshData();
                Alert.alert(
                  t.common.success,
                  `${t.profile.dataRestored}:\n` +
                  `${result.counts.inspections} ${language === "pt-BR" ? "inspeções" : "inspections"}\n` +
                  `${result.counts.companies} ${language === "pt-BR" ? "empresas" : "companies"}\n` +
                  `${result.counts.appUsers} ${language === "pt-BR" ? "inspetores" : "inspectors"}`
                );
              } else if (result.error === "cancelled") {
                // User cancelled, do nothing
              } else if (result.error === "invalid_format") {
                Alert.alert(t.common.error, t.profile.importInvalidFormat);
              } else {
                Alert.alert(t.common.error, t.profile.importError);
              }
            } catch (error) {
              console.error("Import error:", error);
              Alert.alert(t.common.error, t.profile.importError);
            } finally {
              setIsImporting(false);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    Alert.alert(
      "Sair da conta",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const version = Constants.expoConfig?.version || "1.0.0";

  return (
    <ThemedView style={styles.screen}>
      <ScreenHeader title={t.profile.title} subtitle={t.profile.eyebrow} />
      <ScreenScrollView>
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: fullTheme.colors.primary }]}>
          <Feather name="user" size={40} color="#FFFFFF" />
        </View>
        <Spacer height={Spacing.lg} />
        <ThemedText type="h2">{t.profile.inspector}</ThemedText>
        <ThemedText type="body" secondary>
          NFPA 25 Certified
        </ThemedText>
      </View>

      <Spacer height={Spacing["3xl"]} />

      <ThemedText type="h3" style={styles.sectionTitle}>
        {t.profile.certifications}
      </ThemedText>
      <Spacer height={Spacing.md} />
      <View style={[styles.certificationCard, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}>
        <View style={[styles.certBadge, { backgroundColor: `${fullTheme.colors.success}20` }]}>
          <Feather name="award" size={24} color={fullTheme.colors.success} />
        </View>
        <View style={styles.certInfo}>
          <ThemedText type="h4">NFPA 25 ITM</ThemedText>
          <ThemedText type="small" secondary>
            Fire Protection Systems
          </ThemedText>
        </View>
        <Feather name="check-circle" size={20} color={fullTheme.colors.success} />
      </View>

      <Spacer height={Spacing["3xl"]} />

      <ThemedText type="h3" style={styles.sectionTitle}>
        {t.profile.theme}
      </ThemedText>
      <Spacer height={Spacing.md} />

      <View style={[styles.settingsCard, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}>
        <ThemeOption
          icon="sun"
          label={t.profile.themeLight}
          selected={mode === "light"}
          onPress={() => handleThemeChange("light")}
        />
        <ThemeOption
          icon="moon"
          label={t.profile.themeDark}
          selected={mode === "dark"}
          onPress={() => handleThemeChange("dark")}
        />
        <ThemeOption
          icon="smartphone"
          label={t.profile.themeSystem}
          selected={mode === "system"}
          onPress={() => handleThemeChange("system")}
          isLast
        />
      </View>

      <Spacer height={Spacing["3xl"]} />

      <ThemedText type="h3" style={styles.sectionTitle}>
        Settings
      </ThemedText>
      <Spacer height={Spacing.md} />

      <View style={[styles.settingsCard, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}>
        <SettingsRow
          icon="globe"
          label={t.profile.language}
          value={language === "pt-BR" ? "Português (BR)" : "English"}
          onPress={toggleLanguage}
        />
        <SettingsRow
          icon="bell"
          label={t.notifications.title}
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: fullTheme.colors.border, true: fullTheme.colors.primary }}
              thumbColor={notificationsEnabled ? "#FFFFFF" : "#F4F4F4"}
            />
          }
        />
        <SettingsRow
          icon="calendar"
          label={language === "pt-BR" ? "Notificações e Calendário" : "Notifications & Calendar"}
          onPress={() => navigation.navigate("NotificationSettings")}
        />
        <SettingsRow
          icon="book-open"
          label={language === "pt-BR" ? "Manual do Usuário" : "User Manual"}
          value={generatingManual ? (language === "pt-BR" ? "Gerando..." : "Generating...") : undefined}
          onPress={generatingManual ? undefined : handleDownloadManual}
        />
        <SettingsRow
          icon="info"
          label={t.profile.about}
          onPress={handleAbout}
        />
        <SettingsRow
          icon="help-circle"
          label={t.profile.help}
          onPress={handleHelp}
          isLast
        />
      </View>

      <Spacer height={Spacing["3xl"]} />

      <ThemedText type="h3" style={styles.sectionTitle}>
        {t.subscription.sectionTitle}
      </ThemedText>
      <Spacer height={Spacing.md} />

      <View style={[styles.subscriptionCard, { backgroundColor: fullTheme.colors.cardBackground, borderColor: isPremium ? fullTheme.colors.success : fullTheme.colors.border }]}>
        <View style={styles.subscriptionTop}>
          <View style={[styles.subscriptionBadge, { backgroundColor: isPremium ? `${fullTheme.colors.success}20` : `${fullTheme.colors.primary}15` }]}>
            <Feather
              name={isPremium ? "star" : "lock"}
              size={20}
              color={isPremium ? fullTheme.colors.success : fullTheme.colors.primary}
            />
          </View>
          <View style={styles.subscriptionInfo}>
            <ThemedText type="h4">
              {isPremium
                ? (activePlan === "annual" ? t.subscription.annualPlan : t.subscription.monthlyPlan) + " — " + t.subscription.premiumPlan
                : t.subscription.freePlan}
            </ThemedText>
            <ThemedText type="small" secondary>
              {isPremium
                ? t.subscription.featureUnlimited
                : `${inspections.length}/${FREE_INSPECTION_LIMIT} ${t.subscription.usage}`}
            </ThemedText>
          </View>
          {!isPremium ? (
            <Pressable
              onPress={showPaywall}
              style={[styles.upgradeBtn, { backgroundColor: fullTheme.colors.primary }]}
            >
              <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "700" }}>
                {t.subscription.upgradeButton}
              </ThemedText>
            </Pressable>
          ) : null}
        </View>

        {!isPremium ? (
          <View style={[styles.usageBar, { backgroundColor: fullTheme.colors.border }]}>
            <View
              style={[
                styles.usageBarFill,
                {
                  backgroundColor: inspections.length >= FREE_INSPECTION_LIMIT ? fullTheme.colors.error : fullTheme.colors.primary,
                  width: `${Math.min((inspections.length / FREE_INSPECTION_LIMIT) * 100, 100)}%`,
                },
              ]}
            />
          </View>
        ) : null}
      </View>

      <Spacer height={Spacing["3xl"]} />

      <ThemedText type="h3" style={styles.sectionTitle}>
        {t.profile.backup}
      </ThemedText>
      <Spacer height={Spacing.md} />

      <View style={[styles.settingsCard, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}>
        <SettingsRow
          icon="upload"
          label={t.profile.exportData}
          value={isExporting ? t.profile.exporting : undefined}
          onPress={isExporting ? undefined : handleExportData}
        />
        <SettingsRow
          icon="download"
          label={t.profile.importData}
          value={isImporting ? t.profile.importing : undefined}
          onPress={isImporting ? undefined : handleImportData}
          isLast
        />
      </View>

      <Spacer height={Spacing["3xl"]} />

      {isConfigured && user ? (
        <>
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.signOutButton,
              {
                backgroundColor: `${fullTheme.colors.error}12`,
                borderColor: fullTheme.colors.error,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="log-out" size={18} color={fullTheme.colors.error} />
            <ThemedText type="body" style={[styles.signOutText, { color: fullTheme.colors.error }]}>
              Sair
            </ThemedText>
          </Pressable>
          <Spacer height={Spacing.md} />
          <ThemedText type="small" secondary style={styles.accountEmail}>
            {user.email}
          </ThemedText>
          <Spacer height={Spacing["3xl"]} />
        </>
      ) : null}

      <View style={styles.versionContainer}>
        <ThemedText type="small" secondary>
          {t.profile.version} {version}
        </ThemedText>
      </View>

      <Spacer height={Spacing["4xl"]} />

      <Modal
        visible={helpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setHelpModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: fullTheme.colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">{t.profile.help}</ThemedText>
              <Pressable onPress={() => setHelpModalVisible(false)} hitSlop={12}>
                <Feather name="x" size={24} color={fullTheme.colors.textSecondary} />
              </Pressable>
            </View>
            <ThemedText type="body" secondary style={styles.modalSubtitle}>
              {t.profile.helpSubtitle}
            </ThemedText>
            <Spacer height={Spacing.lg} />

            <HelpOption
              icon="help-circle"
              label={t.profile.helpQuestion}
              onPress={() => sendHelpRequest("question")}
            />
            <HelpOption
              icon="message-circle"
              label={t.profile.helpComment}
              onPress={() => sendHelpRequest("comment")}
            />
            <HelpOption
              icon="star"
              label={t.profile.helpSuggestion}
              onPress={() => sendHelpRequest("suggestion")}
            />
            <HelpOption
              icon="alert-triangle"
              label={t.profile.helpBugReport}
              onPress={() => sendHelpRequest("bugReport")}
            />
            <HelpOption
              icon="mail"
              label={t.profile.helpOther}
              onPress={() => sendHelpRequest("other")}
              isLast
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={aboutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setAboutModalVisible(false)}
          />
          <View style={[styles.aboutModalContent, { backgroundColor: fullTheme.colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">{t.profile.about}</ThemedText>
              <Pressable onPress={() => setAboutModalVisible(false)} hitSlop={12}>
                <Feather name="x" size={24} color={fullTheme.colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Spacer height={Spacing.xl} />

              <View style={styles.aboutLogoContainer}>
                <View style={[styles.aboutLogo, { backgroundColor: fullTheme.colors.primary }]}>
                  <Feather name="shield" size={40} color="#FFFFFF" />
                </View>
                <Spacer height={Spacing.md} />
                <ThemedText type="h2">FireSafe ITM</ThemedText>
                <ThemedText type="small" secondary>{t.profile.version} {version}</ThemedText>
              </View>

              <Spacer height={Spacing.xl} />

              <View style={[styles.aboutSection, { borderTopColor: fullTheme.colors.border }]}>
                <ThemedText type="body" style={styles.aboutText}>
                  {language === "pt-BR"
                    ? "O FireSafe ITM é um aplicativo completo para Inspeção, Teste e Manutenção de sistemas de proteção contra incêndio, desenvolvido em conformidade com as normas NFPA 25."
                    : "FireSafe ITM is a complete application for Inspection, Testing, and Maintenance of fire protection systems, developed in compliance with NFPA 25 standards."
                  }
                </ThemedText>

                <Spacer height={Spacing.lg} />

                <ThemedText type="h4">{language === "pt-BR" ? "Recursos Principais:" : "Key Features:"}</ThemedText>
                <Spacer height={Spacing.sm} />

                <View style={styles.featureList}>
                  <FeatureItem
                    icon="check-circle"
                    text={language === "pt-BR" ? "Sprinklers (Tubo Molhado, Seco, Pré-Ação)" : "Sprinklers (Wet Pipe, Dry Pipe, Preaction)"}
                  />
                  <FeatureItem
                    icon="activity"
                    text={language === "pt-BR" ? "Bombas de Incêndio (Semanal, Mensal, Anual)" : "Fire Pumps (Weekly, Monthly, Annual)"}
                  />
                  <FeatureItem
                    icon="droplet"
                    text={language === "pt-BR" ? "Hidrantes e Tubulação" : "Hydrants and Piping"}
                  />
                  <FeatureItem
                    icon="database"
                    text={language === "pt-BR" ? "Tanques e Reservatórios" : "Water Tanks"}
                  />
                  <FeatureItem
                    icon="file-text"
                    text={language === "pt-BR" ? "Relatórios PDF Profissionais" : "Professional PDF Reports"}
                  />
                  <FeatureItem
                    icon="camera"
                    text={language === "pt-BR" ? "Captura de Fotos e Assinaturas" : "Photo and Signature Capture"}
                  />
                  <FeatureItem
                    icon="bell"
                    text={language === "pt-BR" ? "Lembretes de Inspeções Programadas" : "Scheduled Inspection Reminders"}
                  />
                  <FeatureItem
                    icon="wifi-off"
                    text={language === "pt-BR" ? "Funciona 100% Offline" : "Works 100% Offline"}
                  />
                </View>

                <Spacer height={Spacing.lg} />

                <View style={[styles.complianceBadge, { backgroundColor: `${fullTheme.colors.success}15` }]}>
                  <Feather name="award" size={20} color={fullTheme.colors.success} />
                  <ThemedText type="body" style={{ color: fullTheme.colors.success, marginLeft: Spacing.sm, fontWeight: "600" }}>
                    {language === "pt-BR" ? "Conforme NFPA 25" : "NFPA 25 Compliant"}
                  </ThemedText>
                </View>
              </View>

              <Spacer height={Spacing.lg} />

              <Pressable
                style={[styles.aboutCloseButton, { backgroundColor: fullTheme.colors.primary }]}
                onPress={() => setAboutModalVisible(false)}
              >
                <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  {t.common.close || "OK"}
                </ThemedText>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
      </ScreenScrollView>
    </ThemedView>
  );
}

interface FeatureItemProps {
  icon: keyof typeof Feather.glyphMap;
  text: string;
}

function FeatureItem({ icon, text }: FeatureItemProps) {
  const { fullTheme } = useTheme();
  return (
    <View style={styles.featureItem}>
      <Feather name={icon} size={16} color={fullTheme.colors.primary} />
      <ThemedText type="small" style={{ marginLeft: Spacing.sm, flex: 1 }}>
        {text}
      </ThemedText>
    </View>
  );
}

interface SettingsRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
  rightElement?: React.ReactNode;
}

function SettingsRow({ icon, label, value, onPress, isLast, rightElement }: SettingsRowProps) {
  const { fullTheme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsRow,
        !isLast && styles.settingsRowBorder,
        { borderBottomColor: fullTheme.colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.settingsRowLeft}>
        <Feather name={icon} size={20} color={fullTheme.colors.textSecondary} />
        <ThemedText type="body" style={{ marginLeft: Spacing.md }}>
          {label}
        </ThemedText>
      </View>
      {rightElement ? (
        rightElement
      ) : (
        <View style={styles.settingsRowRight}>
          {value ? (
            <ThemedText type="small" secondary style={{ marginRight: Spacing.sm }}>
              {value}
            </ThemedText>
          ) : null}
          <Feather name="chevron-right" size={20} color={fullTheme.colors.textSecondary} />
        </View>
      )}
    </Pressable>
  );
}

interface ThemeOptionProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  selected: boolean;
  onPress: () => void;
  isLast?: boolean;
}

function ThemeOption({ icon, label, selected, onPress, isLast }: ThemeOptionProps) {
  const { fullTheme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsRow,
        !isLast && styles.settingsRowBorder,
        { borderBottomColor: fullTheme.colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.settingsRowLeft}>
        <Feather name={icon} size={20} color={fullTheme.colors.textSecondary} />
        <ThemedText type="body" style={{ marginLeft: Spacing.md }}>
          {label}
        </ThemedText>
      </View>
      <View style={[styles.radioOuter, { borderColor: selected ? fullTheme.colors.primary : fullTheme.colors.border }]}>
        {selected ? <View style={[styles.radioInner, { backgroundColor: fullTheme.colors.primary }]} /> : null}
      </View>
    </Pressable>
  );
}

interface HelpOptionProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}

function HelpOption({ icon, label, onPress, isLast }: HelpOptionProps) {
  const { fullTheme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.helpOption,
        !isLast && styles.helpOptionBorder,
        { borderBottomColor: fullTheme.colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.helpIconContainer, { backgroundColor: `${fullTheme.colors.primary}15` }]}>
        <Feather name={icon} size={20} color={fullTheme.colors.primary} />
      </View>
      <ThemedText type="body" style={{ marginLeft: Spacing.md, flex: 1 }}>
        {label}
      </ThemedText>
      <Feather name="chevron-right" size={20} color={fullTheme.colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    marginLeft: Spacing.sm,
  },
  certificationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  certBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  certInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  settingsCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
  },
  settingsRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsRowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  versionContainer: {
    alignItems: "center",
  },
  subscriptionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  subscriptionTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  subscriptionBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  subscriptionInfo: {
    flex: 1,
    gap: 2,
  },
  upgradeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  usageBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  usageBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalSubtitle: {
    marginTop: Spacing.xs,
  },
  helpOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  helpOptionBorder: {
    borderBottomWidth: 1,
  },
  helpIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  aboutModalContent: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "90%",
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  aboutLogoContainer: {
    alignItems: "center",
  },
  aboutLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  aboutSection: {
    borderTopWidth: 1,
    paddingTop: Spacing.lg,
  },
  aboutText: {
    lineHeight: 22,
    textAlign: "center",
  },
  featureList: {
    gap: Spacing.sm,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  complianceBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  aboutCloseButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  signOutText: {
    fontWeight: "600",
  },
  accountEmail: {
    textAlign: "center",
  },
});
