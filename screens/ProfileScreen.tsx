import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Switch, Alert, Linking, Platform, Modal, Share, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
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

const ADMIN_EMAIL = "suporte@firesafeitm.com";

type HelpType = "question" | "comment" | "suggestion" | "bugReport" | "other";

export default function ProfileScreen() {
  const { fullTheme, mode, setMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [generatingManual, setGeneratingManual] = useState(false);

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

    const message = `${subjectMap[type]}\n\n${t.profile.helpEmailBody}\n\n${t.profile.helpContact}: ${ADMIN_EMAIL}`;

    try {
      await Share.share({
        message: message,
        title: subjectMap[type],
      });
    } catch (error) {
      console.error("Error sharing:", error);
      Linking.openURL(`mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subjectMap[type])}&body=${encodeURIComponent(t.profile.helpEmailBody)}`);
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

  const version = Constants.expoConfig?.version || "1.0.0";

  return (
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
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setHelpModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: fullTheme.colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">{t.profile.help}</ThemedText>
              <Pressable onPress={() => setHelpModalVisible(false)}>
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
        </Pressable>
      </Modal>

      <Modal
        visible={aboutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setAboutModalVisible(false)}
        >
          <View style={[styles.aboutModalContent, { backgroundColor: fullTheme.colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">{t.profile.about}</ThemedText>
              <Pressable onPress={() => setAboutModalVisible(false)}>
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
        </Pressable>
      </Modal>
    </ScreenScrollView>
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
  modalOverlay: {
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
});
