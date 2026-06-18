import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany, type CompanyRole } from "@/contexts/CompanyContext";
import { showAlert, showConfirm } from "@/utils/appAlert";
import { Spacing, BorderRadius } from "@/constants/theme";
import { toUpperIfNotEmail } from "@/utils/textTransform";

const INVITE_ROLES: CompanyRole[] = ["admin", "supervisor", "inspector", "viewer"];

export default function CompanyScreen() {
  const { fullTheme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  const pt = language === "pt-BR";
  const {
    isReady, memberships, activeCompany, activeCompanyId, myRole, canManage,
    members, invites, setActiveCompany, createCompany, acceptInvite,
    inviteMember, revokeInvite,
  } = useCompany();

  const [busy, setBusy] = useState(false);

  // Campos do formulário de criar empresa
  const [newName, setNewName] = useState("");
  const [newCnpj, setNewCnpj] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newZipCode, setNewZipCode] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");

  const [token, setToken] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<CompanyRole>("inspector");

  const c = fullTheme.colors;

  const inputStyle = [
    styles.input,
    { backgroundColor: c.inputBackground, borderColor: c.border, color: c.textPrimary },
  ];

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ScreenHeader
          title={pt ? "Empresa / Equipe" : "Company / Team"}
          subtitle="ITM · MULTIEMPRESA"
          left={
            <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
              <Feather name="chevron-left" size={26} color={c.textPrimary} />
            </Pressable>
          }
        />
        <View style={styles.center}>
          <Feather name="lock" size={32} color={c.textSecondary} />
          <ThemedText type="body" secondary style={{ marginTop: Spacing.md, textAlign: "center" }}>
            {pt ? "Faça login para gerenciar sua empresa e equipe." : "Sign in to manage your company and team."}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } catch (e: unknown) {
      showAlert(pt ? "Erro" : "Error", e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  };

  const handleCreate = () =>
    run(async () => {
      if (!newName.trim()) {
        showAlert(pt ? "Atenção" : "Attention", pt ? "Informe o nome da empresa." : "Enter the company name.");
        return;
      }
      await createCompany(newName.trim(), newCnpj.trim() || undefined, {
        address: newAddress.trim() || undefined,
        city: newCity.trim() || undefined,
        state: newState.trim() || undefined,
        zipCode: newZipCode.trim() || undefined,
        contactName: newContactName.trim() || undefined,
        contactPhone: newContactPhone.trim() || undefined,
        contactEmail: newContactEmail.trim() || undefined,
      });
      setNewName(""); setNewCnpj(""); setNewAddress(""); setNewCity("");
      setNewState(""); setNewZipCode(""); setNewContactName("");
      setNewContactPhone(""); setNewContactEmail("");
      showAlert(pt ? "Empresa criada" : "Company created", pt ? "Você é o proprietário." : "You are the owner.");
    });

  const handleAccept = () =>
    run(async () => {
      if (!token.trim()) {
        showAlert(pt ? "Atenção" : "Attention", pt ? "Cole o código do convite." : "Paste the invite code.");
        return;
      }
      await acceptInvite(token.trim());
      setToken("");
      showAlert(pt ? "Convite aceito" : "Invite accepted", pt ? "Você entrou na empresa." : "You joined the company.");
    });

  const handleInvite = () =>
    run(async () => {
      if (!inviteEmail.trim()) {
        showAlert(pt ? "Atenção" : "Attention", pt ? "Informe o e-mail." : "Enter the email.");
        return;
      }
      await inviteMember(inviteEmail.trim(), inviteRole);
      setInviteEmail("");
      showAlert(pt ? "Convite enviado" : "Invite sent", pt ? "Um e-mail foi enviado ao convidado." : "An email was sent to the invitee.");
    });

  const handleRevoke = (id: string) =>
    showConfirm(
      pt ? "Revogar convite?" : "Revoke invite?", undefined,
      () => run(() => revokeInvite(id)), { destructive: true },
    );

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader
        title={pt ? "Empresa / Equipe" : "Company / Team"}
        subtitle="ITM · MULTIEMPRESA"
        left={
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Feather name="chevron-left" size={26} color={c.textPrimary} />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {!isReady ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: Spacing.xl }} />
        ) : (
          <>
            {/* Empresa ativa */}
            {activeCompany ? (
              <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                <ThemedText type="small" secondary>{pt ? "Empresa ativa" : "Active company"}</ThemedText>
                <ThemedText type="h3" style={{ marginTop: 2 }}>{activeCompany.name}</ThemedText>
                {activeCompany.cnpj ? <ThemedText type="small" secondary mono>{activeCompany.cnpj}</ThemedText> : null}
                {activeCompany.city || activeCompany.state ? (
                  <ThemedText type="small" secondary style={{ marginTop: 4 }}>
                    {[activeCompany.city, activeCompany.state].filter(Boolean).join(", ")}
                  </ThemedText>
                ) : null}
                <ThemedText type="small" secondary style={{ marginTop: 6 }}>
                  {pt ? "Seu papel" : "Your role"}: <ThemedText type="small" style={{ fontWeight: "700" }}>{myRole}</ThemedText>
                </ThemedText>
              </View>
            ) : null}

            {/* Trocar empresa */}
            {memberships.length > 1 ? (
              <>
                <ThemedText type="h4" style={styles.section}>{pt ? "Trocar empresa" : "Switch company"}</ThemedText>
                <View style={styles.chips}>
                  {memberships.map((m) => {
                    const active = m.company_id === activeCompanyId;
                    return (
                      <Pressable key={m.company_id} onPress={() => run(() => setActiveCompany(m.company_id))}
                        style={[styles.chip, { backgroundColor: active ? c.primary : c.surface, borderColor: active ? c.primary : c.border }]}>
                        <ThemedText type="small" style={{ color: active ? "#fff" : c.textPrimary, fontWeight: "600" }}>
                          {m.company?.name ?? m.company_id.slice(0, 6)}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            {/* Formulário completo de criar empresa */}
            {memberships.length === 0 ? (
              <>
                <ThemedText type="h4" style={styles.section}>{pt ? "Criar empresa" : "Create company"}</ThemedText>

                <ThemedText type="h3" style={styles.label}>{pt ? "Nome da Empresa" : "Company Name"}</ThemedText>
                <TextInput
                  style={inputStyle}
                  placeholder={pt ? "Nome da Empresa" : "Company Name"}
                  placeholderTextColor={c.placeholder}
                  value={newName}
                  onChangeText={(t) => setNewName(toUpperIfNotEmail(t, "name"))}
                  autoCapitalize="characters"
                />

                <ThemedText type="h3" style={styles.label}>CNPJ</ThemedText>
                <TextInput
                  style={inputStyle}
                  placeholder="00.000.000/0000-00"
                  placeholderTextColor={c.placeholder}
                  value={newCnpj}
                  onChangeText={setNewCnpj}
                  keyboardType="numeric"
                />

                <ThemedText type="h3" style={styles.label}>{pt ? "Endereço" : "Address"}</ThemedText>
                <TextInput
                  style={inputStyle}
                  placeholder={pt ? "Rua, número" : "Street, number"}
                  placeholderTextColor={c.placeholder}
                  value={newAddress}
                  onChangeText={(t) => setNewAddress(toUpperIfNotEmail(t, "address"))}
                  autoCapitalize="characters"
                />

                <View style={styles.row}>
                  <View style={styles.half}>
                    <ThemedText type="h3" style={styles.label}>{pt ? "Cidade" : "City"}</ThemedText>
                    <TextInput
                      style={inputStyle}
                      placeholder={pt ? "Cidade" : "City"}
                      placeholderTextColor={c.placeholder}
                      value={newCity}
                      onChangeText={(t) => setNewCity(toUpperIfNotEmail(t, "city"))}
                      autoCapitalize="characters"
                    />
                  </View>
                  <View style={styles.half}>
                    <ThemedText type="h3" style={styles.label}>{pt ? "Estado" : "State"}</ThemedText>
                    <TextInput
                      style={inputStyle}
                      placeholder="UF"
                      placeholderTextColor={c.placeholder}
                      value={newState}
                      onChangeText={(t) => setNewState(toUpperIfNotEmail(t, "state"))}
                      maxLength={2}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                <ThemedText type="h3" style={styles.label}>CEP</ThemedText>
                <TextInput
                  style={inputStyle}
                  placeholder="00000-000"
                  placeholderTextColor={c.placeholder}
                  value={newZipCode}
                  onChangeText={setNewZipCode}
                  keyboardType="numeric"
                />

                <ThemedText type="h2" style={[styles.section, { marginTop: Spacing.xl }]}>
                  {pt ? "Dados do Contato" : "Contact Info"}
                </ThemedText>

                <ThemedText type="h3" style={styles.label}>{pt ? "Nome do Contato" : "Contact Name"}</ThemedText>
                <TextInput
                  style={inputStyle}
                  placeholder={pt ? "Nome do Contato" : "Contact Name"}
                  placeholderTextColor={c.placeholder}
                  value={newContactName}
                  onChangeText={(t) => setNewContactName(toUpperIfNotEmail(t, "contactName"))}
                  autoCapitalize="characters"
                />

                <View style={styles.row}>
                  <View style={styles.half}>
                    <ThemedText type="h3" style={styles.label}>{pt ? "Telefone" : "Phone"}</ThemedText>
                    <TextInput
                      style={inputStyle}
                      placeholder={pt ? "Telefone" : "Phone"}
                      placeholderTextColor={c.placeholder}
                      value={newContactPhone}
                      onChangeText={setNewContactPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={styles.half}>
                    <ThemedText type="h3" style={styles.label}>Email</ThemedText>
                    <TextInput
                      style={inputStyle}
                      placeholder="email@empresa.com"
                      placeholderTextColor={c.placeholder}
                      value={newContactEmail}
                      onChangeText={(t) => setNewContactEmail(toUpperIfNotEmail(t, "email"))}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <Button onPress={handleCreate} disabled={busy} style={{ marginTop: Spacing.md }}>
                  {busy ? "..." : pt ? "Criar empresa" : "Create company"}
                </Button>

                <ThemedText type="h4" style={styles.section}>{pt ? "Tenho um convite" : "I have an invite"}</ThemedText>
                <TextInput
                  style={inputStyle}
                  placeholder={pt ? "Cole o código do convite" : "Paste invite code"}
                  placeholderTextColor={c.placeholder}
                  value={token}
                  onChangeText={setToken}
                  autoCapitalize="none"
                />
                <Button onPress={handleAccept} disabled={busy} variant="secondary" style={{ marginTop: Spacing.sm }}>
                  {busy ? "..." : pt ? "Aceitar convite" : "Accept invite"}
                </Button>
              </>
            ) : null}

            {/* Membros */}
            {activeCompany ? (
              <>
                <ThemedText type="h4" style={styles.section}>{pt ? "Membros" : "Members"} ({members.length})</ThemedText>
                {members.map((m) => (
                  <View key={m.id} style={[styles.memberRow, { backgroundColor: c.surface, borderColor: c.border }]}>
                    <Feather name="user" size={16} color={c.textSecondary} />
                    <ThemedText type="small" style={{ flex: 1, marginLeft: Spacing.sm }} numberOfLines={1}>
                      {m.user_id === user.id ? (pt ? "Você" : "You") : `${m.user_id.slice(0, 8)}…`}
                    </ThemedText>
                    <ThemedText type="small" secondary style={{ fontWeight: "700" }}>{m.role}</ThemedText>
                  </View>
                ))}
              </>
            ) : null}

            {/* Convidar membro (admin/owner) */}
            {activeCompany && canManage ? (
              <>
                <ThemedText type="h4" style={styles.section}>{pt ? "Convidar membro" : "Invite member"}</ThemedText>
                <TextInput
                  style={inputStyle}
                  placeholder="email@empresa.com"
                  placeholderTextColor={c.placeholder}
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <View style={styles.chips}>
                  {INVITE_ROLES.map((r) => {
                    const active = inviteRole === r;
                    return (
                      <Pressable key={r} onPress={() => setInviteRole(r)}
                        style={[styles.chip, { backgroundColor: active ? c.primary : c.surface, borderColor: active ? c.primary : c.border }]}>
                        <ThemedText type="small" style={{ color: active ? "#fff" : c.textPrimary, fontWeight: "600" }}>{r}</ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
                <Button onPress={handleInvite} disabled={busy} style={{ marginTop: Spacing.sm }}>
                  {busy ? "..." : pt ? "Enviar convite" : "Send invite"}
                </Button>

                {invites.length > 0 ? (
                  <>
                    <ThemedText type="h4" style={styles.section}>{pt ? "Convites pendentes" : "Pending invites"}</ThemedText>
                    {invites.map((inv) => (
                      <View key={inv.id} style={[styles.memberRow, { backgroundColor: c.surface, borderColor: c.border }]}>
                        <Feather name="mail" size={16} color={c.textSecondary} />
                        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                          <ThemedText type="small" numberOfLines={1}>{inv.email}</ThemedText>
                          <ThemedText type="small" secondary>{inv.role}</ThemedText>
                        </View>
                        <Pressable onPress={() => handleRevoke(inv.id)} hitSlop={8}>
                          <Feather name="x-circle" size={18} color={c.error} />
                        </Pressable>
                      </View>
                    ))}
                  </>
                ) : null}
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.xl },
  section: { marginTop: Spacing.xl, marginBottom: Spacing.sm },
  label: { marginBottom: Spacing.sm },
  card: { padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1 },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    marginBottom: Spacing.sm,
  },
  row: { flexDirection: "row", gap: Spacing.md },
  half: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginTop: Spacing.xs },
  chip: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: 11, borderWidth: 1 },
  memberRow: {
    flexDirection: "row", alignItems: "center", padding: Spacing.md,
    borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.sm,
  },
});
