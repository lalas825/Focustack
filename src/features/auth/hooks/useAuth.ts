"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "../store";
import { loadUserData } from "../services/loadUserData";
import { resetAllStores } from "@/shared/lib/resetStores";

export function useAuth() {
  const { setUser, setLoading } = useAuthStore();
  const loaded = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? null });
        if (!loaded.current) {
          loaded.current = true;
          // setTimeout breaks out of the onAuthStateChange lock
          // so loadUserData's Supabase calls don't deadlock
          setTimeout(() => {
            loadUserData(session.user.id).catch(console.error);
          }, 0);
        }
      } else {
        setUser(null);
        loaded.current = false;
        resetAllStores();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return useAuthStore();
}
