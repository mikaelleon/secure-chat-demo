import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const {
        data: { session: initial },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(initial);
      setUser(initial?.user ?? null);
      if (initial?.user) {
        await fetchProfile(initial.user.id);
      }
      setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setUser(next?.user ?? null);
      if (next?.user) {
        void fetchProfile(next.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  async function signUp(email: string, password: string, displayName: string) {
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
  }

  async function signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signOut() {
    return supabase.auth.signOut();
  }

  async function updateProfile(displayName: string) {
    if (!user) return { error: "Not authenticated" as const };
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", user.id);
    if (!error) {
      setProfile((prev) => (prev ? { ...prev, display_name: displayName } : prev));
      return {};
    }
    return { error: error.message };
  }

  async function updatePassword(newPassword: string) {
    return supabase.auth.updateUser({ password: newPassword });
  }

  return {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updatePassword,
  };
}
