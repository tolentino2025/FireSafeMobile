// FASE 2B — Empresa ativa, membros e convites (multiempresa).
// Fonte: Supabase (companies/company_members/company_invites) com RLS.
// Modelo escolhido: usuário cria uma empresa OU aceita um convite.
// Só faz sentido com login; sem Supabase/login fica inerte (app local-first).
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { supabase, isSupabaseConfigured } from "@/utils/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { scopedStorage } from "@/utils/scopedStorage";

export type CompanyRole = "owner" | "admin" | "supervisor" | "inspector" | "viewer";

export interface Company {
  id: string;
  name: string;
  cnpj: string | null;
}

export interface Membership {
  company_id: string;
  role: CompanyRole;
  status: string;
  company: Company | null;
}

export interface CompanyMember {
  id: string;
  user_id: string;
  role: CompanyRole;
  status: string;
}

export interface CompanyInvite {
  id: string;
  email: string;
  role: CompanyRole;
  status: string;
  expires_at: string;
}

interface CompanyContextType {
  isReady: boolean;
  memberships: Membership[];
  activeCompanyId: string | null;
  activeCompany: Company | null;
  myRole: CompanyRole | null;
  canManage: boolean; // owner/admin
  members: CompanyMember[];
  invites: CompanyInvite[];
  setActiveCompany: (companyId: string) => Promise<void>;
  createCompany: (name: string, cnpj?: string) => Promise<string>;
  acceptInvite: (token: string) => Promise<string>;
  inviteMember: (email: string, role: CompanyRole) => Promise<void>;
  revokeInvite: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);
const ACTIVE_COMPANY_KEY = "@firesafe_active_company";

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [invites, setInvites] = useState<CompanyInvite[]>([]);

  const activeCompany =
    memberships.find((m) => m.company_id === activeCompanyId)?.company ?? null;
  const myRole =
    memberships.find((m) => m.company_id === activeCompanyId)?.role ?? null;
  const canManage = myRole === "owner" || myRole === "admin";

  const loadMembersAndInvites = useCallback(
    async (companyId: string | null) => {
      if (!companyId || !isSupabaseConfigured) {
        setMembers([]);
        setInvites([]);
        return;
      }
      const [{ data: mem }, { data: inv }] = await Promise.all([
        supabase
          .from("company_members")
          .select("id,user_id,role,status")
          .eq("company_id", companyId),
        supabase
          .from("company_invites")
          .select("id,email,role,status,expires_at")
          .eq("company_id", companyId)
          .eq("status", "pending"),
      ]);
      setMembers((mem ?? []) as CompanyMember[]);
      setInvites((inv ?? []) as CompanyInvite[]);
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || !user?.id) {
      setMemberships([]);
      setActiveCompanyId(null);
      setMembers([]);
      setInvites([]);
      setIsReady(true);
      return;
    }
    try {
      const { data } = await supabase
        .from("company_members")
        .select("company_id,role,status,company:companies(id,name,cnpj)")
        .eq("user_id", user.id)
        .eq("status", "active");
      const list = (data ?? []).map((m: Record<string, unknown>) => ({
        company_id: m.company_id as string,
        role: m.role as CompanyRole,
        status: m.status as string,
        company: (Array.isArray(m.company) ? m.company[0] : m.company) as Company | null,
      })) as Membership[];
      setMemberships(list);

      // Resolve empresa ativa: salva localmente (por usuário) ou a primeira.
      const saved = await scopedStorage.getItem(ACTIVE_COMPANY_KEY, user.id);
      const valid = list.find((m) => m.company_id === saved)?.company_id;
      const next = valid ?? list[0]?.company_id ?? null;
      setActiveCompanyId(next);
      await loadMembersAndInvites(next);
    } catch (e) {
      console.warn("[company] refresh falhou:", e);
    } finally {
      setIsReady(true);
    }
  }, [user?.id, loadMembersAndInvites]);

  useEffect(() => {
    if (authLoading) return;
    setIsReady(false);
    refresh();
  }, [user?.id, authLoading, refresh]);

  const setActiveCompany = async (companyId: string) => {
    setActiveCompanyId(companyId);
    if (user?.id) await scopedStorage.setItem(ACTIVE_COMPANY_KEY, companyId, user.id);
    await loadMembersAndInvites(companyId);
  };

  const createCompany = async (name: string, cnpj?: string): Promise<string> => {
    const { data, error } = await supabase.rpc("create_company_with_owner", {
      p_name: name,
      p_cnpj: cnpj ?? null,
    });
    if (error) throw error;
    await refresh();
    if (data) await setActiveCompany(data as string);
    return data as string;
  };

  const acceptInvite = async (token: string): Promise<string> => {
    const { data, error } = await supabase.rpc("accept_company_invite", {
      p_token: token.trim(),
    });
    if (error) throw error;
    await refresh();
    if (data) await setActiveCompany(data as string);
    return data as string;
  };

  const inviteMember = async (email: string, role: CompanyRole) => {
    if (!activeCompanyId) throw new Error("Nenhuma empresa ativa");
    const { error } = await supabase.functions.invoke("invite-member", {
      body: { companyId: activeCompanyId, email: email.trim(), role },
    });
    if (error) throw error;
    await loadMembersAndInvites(activeCompanyId);
  };

  const revokeInvite = async (id: string) => {
    const { error } = await supabase
      .from("company_invites")
      .update({ status: "revoked" })
      .eq("id", id);
    if (error) throw error;
    await loadMembersAndInvites(activeCompanyId);
  };

  return (
    <CompanyContext.Provider
      value={{
        isReady,
        memberships,
        activeCompanyId,
        activeCompany,
        myRole,
        canManage,
        members,
        invites,
        setActiveCompany,
        createCompany,
        acceptInvite,
        inviteMember,
        revokeInvite,
        refresh,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany(): CompanyContextType {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
}
