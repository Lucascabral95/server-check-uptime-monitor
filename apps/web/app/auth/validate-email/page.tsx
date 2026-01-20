"use client"

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthCard } from "@/presentation/components/auth/AuthCard";
import { ValidateEmailForm } from "@/presentation/components/auth/ValidateEmailForm";
import { useAuth } from '@/lib/hooks/useAuth';

function ValidateEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { error, isLoading, confirmEmail, resendCode } = useAuth();

  const email = searchParams.get('email') || '';

  const handleConfirm = async (code: string) => {
    try {
      const result = await confirmEmail(email, code);

      if (result.isComplete === true || result.isComplete === undefined) {
        router.push('/auth/login?verified=true&email=' + encodeURIComponent(email));
      }
    } catch {
      // El error ya se maneja en el hook/store
    }
  };

  const handleResend = async () => {
    try {
      await resendCode(email);
    } catch {
      // El error ya se maneja en el hook/store
    }
  };

  return (
    <AuthCard
      title="Verificar email"
      subtitle="Ingresá el código de 6 dígitos que enviamos a tu correo"
      footerText="¿Ya tenés tu cuenta verificada?"
      footerLink="/auth/login"
      footerLinkText="Iniciá sesión"
      error={error}
      errorTitle="Error de verificación"
    >
      <ValidateEmailForm
        email={email}
        error={error}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onResendCode={handleResend}
      />
    </AuthCard>
  );
}

export default function ValidateEmail() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ValidateEmailContent />
    </Suspense>
  );
}