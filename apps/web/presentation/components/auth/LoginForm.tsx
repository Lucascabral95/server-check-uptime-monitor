"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { loginSchema, type LoginFormData } from '@/infraestructure/models/login.schema';

interface LoginFormProps {
  isLoading: boolean;
  onLogin: (email: string, password: string) => Promise<void>;
}

export function LoginForm({ isLoading, onLogin }: LoginFormProps) {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    await onLogin(data.email, data.password);
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleLogin)} className="auth-form">
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
            autoComplete="current-password"
          />
          {errors.password && <span className="error-message">{errors.password.message}</span>}
        </div>

        <button type="submit" className="submit-button" disabled={isLoading}>
          <span className="button-content">
            {isLoading ? (
              <>
                <span className="spinner" />
                Iniciando sesión...
              </>
            ) : (
              'Entrar'
            )}
          </span>
        </button>
      </form>
    </>
  );
}
