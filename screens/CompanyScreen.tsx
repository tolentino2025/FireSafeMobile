import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";

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

const INVITE_ROLES: CompanyRole[] = ["admin", "supervisor", "inspector", "viewer"];

export default function CompanyScreen() {
  const { fullTheme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const pt = language === "pt-BR";
  const {
    isReady, memberships, activeCompany, activeCompanyId, myRole, canManage,
    members, invites, setActiveCompany, createCompany, acceptInvite,
    inviteMember, revokeInvite,
  } = useCompany();

  const [busy, setBusy] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCnpj, setNewCnpj] = useState("");
  const [token, setToken] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<CompanyRole>("inspector");

  const c = fullTheme.colors;

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ScreenHeader title={pt ? "Empresa / Equipe" : "Company / Team"} subtitle="ITM" />
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
      if (!newName.trim()) { showAlert(pt ? "Atenção" : "Attention", pt ? "Informe o nome da empresa." : "Enter the company name."); return; }
      await createCompany(newName.trim(), newCnpj.trim() || undefined);
      setNewName(""); setNewCnpj("");
      showAlert(pt ? "Empresa criada" : "Company created", pt ? "Você é o proprietário." : "You are the owner.");
    });

  const handleAccept = () =>
    run(async () => {
      if (!token.trim()) { showAlert(pt ? "Atenção" : "Attention", pt ? "Cole o código do convite." : "Paste the invite code."); return; }
      await acceptInvite(token.trim());
      setToken("");
      showAlert(pt ? "Convite aceito" : "Invite accepted", pt ? "Você entrou na empresa." : "You joined the company.");
    });

  const handleInvite = () =>
    run(async () => {
      if (!inviteEmail.trim()) { showAlert(pt ? "Atenção" : "Attention", pt ? "Informe o e-mail." : "Enter the email."); return; }
      await inviteMember(inviteEmail.trim(), inviteRole);
      setInviteEmail("");
      showAlert(pt ? "Convite enviado" : "Invite sent", pt ? "Um e-mail foi enviado ao convidado." : "An email was sent to the invitee.");
    });

  const handleRevoke = (id: string) =>
    showConfirm(
      pt ? "Revogar convite?" : "Revoke invite?", undefined,
      () => run(() => revokeInvite(id)), { destructive: true },
    );

  const field = (placeholder: string, value: string, onChange: (s: string) => void, extra?: object) => (
    <TextInput
      style={[styles.input, { backgroundColor: c.inputBackground, borderColor: c.border, color: c.textPrimary }]}
      placeholder={placeholder}
      placeholderTextColor={c.placeholder}
      value={value}
      onChangeText={onChange}
      {...extra}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title={pt ? "Empresa / Equipe" : "Company / Team"} subtitle="ITM · multiempresa" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!isReady ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: Spacing.xl }} />
        ) : (
          <>
            {/* Empresa ativa + troca */}
            {activeCompany ? (
              <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                <ThemedText type="small" secondary>{pt ? "Empresa ativa" : "Active company"}</ThemedText>
                <ThemedText type="h3" style={{ marginTop: 2 }}>{activeCompany.name}</ThemedText>
                {activeCompany.cnpj ? <ThemedText type="small" secondary mono>{activeCompany.cnpj}</ThemedText> : null}
                <ThemedText type="small" secondary style={{ marginTop: 6 }}>
                  {pt ? "Seu papel" : "Your role"}: <ThemedText type="small" style={{ fontWeight: "700" }}>{myRole}</ThemedText>
                </ThemedText>
              </View>
            ) : null}

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

            {/* Sem empresa → criar / aceitar */}
            {memberships.length === 0 ? (
              <>
                <ThemedText type="h4" style={styles.section}>{pt ? "Criar empresa" : "Create company"}</ThemedText>
                {field(pt ? "Nome da empresa" : "Company name", newName, setNewName)}
                {field("CNPJ (opcional)", newCnpj, setNewCnpj)}
                <Button onPress={handleCreate} disabled={busy} style={{ marginTop: Spacing.sm }}>
                  {busy ? "..." : pt ? "Criar empresa" : "Create company"}
                </Button>

                <ThemedText type="h4" style={styles.section}>{pt ? "Tenho um convite" : "I have an invite"}</ThemedText>
                {field(pt ? "Cole o código do convite" : "Paste invite code", token, setToken, { autoCapitalize: "none" })}
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
                  <View key={m.id} style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}>
                    <Feather name="user" size={16} color={c.textSecondary} />
                    <ThemedText type="small" style={{ flex: 1, marginLeft: Spacing.sm }} numberOfLines={1}>
                      {m.user_id === user.id ? (pt ? "Você" : "You") : `${m.user_id.slice(0, 8)}…`}
                    </ThemedText>
                    <ThemedText type="small" secondary style={{ fontWeight: "700" }}>{m.role}</ThemedText>
                  </View>
                ))}
              </>
            ) : null}

            {/* Convites pendentes + enviar (admin/owner) */}
            {activeCompany && canManage ? (
              <>
                <ThemedText type="h4" style={styles.section}>{pt ? "Convidar membro" : "Invite member"}</ThemedText>
                {field("email@empresa.com", inviteEmail, setInviteEmail, { keyboardType: "email-address", autoCapitalize: "none" })}
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
                      <View key={inv.id} style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}>
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
  content: { padding: Spacing.lg, paddingBottom: Spacing["5xl"] },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.xl },
  section: { marginTop: Spacing.xl, marginBottom: Spacing.sm },
  card: { padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1 },
  input: {
    borderWidth: 1, borderRadius: 12, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    fontSize: 14, marginBottom: Spacing.sm,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginTop: Spacing.xs },
  chip: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: 11, borderWidth: 1 },
  row: {
    flexDirection: "row", alignItems: "center", padding: Spacing.md,
    borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.sm,
  },
});
