import type { Metadata } from "next";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { I18nProvider } from "@/shared/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Focustack — Deep Focus",
  description: "One project per day. Deep focus. Ship it.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg-primary">
        <I18nProvider>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
