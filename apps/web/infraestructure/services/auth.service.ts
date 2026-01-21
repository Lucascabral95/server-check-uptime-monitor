import { signIn, fetchAuthSession, signOut, getCurrentUser, signUp, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { LoginResponseUser, ConfirmEmailCredentials, ConfirmEmailResponse, ResendCodeResponse } from '@/infraestructure/interfaces';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
}

interface SignUpResult {
  isComplete: boolean;
  userId?: string;
  nextStep?: unknown;
}

class AuthService {
  private static readonly COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

  async register(credentials: RegisterCredentials): Promise<{ isComplete: boolean; userId: string }> {
    const { email, password } = credentials;

    try {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
          autoSignIn: false, 
        },
      });

      const isComplete = (result as { isComplete?: boolean }).isComplete ?? false;
      const userId = (result as { userId?: string })?.userId ?? '';

      console.log('SignUp result:', { isComplete, userId, nextStep: (result as { nextStep?: unknown })?.nextStep });

      return { isComplete, userId };
    } catch (error: unknown) {
      console.error('SignUp error:', error);

      const err = error as { name?: string; message?: string };
      if (err.name === 'UsernameExistsException') {
        throw new Error('El email ya está registrado. Intenta iniciar sesión.');
      }

      if (err.name === 'InvalidPasswordException') {
        throw new Error('La contraseña no cumple con los requisitos. Debe tener al menos 8 caracteres, mayúscula, minúscula, número y carácter especial.');
      }

      if (err.name === 'InvalidParameterException') {
        throw new Error('Parámetro inválido. Verifica que el email sea válido.');
      }

      throw error;
    }
  }

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

    this.setAuthCookies(accessToken, idToken);
  }

  async logout(): Promise<void> {
    await signOut();
    this.clearAuthCookies();
  }

  async getCurrentUser(): Promise<LoginResponseUser> {
    const user = await getCurrentUser();
    return user as LoginResponseUser;
  }

  private setAuthCookies(accessToken: string, idToken: string): void {
    if (typeof document === 'undefined') return;

    const cookieOptions = 'path=/; max-age=' + AuthService.COOKIE_MAX_AGE;

    document.cookie = `accessToken=${accessToken}; ${cookieOptions}`;
    document.cookie = `idToken=${idToken}; ${cookieOptions}`;
  }

  private clearAuthCookies(): void {
    if (typeof document === 'undefined') return;

    document.cookie = 'accessToken=; path=/; max-age=0';
    document.cookie = 'idToken=; path=/; max-age=0';
  }

  async checkAuthStatus(): Promise<LoginResponseUser | null> {
    try {
      const user = await this.getCurrentUser();
      return user;
    } catch {
      return null;
    }
  }

  async confirmEmail(credentials: ConfirmEmailCredentials): Promise<ConfirmEmailResponse> {
    const { email, code } = credentials;

    try {
      const result = await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      const isComplete = (result as { isComplete?: boolean }).isComplete ?? true;

      return { isComplete };
    } catch (error: unknown) {
      console.error('ConfirmSignUp error:', error);

      const err = error as { name?: string; message?: string };
      if (err.name === 'CodeMismatchException') {
        throw new Error('El código es incorrecto. Verifica e intenta nuevamente.');
      }

      if (err.name === 'ExpiredCodeException') {
        throw new Error('El código ha expirado. Solicita un nuevo código.');
      }

      if (err.name === 'UserNotFoundException') {
        throw new Error('Usuario no encontrado. Verifica tu email.');
      }

      if (err.name === 'NotAuthorizedException') {
        throw new Error('El usuario ya está verificado. Inicia sesión.');
      }

      if (err.name === 'InvalidParameterException') {
        throw new Error('Parámetro inválido. Verifica el código ingresado.');
      }

      throw error;
    }
  }

  async resendConfirmationCode(email: string): Promise<ResendCodeResponse> {
    try {
      const result = await resendSignUpCode({
        username: email,
      });

      const destination = (result as { destination?: string })?.destination ?? email;
      const deliveryMedium = (result as { deliveryMedium?: string })?.deliveryMedium ?? 'EMAIL';
      const attribute = (result as { attribute?: string })?.attribute ?? 'email';

      return { destination, deliveryMedium, attribute };
    } catch (error: unknown) {
      console.error('ResendSignUpCode error:', error);

      const err = error as { name?: string; message?: string };
      if (err.name === 'UserNotFoundException') {
        throw new Error('Usuario no encontrado. Verifica tu email.');
      }

      if (err.name === 'InvalidParameterException') {
        throw new Error('Parámetro inválido. Verifica tu email.');
      }

      if (err.name === 'LimitExceededException') {
        throw new Error('Has excedido el límite de reenvíos. Espera unos minutos e intenta nuevamente.');
      }

      throw error;
    }
  }
}

export const authService = new AuthService();
