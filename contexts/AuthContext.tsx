import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase";
import { setStorageScope } from "@/utils/scopedStorage";

const SUPABASE_CONFIGURED = Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL);

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(SUPABASE_CONFIGURED);

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

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!active) return;
        // Atualiza o escopo de armazenamento ANTES de propagar o novo usuário,
        // para que os contextos recarreguem já no escopo correto.
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
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err) {
      return { error: "Ocorreu um erro ao fazer login. Tente novamente." };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ error: string | null }> => {
    if (!SUPABASE_CONFIGURED) {
      return { error: "Supabase não configurado" };
    }

    try {
      const appUrl =
        process.env.EXPO_PUBLIC_APP_URL ?? "https://fire-safe-mobile.vercel.app";
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: appUrl,
        },
      });
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err) {
      return { error: "Ocorreu um erro ao criar a conta. Tente novamente." };
    }
  };

  const signOut = async (): Promise<void> => {
    if (!SUPABASE_CONFIGURED) {
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isConfigured: SUPABASE_CONFIGURED,
    signIn,
    signUp,
    signOut,
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
