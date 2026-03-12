"use client";

import { createClient } from "@/lib/supabase/client";

export async function signOut() {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch (e) {
    console.error("Sign out error:", e);
  }
  window.location.href = "/login";
}
