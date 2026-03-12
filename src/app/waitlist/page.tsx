"use client";

import { useTranslation } from "@/shared/lib/i18n";

export default function WaitlistPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          FOCUSTACK
        </h1>
        <p className="text-text-muted text-xs tracking-[2px] uppercase mb-8">
          {t("waitlist.subtitle")}
        </p>

        <div className="card">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-sm text-white font-semibold mb-2">
            {t("waitlist.title")}
          </h2>
          <p className="text-text-secondary text-xs mb-6">
            {t("waitlist.message")}
          </p>
          <a
            href="/login"
            className="text-xs text-accent-focustack hover:underline"
          >
            {t("waitlist.backToLogin")}
          </a>
        </div>
      </div>
    </div>
  );
}
