"use client"

import { useRouter } from 'next/navigation';
import { useForm, watch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoginException } from '@/infraestructure/interfaces';
import { registerSchema, type RegisterFormData, getPasswordRequirements } from '@/infraestructure/models/register.schema';
import { PasswordRequirementsIndicator } from './PasswordRequirementsIndicator';
import './PasswordRequirements.scss';

interface RegisterFormProps {
  error: LoginException | null;
  isLoading: boolean;
  onRegister: (email: string, password: string) => Promise<void>;
}

export function RegisterForm({ error, isLoading, onRegister }: RegisterFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const handleRegister = async (data: RegisterFormData) => {
    await onRegister(data.email, data.password);
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleRegister)} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="tu@email.com"
            {...register('email')}
            className={errors.email ? 'input-error' : ''}
            autoComplete="email"
          />
          {errors.email && <span className="error-message">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="•••••••••"
            {...register('password')}
            className={errors.password ? 'input-error' : ''}
            autoComplete="new-password"
          />
          {errors.password && <span className="error-message">{errors.password.message}</span>}
          {password && <PasswordRequirementsIndicator password={password} />}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'input-error' : ''}
            autoComplete="new-password"
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword.message}</span>}
        </div>

        <button type="submit" className="submit-button" disabled={isLoading}>
          <span className="button-content">
            {isLoading ? (
              <>
                <span className="spinner" />
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </span>
        </button>
      </form>
    </>
  );
}
