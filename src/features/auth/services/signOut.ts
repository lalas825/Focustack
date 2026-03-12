"use client";

import { createClient } from "@/lib/supabase/client";

export function signOut() {
  const supabase = createClient();
  supabase.auth.signOut().catch(console.error);
  window.location.href = "/login";
}
