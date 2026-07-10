import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { LoginException, LoginResponseUser } from '@/infraestructure/interfaces';

interface AuthState {
  // Estado
  isAuthenticated: boolean;
  user: LoginResponseUser | null;
  error: LoginException | null;
  isLoading: boolean;

  // Actions
  setUser: (user: LoginResponseUser) => void;
  clearAuth: () => void;
  setError: (error: LoginException | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

// El store guarda identidad (quién está logueado), no credenciales: los JWT
// viven exclusivamente en cookies httpOnly (ver app/api/auth/session), fuera
// del alcance de JS. Nunca vuelvan a agregar `tokens` acá.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Estado inicial
      isAuthenticated: false,
      user: null,
      error: null,
      isLoading: false,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
          error: null,
        }),

      clearAuth: () =>
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        }),

      setError: (error) => set({ error }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
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
      }),
    }
  )
);
