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

    // Rely solely on onAuthStateChange — getSession/getUser hang on client
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[FS] auth event:", event, session?.user?.email);
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? null });
        if (!loaded.current) {
          loaded.current = true;
          console.log("[FS] calling loadUserData...");
          try {
            await loadUserData(session.user.id);
            console.log("[FS] loadUserData completed");
          } catch (err) {
            console.error("[FS] loadUserData failed:", err);
          }
        }
      } else {
        setUser(null);
        loaded.current = false;
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return useAuthStore();
}
