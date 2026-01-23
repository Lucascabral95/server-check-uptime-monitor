import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { LoginException, LoginResponseUser } from '@/infraestructure/interfaces';

export interface AuthTokens {
  accessToken: string;
  idToken: string;
}

interface AuthState {
  // Estado
  isAuthenticated: boolean;
  user: LoginResponseUser | null;
  tokens: AuthTokens | null;
  error: LoginException | null;
  isLoading: boolean;

  // Actions
  setUser: (user: LoginResponseUser, tokens: AuthTokens) => void;
  clearAuth: () => void;
  setError: (error: LoginException | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Estado inicial
      isAuthenticated: false,
      user: null,
      tokens: null,
      error: null,
      isLoading: false,

      // Actions
      setUser: (user, tokens) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
          error: null,
        }),

      clearAuth: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
        }),

      setError: (error) => set({ error }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        tokens: state.tokens,
      }),
    }
  )
);
