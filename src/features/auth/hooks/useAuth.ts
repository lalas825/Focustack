"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "../store";
import { loadUserData } from "../services/loadUserData";

export function useAuth() {
  const { setUser, setLoading } = useAuthStore();
  const loaded = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    // Use getSession (local cookie read) instead of getUser (network call that hangs)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log("[FS] session:", { user: session?.user?.email, error });
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? null });
        if (!loaded.current) {
          loaded.current = true;
          loadUserData(session.user.id);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? null });
        if (event === "SIGNED_IN" && !loaded.current) {
          loaded.current = true;
          await loadUserData(session.user.id);
        }
      } else {
        setUser(null);
        loaded.current = false;
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return useAuthStore();
}
