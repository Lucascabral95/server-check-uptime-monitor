import { useCallback, useEffect, useRef } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

import { authService } from '@/infraestructure/services/auth.service';
import { LoginException } from '@/infraestructure/interfaces';
import { useAuthStore } from '@/lib/store/authStore';

export function useAuth(options?: { checkOnMount: boolean }) {
  const {
    isAuthenticated,
    user,
    tokens,
    error,
    isLoading,
    setUser,
    clearAuth,
    setError,
    setLoading,
    logout: storeLogout,
  } = useAuthStore();

  const hasChecked = useRef(false);

  const register = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      const result = await authService.register({ email, password });
      return result;
    } catch (err: unknown) {
      const authError = err as LoginException;
      setError(authError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      await authService.login({ email, password });

      const currentUser = await authService.getCurrentUser();
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString() || '';
      const idToken = session.tokens?.idToken?.toString() || '';

      setUser(currentUser, { accessToken, idToken });
    } catch (err: unknown) {
      const authError = err as LoginException;
      setError(authError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);

    try {
      await authService.logout();
      storeLogout();
    } catch (err) {
      console.error('Error al hacer logout:', err);
      storeLogout();
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = useCallback(async () => {
    setLoading(true);

    try {
      const currentUser = await authService.getCurrentUser();
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString() || '';
      const idToken = session.tokens?.idToken?.toString() || '';

      setUser(currentUser, { accessToken, idToken });
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [setUser, clearAuth, setLoading]);

  const confirmEmail = async (email: string, code: string) => {
    setError(null);
    setLoading(true);

    try {
      const result = await authService.confirmEmail({ email, code });
      return result;
    } catch (err: unknown) {
      const authError = err as LoginException;
      setError(authError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async (email: string) => {
    setError(null);
    setLoading(true);

    try {
      const result = await authService.resendConfirmationCode(email);
      return result;
    } catch (err: unknown) {
      const authError = err as LoginException;
      setError(authError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options?.checkOnMount !== false && !hasChecked.current) {
      hasChecked.current = true;
      checkAuthStatus();
    }
  }, [checkAuthStatus, options?.checkOnMount]);

  return {
    // Estado
    isAuthenticated,
    user,
    tokens,
    error,
    isLoading,

    // Acciones
    register,
    login,
    logout,
    checkAuthStatus,
    confirmEmail,
    resendCode,
  };
}
