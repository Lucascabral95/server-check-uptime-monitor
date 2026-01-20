import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { fetchAuthSession } from 'aws-amplify/auth';

import { useAuth } from './useAuth';
import { useAuthStore } from '@/lib/store/authStore';
import { authService } from '@/infraestructure/services/auth.service';

vi.mock('@/infraestructure/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
    confirmEmail: vi.fn(),
    resendConfirmationCode: vi.fn(),
  },
}));

vi.mock('aws-amplify/auth', () => ({
  fetchAuthSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
  signUp: vi.fn(),
  confirmSignUp: vi.fn(),
  resendSignUpCode: vi.fn(),
}));

const mockUser = {
  username: 'test@example.com',
  userId: 'user-123',
  signInDetails: {
    loginId: 'test@example.com',
    authFlowType: 'USER_SRP_AUTH',
  },
};

const mockTokens = {
  accessToken: 'mock-access-token',
  idToken: 'mock-id-token',
};

describe('useAuth', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      tokens: null,
      error: null,
      isLoading: false,
    });

    (authService.login as any).mockResolvedValue(undefined);
    (authService.logout as any).mockResolvedValue(undefined);
    (authService.register as any).mockResolvedValue({
      isComplete: false,
      userId: mockUser.userId,
    });
    (authService.getCurrentUser as any).mockResolvedValue(mockUser);
    (authService.confirmEmail as any).mockResolvedValue({ isComplete: true });
    (authService.resendConfirmationCode as any).mockResolvedValue({
      destination: mockUser.username,
      deliveryMedium: 'EMAIL',
      attribute: 'email',
    });

    (fetchAuthSession as any).mockResolvedValue({
      tokens: {
        accessToken: { toString: () => mockTokens.accessToken },
        idToken: { toString: () => mockTokens.idToken },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      expect(result.current).toEqual({
        isAuthenticated: false,
        user: null,
        tokens: null,
        error: null,
        isLoading: false,
        register: expect.any(Function),
        login: expect.any(Function),
        logout: expect.any(Function),
        checkAuthStatus: expect.any(Function),
        confirmEmail: expect.any(Function),
        resendCode: expect.any(Function),
      });
    });

    it('should not check auth status on mount when checkOnMount is false', () => {
      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      expect(result.current.isLoading).toBe(false);
      expect(authService.getCurrentUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(authService.getCurrentUser).toHaveBeenCalled();

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.tokens).toEqual(mockTokens);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should set loading state during login', async () => {
      let resolveLogin: any;
      (authService.login as any).mockImplementation(() =>
        new Promise(resolve => { resolveLogin = resolve; })
      );

      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      act(() => {
        result.current.login('test@example.com', 'password123');
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveLogin();
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle login error correctly', async () => {
      const mockError = {
        name: 'NotAuthorizedException',
        message: 'Incorrect username or password.',
      };

      (authService.login as any).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      await act(async () => {
        await expect(
          result.current.login('test@example.com', 'wrong-password')
        ).rejects.toEqual(mockError);
      });

      expect(result.current.error).toEqual(mockError);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should clear previous error on new login attempt', async () => {
      const mockError = { name: 'SomeError', message: 'Previous error' };
      useAuthStore.setState({ error: mockError });

      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      expect(result.current.error).toEqual(mockError);

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('register', () => {
    it('should register successfully with valid credentials', async () => {
      const registerResponse = {
        isComplete: false,
        userId: mockUser.userId,
      };

      (authService.register as any).mockResolvedValue(registerResponse);

      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      let response;
      await act(async () => {
        response = await result.current.register('test@example.com', 'Password123!');
      });

      expect(authService.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(response).toEqual(registerResponse);
      expect(result.current.isLoading).toBe(false);
    });

    it('should set loading state during registration', async () => {
      let resolveRegister: any;
      (authService.register as any).mockImplementation(() =>
        new Promise(resolve => { resolveRegister = resolve; })
      );

      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      act(() => {
        result.current.register('test@example.com', 'Password123!');
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveRegister({ isComplete: false, userId: mockUser.userId });
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle registration errors', async () => {
      const mockError = {
        name: 'UsernameExistsException',
        message: 'El email ya está registrado.',
      };

      (authService.register as any).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      await act(async () => {
        await expect(
          result.current.register('existing@example.com', 'password123')
        ).rejects.toEqual(mockError);
      });

      expect(result.current.error).toEqual(mockError);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      useAuthStore.setState({
        isAuthenticated: true,
        user: mockUser,
        tokens: mockTokens,
      });

      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      await act(async () => {
        await result.current.logout();
      });

      expect(authService.logout).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.tokens).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle logout errors and still clear auth state', async () => {
      useAuthStore.setState({
        isAuthenticated: true,
        user: mockUser,
        tokens: mockTokens,
      });

      (authService.logout as any).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      await act(async () => {
        await result.current.logout();
      });

      // A pesar del error, el estado debería limpiarse
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.tokens).toBeNull();
    });

    it('should set loading state during logout', async () => {
      useAuthStore.setState({
        isAuthenticated: true,
        user: mockUser,
        tokens: mockTokens,
      });

      let resolveLogout: any;
      (authService.logout as any).mockImplementation(() =>
        new Promise(resolve => { resolveLogout = resolve; })
      );

      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      act(() => {
        result.current.logout();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveLogout();
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('checkAuthStatus', () => {
    it('should check auth status and update state when authenticated', async () => {
      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      await act(async () => {
        await result.current.checkAuthStatus();
      });

      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.tokens).toEqual(mockTokens);
      expect(result.current.isLoading).toBe(false);
    });

    it('should clear auth state when not authenticated', async () => {
      (authService.getCurrentUser as any).mockRejectedValue(new Error('Not authenticated'));

      useAuthStore.setState({
        isAuthenticated: true,
        user: mockUser,
        tokens: mockTokens,
      });

      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      await act(async () => {
        await result.current.checkAuthStatus();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.tokens).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('confirmEmail', () => {
    it('should confirm email successfully', async () => {
      const confirmResponse = { isComplete: true };
      (authService.confirmEmail as any).mockResolvedValue(confirmResponse);

      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      let response;
      await act(async () => {
        response = await result.current.confirmEmail('test@example.com', '123456');
      });

      expect(authService.confirmEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        code: '123456',
      });

      expect(response).toEqual(confirmResponse);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle confirmation errors', async () => {
      const mockError = {
        name: 'CodeMismatchException',
        message: 'El código es incorrecto.',
      };

      (authService.confirmEmail as any).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      await act(async () => {
        await expect(
          result.current.confirmEmail('test@example.com', 'wrong-code')
        ).rejects.toEqual(mockError);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('resendCode', () => {
    it('should resend confirmation code successfully', async () => {
      const resendResponse = {
        destination: 'test@example.com',
        deliveryMedium: 'EMAIL',
        attribute: 'email',
      };

      (authService.resendConfirmationCode as any).mockResolvedValue(resendResponse);

      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      let response;
      await act(async () => {
        response = await result.current.resendCode('test@example.com');
      });

      expect(authService.resendConfirmationCode).toHaveBeenCalledWith('test@example.com');
      expect(response).toEqual(resendResponse);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle resend code errors', async () => {
      const mockError = {
        name: 'LimitExceededException',
        message: 'Has excedido el límite de reenvíos.',
      };

      (authService.resendConfirmationCode as any).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      await act(async () => {
        await expect(
          result.current.resendCode('test@example.com')
        ).rejects.toEqual(mockError);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('state management integration', () => {
    it('should update Zustand store on successful login', async () => {
      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      const storeState = useAuthStore.getState();
      expect(storeState.isAuthenticated).toBe(true);
      expect(storeState.user).toEqual(mockUser);
      expect(storeState.tokens).toEqual(mockTokens);
    });

    it('should clear Zustand store on logout', async () => {
      useAuthStore.setState({
        isAuthenticated: true,
        user: mockUser,
        tokens: mockTokens,
      });

      const { result } = renderHook(() => useAuth({ checkOnMount: false }));

      await act(async () => {
        await result.current.logout();
      });

      const storeState = useAuthStore.getState();
      expect(storeState.isAuthenticated).toBe(false);
      expect(storeState.user).toBeNull();
      expect(storeState.tokens).toBeNull();
    });
  });
});
