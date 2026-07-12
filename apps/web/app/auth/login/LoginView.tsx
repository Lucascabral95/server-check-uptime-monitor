"use client"

import { AuthCard } from "@/presentation/components/auth/AuthCard";
import { LoginForm } from "@/presentation/components/auth/LoginForm";
import { useAuth } from '@/lib/hooks/useAuth';

const REDIRECTION_PATH = '/dashboard/home';

export default function LoginView() {
  const { error, isLoading, login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    // Hard navigation a propósito: el Link del logo (a /dashboard/home) se
    // prefetchea mientras el usuario todavía no está autenticado, y ese
    // prefetch queda cacheado por el router cliente de Next.js con el
    // redirect del middleware hacia /auth/login. Un router.push() reutiliza
    // ese resultado stale y rebota de vuelta al login pese a que la cookie de
    // sesión ya es válida. La navegación dura fuerza que el middleware se
    // vuelva a evaluar contra el cookie real.
    window.location.href = REDIRECTION_PATH;
  };

  return (
    <AuthCard
      title="Iniciar sesión"
      subtitle="Ingresá tus credenciales para acceder"
      footerText="¿No tenés cuenta?"
      footerLink="/auth/register"
      footerLinkText="Registrate"
      error={error}
      errorTitle="Error de inicio de sesión"
    >
      <LoginForm
        isLoading={isLoading}
        onLogin={handleLogin}
      />
    </AuthCard>
  );
}
