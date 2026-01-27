"use client"

import { useRouter } from 'next/navigation';

import { AuthCard } from "@/presentation/components/auth/AuthCard";
import { LoginForm } from "@/presentation/components/auth/LoginForm";
import { useAuth } from '@/lib/hooks/useAuth';

const REDIRECTION_PATH = '/dashboard/home';

export default function LoginView() {
  const router = useRouter();
  const { error, isLoading, login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    router.push(REDIRECTION_PATH);
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
