"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "../store";
import { loadUserData } from "../services/loadUserData";

export function useAuth() {
  const { setUser, setLoading } = useAuthStore();
  const loaded = useRef(false);

  useEffect(() => {
    console.log("[FS] step 1: useEffect fired");

    try {
      const supabase = createClient();
      console.log("[FS] step 2: client created");

      supabase.auth.getSession().then((res) => {
        console.log("[FS] step 3: getSession resolved", JSON.stringify(res?.data?.session?.user?.email));
        const session = res?.data?.session;
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
      }).catch((err) => {
        console.error("[FS] getSession rejected:", err);
        setLoading(false);
      });

      // Listen for auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("[FS] authStateChange:", event);
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
    } catch (err) {
      console.error("[FS] useAuth crashed:", err);
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return useAuthStore();
}
