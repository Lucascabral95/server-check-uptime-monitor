"use client"

import { useRouter } from 'next/navigation';

import { AuthCard } from "@/presentation/components/auth/AuthCard";
import { RegisterForm } from "@/presentation/components/auth/RegisterForm";
import { useAuth } from '@/lib/hooks/useAuth';

export default function Register() {
  const router = useRouter();
  const { error, isLoading, register: registerUser } = useAuth();

  const handleRegister = async (email: string, password: string) => {
    const result = await registerUser(email, password);

    if (result.isComplete === true) {
      router.push('/auth/login?registered=true&email=' + encodeURIComponent(email));
    } else {
      router.push('/auth/validate-email?email=' + encodeURIComponent(email));
    }
  };

  return (
    <AuthCard
      title="Crear cuenta"
      subtitle="Registrate para comenzar a monitorear tus servidores"
      footerText="¿Ya tenés cuenta?"
      footerLink="/auth/login"
      footerLinkText="Iniciá sesión"
      error={error}
      errorTitle="Error de registro"
    >
      <RegisterForm
        error={error}
        isLoading={isLoading}
        onRegister={handleRegister}
      />
    </AuthCard>
  );
}
