import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // Check if user's email is on the allowlist
    if (data?.user?.email) {
      const { count } = await supabase
        .from("allowed_emails")
        .select("*", { count: "exact", head: true })
        .eq("email", data.user.email);

      if (!count || count === 0) {
        // Sign out the unauthorized user and redirect to waitlist
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/waitlist`);
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
