"use client";

import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";
import { useTranslation } from "@/shared/lib/i18n";

export default function LoginPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            FOCUSTACK
          </h1>
          <p className="text-text-muted text-xs mt-2 tracking-[2px] uppercase">
            {t("login.subtitle")}
          </p>
        </div>

        <div className="card">
          <h2 className="text-sm text-text-secondary font-medium mb-6 text-center">
            {t("login.heading")}
          </h2>
          <GoogleSignInButton />
          <p className="text-text-dark text-xs text-center mt-4">
            {t("login.syncNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
