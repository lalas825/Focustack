"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "../store";
import { loadUserData } from "../services/loadUserData";

export function useAuth() {
  const { setUser, setLoading } = useAuthStore();
  const loaded = useRef(false);

  useEffect(() => {
    console.log("[FS v2.2] useAuth effect running");
    const supabase = createClient();

    // Initial session check
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      console.log("[FS v2.2] getUser result:", { user: user?.email, error });
      if (user) {
        setUser({ id: user.id, email: user.email ?? null });
        if (!loaded.current) {
          loaded.current = true;
          loadUserData(user.id);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }).catch((err) => console.error("useAuth getUser failed:", err));

    // Listen for auth state changes (fresh logins only)
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
