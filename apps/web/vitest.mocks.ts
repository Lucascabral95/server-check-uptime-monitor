import { vi } from 'vitest';

// Tipos para los mocks
export const mockUser = {
  username: 'test@example.com',
  userId: 'user-123',
  signInDetails: {
    loginId: 'test@example.com',
    authFlowType: 'USER_SRP_AUTH',
  },
};

export const mockTokens = {
  accessToken: 'mock-access-token',
  idToken: 'mock-id-token',
};

// Mock de AWS Amplify Auth
export const mockFetchAuthSession = vi.fn();
export const mockSignIn = vi.fn();
export const mockSignOut = vi.fn();
export const mockGetCurrentUser = vi.fn();
export const mockSignUp = vi.fn();
export const mockConfirmSignUp = vi.fn();
export const mockResendSignUpCode = vi.fn();

// Mock completo del servicio de autenticación
export const mockAuthService = {
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  getCurrentUser: vi.fn(),
  checkAuthStatus: vi.fn(),
  confirmEmail: vi.fn(),
  resendConfirmationCode: vi.fn(),
};

// Valores por defecto para los mocks
export const setupDefaultMocks = () => {
  mockGetCurrentUser.mockResolvedValue(mockUser);
  mockFetchAuthSession.mockResolvedValue({
    tokens: {
      accessToken: { toString: () => mockTokens.accessToken },
      idToken: { toString: () => mockTokens.idToken },
    },
  });
  mockSignIn.mockResolvedValue({
    isSignedIn: true,
    nextStep: { signInStep: 'DONE' },
  });
  mockSignOut.mockResolvedValue(undefined);
  mockSignUp.mockResolvedValue({
    isComplete: false,
    userId: mockUser.userId,
    nextStep: { signUpStep: 'CONFIRM_SIGN_UP' },
  });
  mockConfirmSignUp.mockResolvedValue({
    isComplete: true,
    nextStep: { signUpStep: 'COMPLETE' },
  });
  mockResendSignUpCode.mockResolvedValue({
    destination: mockUser.username,
    deliveryMedium: 'EMAIL',
    attribute: 'email',
  });

  // Configurar el mock del authService
  mockAuthService.login.mockResolvedValue(undefined);
  mockAuthService.logout.mockResolvedValue(undefined);
  mockAuthService.register.mockResolvedValue({
    isComplete: false,
    userId: mockUser.userId,
  });
  mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
  mockAuthService.checkAuthStatus.mockResolvedValue(mockUser);
  mockAuthService.confirmEmail.mockResolvedValue({ isComplete: true });
  mockAuthService.resendConfirmationCode.mockResolvedValue({
    destination: mockUser.username,
    deliveryMedium: 'EMAIL',
    attribute: 'email',
  });
};

// Función para limpiar todos los mocks
export const clearAllMocks = () => {
  mockFetchAuthSession.mockClear();
  mockSignIn.mockClear();
  mockSignOut.mockClear();
  mockGetCurrentUser.mockClear();
  mockSignUp.mockClear();
  mockConfirmSignUp.mockClear();
  mockResendSignUpCode.mockClear();
  Object.values(mockAuthService).forEach((mock) => {
    if (typeof mock === 'function') {
      mock.mockClear();
    }
  });
};
