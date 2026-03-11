import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            FOCUSTACK
          </h1>
          <p className="text-text-muted text-xs mt-2 tracking-[2px] uppercase">
            Un proyecto por dia. Deep focus.
          </p>
        </div>

        <div className="card">
          <h2 className="text-sm text-text-secondary font-medium mb-6 text-center">
            INICIAR SESION
          </h2>
          <GoogleSignInButton />
          <p className="text-text-dark text-xs text-center mt-4">
            Tus datos se sincronizan entre dispositivos
          </p>
        </div>
      </div>
    </div>
  );
}
