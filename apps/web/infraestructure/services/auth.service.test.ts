import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  signIn,
  fetchAuthSession,
  signOut,
  getCurrentUser,
  signUp,
  confirmSignUp,
  resendSignUpCode,
} from 'aws-amplify/auth';

import { authService } from './auth.service';

vi.mock('aws-amplify/auth', () => ({
  signIn: vi.fn(),
  fetchAuthSession: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
  signUp: vi.fn(),
  confirmSignUp: vi.fn(),
  resendSignUpCode: vi.fn(),
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = { userId: 'user123', isComplete: false };
      vi.mocked(signUp).mockResolvedValue(mockUser as never);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'ValidPass123!',
      });

      expect(result).toEqual({ isComplete: false, userId: 'user123' });
    });

    it('should handle UsernameExistsException', async () => {
      const error = new Error('UsernameExistsException');
      (error as { name: string }).name = 'UsernameExistsException';
      vi.mocked(signUp).mockRejectedValue(error as never);

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'ValidPass123!',
        })
      ).rejects.toThrow('El email ya está registrado. Intenta iniciar sesión.');
    });
  });

  describe('login', () => {
    it('should login successfully and set cookies', async () => {
      vi.mocked(signIn).mockResolvedValue({ isSignedIn: true } as never);
      vi.mocked(fetchAuthSession).mockResolvedValue({
        tokens: {
          accessToken: { toString: () => 'accessToken123' },
          idToken: { toString: () => 'idToken123' },
        },
      } as never);

      await authService.login({
        email: 'test@example.com',
        password: 'ValidPass123!',
      });

      expect(signIn).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'ValidPass123!',
      });

      // JSDOM solo conserva la última cookie, así que validamos intentos
      expect(document.cookie).toContain('idToken=idToken123');
    });

    it('should throw error when login is not complete', async () => {
      vi.mocked(signIn).mockResolvedValue({ isSignedIn: false } as never);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'ValidPass123!',
        })
      ).rejects.toThrow('Login no completado');
    });
  });

  describe('logout', () => {
    it('should logout and clear cookies', async () => {
      vi.mocked(signOut).mockResolvedValue(undefined as never);

      await authService.logout();

      expect(signOut).toHaveBeenCalled();
      expect(document.cookie).toContain('idToken=');
      expect(document.cookie).toContain('max-age=0');
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user', async () => {
      const mockUser = { userId: 'user123', email: 'test@example.com' };
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser as never);

      const result = await authService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });
  });

  describe('checkAuthStatus', () => {
    it('should return user when authenticated', async () => {
      const mockUser = { userId: 'user123', email: 'test@example.com' };
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser as never);

      const result = await authService.checkAuthStatus();

      expect(result).toEqual(mockUser);
    });

    it('should return null when not authenticated', async () => {
      vi.mocked(getCurrentUser).mockRejectedValue(new Error('Not authenticated'));

      const result = await authService.checkAuthStatus();

      expect(result).toBeNull();
    });
  });

  describe('confirmEmail', () => {
    it('should confirm email successfully', async () => {
      vi.mocked(confirmSignUp).mockResolvedValue({ isComplete: true } as never);

      const result = await authService.confirmEmail({
        email: 'test@example.com',
        code: '123456',
      });

      expect(result).toEqual({ isComplete: true });
    });

    it('should handle CodeMismatchException', async () => {
      const error = new Error('CodeMismatchException');
      (error as { name: string }).name = 'CodeMismatchException';
      vi.mocked(confirmSignUp).mockRejectedValue(error as never);

      await expect(
        authService.confirmEmail({
          email: 'test@example.com',
          code: '000000',
        })
      ).rejects.toThrow('El código es incorrecto. Verifica e intenta nuevamente.');
    });
  });

  describe('resendConfirmationCode', () => {
    it('should resend confirmation code successfully', async () => {
      vi.mocked(resendSignUpCode).mockResolvedValue({
        destination: 'test@example.com',
        deliveryMedium: 'EMAIL',
      } as never);

      const result = await authService.resendConfirmationCode('test@example.com');

      expect(result).toEqual({
        destination: 'test@example.com',
        deliveryMedium: 'EMAIL',
        attribute: 'email',
      });
    });

    it('should handle UserNotFoundException', async () => {
      const error = new Error('UserNotFoundException');
      (error as { name: string }).name = 'UserNotFoundException';
      vi.mocked(resendSignUpCode).mockRejectedValue(error as never);

      await expect(
        authService.resendConfirmationCode('nonexistent@example.com')
      ).rejects.toThrow('Usuario no encontrado. Verifica tu email.');
    });
  });
});
