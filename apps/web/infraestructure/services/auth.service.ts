import { signIn, fetchAuthSession, signOut, getCurrentUser, signUp, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';

import { LoginException, LoginResponseUser, ConfirmEmailCredentials, ConfirmEmailResponse, ResendCodeResponse } from '@/infraestructure/interfaces';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
}

interface AuthSession {
  accessToken: string;
  idToken: string;
}

class AuthService {
  private static readonly COOKIE_MAX_AGE = 60 * 60; // 1 hora

  /**
   * Registra un nuevo usuario
   */
  async register(credentials: RegisterCredentials): Promise<{ isComplete: boolean; userId: string }> {
    const { email, password } = credentials;

    try {
      const { isComplete, userId, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
          autoSignIn: false, // No auto-sign-in después del registro
        },
      });

      console.log('SignUp result:', { isComplete, userId, nextStep });

      return { isComplete, userId: userId || '' };
    } catch (error: any) {
      console.error('SignUp error:', error);

      // Manejo específico de errores comunes de Cognito
      if (error.name === 'UsernameExistsException') {
        throw new Error('El email ya está registrado. Intenta iniciar sesión.');
      }

      if (error.name === 'InvalidPasswordException') {
        throw new Error('La contraseña no cumple con los requisitos. Debe tener al menos 8 caracteres, mayúscula, minúscula, número y carácter especial.');
      }

      if (error.name === 'InvalidParameterException') {
        throw new Error('Parámetro inválido. Verifica que el email sea válido.');
      }

      throw error;
    }
  }

  /**
   * Inicia sesión con email y password
   */
  async login(credentials: LoginCredentials): Promise<void> {
    const { email, password } = credentials;

    const signInResult = await signIn({
      username: email,
      password,
    });

    if (!signInResult.isSignedIn) {
      throw new Error('Login no completado');
    }

    const session = await fetchAuthSession();
    const accessToken = session.tokens?.accessToken?.toString();
    const idToken = session.tokens?.idToken?.toString();

    if (!accessToken || !idToken) {
      throw new Error('No se pudieron obtener los tokens');
    }

    // Guardar tokens en cookies
    this.setAuthCookies(accessToken, idToken);
  }

  /**
   * Cierra la sesión del usuario
   */
  async logout(): Promise<void> {
    await signOut();
    this.clearAuthCookies();
  }

  /**
   * Obtiene el usuario actual autenticado
   */
  async getCurrentUser(): Promise<LoginResponseUser> {
    const user = await getCurrentUser();
    return user as LoginResponseUser;
  }

  /**
   * Guarda tokens en cookies
   */
  private setAuthCookies(accessToken: string, idToken: string): void {
    if (typeof document === 'undefined') return;

    const cookieOptions = 'path=/; max-age=' + AuthService.COOKIE_MAX_AGE;

    document.cookie = `accessToken=${accessToken}; ${cookieOptions}`;
    document.cookie = `idToken=${idToken}; ${cookieOptions}`;
  }

  /**
   * Limpia las cookies de autenticación
   */
  private clearAuthCookies(): void {
    if (typeof document === 'undefined') return;

    document.cookie = 'accessToken=; path=/; max-age=0';
    document.cookie = 'idToken=; path=/; max-age=0';
  }

  /**
   * Verifica si hay una sesión activa
   */
  async checkAuthStatus(): Promise<LoginResponseUser | null> {
    try {
      const user = await this.getCurrentUser();
      return user;
    } catch {
      return null;
    }
  }

  /**
   * Confirma el email del usuario con el código recibido
   */
  async confirmEmail(credentials: ConfirmEmailCredentials): Promise<ConfirmEmailResponse> {
    const { email, code } = credentials;

    try {
      const { isComplete } = await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      return { isComplete };
    } catch (error: any) {
      console.error('ConfirmSignUp error:', error);

      if (error.name === 'CodeMismatchException') {
        throw new Error('El código es incorrecto. Verifica e intenta nuevamente.');
      }

      if (error.name === 'ExpiredCodeException') {
        throw new Error('El código ha expirado. Solicita un nuevo código.');
      }

      if (error.name === 'UserNotFoundException') {
        throw new Error('Usuario no encontrado. Verifica tu email.');
      }

      if (error.name === 'NotAuthorizedException') {
        throw new Error('El usuario ya está verificado. Inicia sesión.');
      }

      if (error.name === 'InvalidParameterException') {
        throw new Error('Parámetro inválido. Verifica el código ingresado.');
      }

      throw error;
    }
  }

  /**
   * Reenvía el código de confirmación al email del usuario
   */
  async resendConfirmationCode(email: string): Promise<ResendCodeResponse> {
    try {
      const { destination, deliveryMedium, attribute } = await resendSignUpCode({
        username: email,
      });

      return { destination, deliveryMedium, attribute };
    } catch (error: any) {
      console.error('ResendSignUpCode error:', error);

      if (error.name === 'UserNotFoundException') {
        throw new Error('Usuario no encontrado. Verifica tu email.');
      }

      if (error.name === 'InvalidParameterException') {
        throw new Error('Parámetro inválido. Verifica tu email.');
      }

      if (error.name === 'LimitExceededException') {
        throw new Error('Has excedido el límite de reenvíos. Espera unos minutos e intenta nuevamente.');
      }

      throw error;
    }
  }
}

export const authService = new AuthService();
