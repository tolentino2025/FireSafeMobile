import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase";
import { setStorageScope } from "@/utils/scopedStorage";

const SUPABASE_CONFIGURED = Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL);

// URL de produção para redirecionamento pós-autenticação.
// Deve coincidir exatamente com o "Site URL" e a lista de "Redirect URLs"
// configurados em Supabase Dashboard → Authentication → URL Configuration.
// ⚠️  Se esse valor não estiver na lista do Supabase, o redirect_to do e-mail
//     será ignorado e cairá no "Site URL" cadastrado lá (ex: localhost).
const APP_URL =
  process.env.EXPO_PUBLIC_APP_URL ?? "https://fire-safe-mobile.vercel.app";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  isPasswordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(SUPABASE_CONFIGURED);
  // true quando o SDK detecta um link de recuperação de senha (evento PASSWORD_RECOVERY).
  // Enquanto true, o app mostra o formulário de nova senha em vez do app principal.
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) {
      return;
    }

    let active = true;
    const finishLoading = () => {
      if (active) {
        setIsLoading(false);
      }
    };

    // Restore session on mount.
    // IMPORTANTE: nunca deixar o app preso na splash. Se getSession() travar
    // ou rejeitar (rede instável, sessão corrompida, locks do navegador no
    // ambiente web/headless), o isLoading precisa ser resolvido mesmo assim.
    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession } }) => {
        if (!active) return;
        setStorageScope(currentSession?.user?.id ?? null);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      })
      .catch((err) => {
        console.warn("[Auth] getSession falhou:", err);
      })
      .finally(finishLoading);

    // Fallback de segurança: garante que o app saia da splash em no máximo 8s,
    // mesmo que getSession() nunca resolva.
    const splashTimeout = setTimeout(finishLoading, 8_000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!active) return;

        if (event === "PASSWORD_RECOVERY") {
          // O SDK parseou o token de recuperação da URL.
          // Mantém o usuário na tela de redefinição de senha.
          setIsPasswordRecovery(true);
          setStorageScope(newSession?.user?.id ?? null);
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setIsLoading(false);
          return;
        }

        if (event === "USER_UPDATED") {
          // Senha foi atualizada com sucesso → sai do modo de recuperação.
          setIsPasswordRecovery(false);
        }

        setStorageScope(newSession?.user?.id ?? null);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      active = false;
      clearTimeout(splashTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!SUPABASE_CONFIGURED) {
      return { error: "Supabase não configurado" };
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { error: null };
    } catch {
      return { error: "Ocorreu um erro ao fazer login. Tente novamente." };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ error: string | null }> => {
    if (!SUPABASE_CONFIGURED) {
      return { error: "Supabase não configurado" };
    }
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: APP_URL,
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch {
      return { error: "Ocorreu um erro ao criar a conta. Tente novamente." };
    }
  };

  const signOut = async (): Promise<void> => {
    if (!SUPABASE_CONFIGURED) return;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    if (!SUPABASE_CONFIGURED) return { error: "Supabase não configurado" };
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: APP_URL,
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch {
      return { error: "Ocorreu um erro. Tente novamente." };
    }
  };

  // Atualiza a senha do usuário após ele chegar via link de recuperação.
  // Só funciona enquanto há uma sessão de recuperação ativa (isPasswordRecovery === true).
  const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
    if (!SUPABASE_CONFIGURED) return { error: "Supabase não configurado" };
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: error.message };
      // USER_UPDATED já limpa isPasswordRecovery via onAuthStateChange,
      // mas zeramos aqui também para garantir responsividade imediata.
      setIsPasswordRecovery(false);
      return { error: null };
    } catch {
      return { error: "Ocorreu um erro ao atualizar a senha. Tente novamente." };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isConfigured: SUPABASE_CONFIGURED,
    isPasswordRecovery,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
