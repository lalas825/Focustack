import type { Metadata } from "next";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Focustack — Deep Focus",
  description: "Un proyecto por dia. Deep focus. Ship it.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-bg-primary">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
