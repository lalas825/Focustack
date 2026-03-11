"use client";

import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton() {
  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full py-3 px-4 rounded-lg border text-sm font-semibold transition-all hover:opacity-90"
      style={{
        borderColor: "#7B68EE40",
        backgroundColor: "#7B68EE12",
        color: "#7B68EE",
      }}
    >
      Continuar con Google
    </button>
  );
}
