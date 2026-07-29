import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<ReturnType<typeof supabase.auth.signUp>>;
  signIn: (email: string, password: string) => Promise<ReturnType<typeof supabase.auth.signInWithPassword>>;
  signOut: () => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<ReturnType<typeof supabase.auth.signInWithOAuth>>;
  displayName: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initialiseAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    void initialiseAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, nextSession: Session | null) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const signUp = async (email: string, password: string, fullName?: string) =>
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || "",
          },
        },
      });

    const signIn = async (email: string, password: string) =>
      supabase.auth.signInWithPassword({
        email,
        password,
      });

    const signOut = async () => {
      const { error } = await supabase.auth.signOut();
      return { error };
    };

    const signInWithGoogle = async () =>
      supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

    const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || null;

    return {
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      signInWithGoogle,
      displayName,
    };
  }, [loading, session, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
