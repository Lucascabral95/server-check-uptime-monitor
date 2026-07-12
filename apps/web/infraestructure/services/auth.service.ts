import {
  signIn,
  fetchAuthSession,
  signOut,
  getCurrentUser,
  signUp,
  confirmSignUp,
  resendSignUpCode,
} from "aws-amplify/auth";
import {
  LoginResponseUser,
  ConfirmEmailCredentials,
  ConfirmEmailResponse,
  ResendCodeResponse,
} from "@/infraestructure/interfaces";

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
  async register(
    credentials: RegisterCredentials,
  ): Promise<{ isComplete: boolean; userId: string }> {
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

      const isComplete =
        (result as { isComplete?: boolean }).isComplete ?? false;
      const userId = (result as { userId?: string })?.userId ?? "";

      return { isComplete, userId };
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      if (err.name === "UsernameExistsException") {
        throw new Error("El email ya está registrado. Intenta iniciar sesión.");
      }

      if (err.name === "InvalidPasswordException") {
        throw new Error(
          "La contraseña no cumple con los requisitos. Debe tener al menos 12 caracteres, mayúscula, minúscula, número y carácter especial.",
        );
      }

      if (err.name === "InvalidParameterException") {
        throw new Error(
          "Parámetro inválido. Verifica que el email sea válido.",
        );
      }

      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<void> {
    const { email, password } = credentials;

    let signInResult: Awaited<ReturnType<typeof signIn>>;
    try {
      signInResult = await signIn({ username: email, password });
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };

      // Amplify guarda la sesión en el browser; si queda una sesión previa
      // colgada (token vencido, cuenta distinta, etc.) signIn() rechaza con
      // esta excepción en lugar de simplemente reemplazarla. Cerramos esa
      // sesión y reintentamos una sola vez.
      if (err.name === "UserAlreadyAuthenticatedException") {
        await signOut();
        signInResult = await signIn({ username: email, password });
      } else if (
        err.name === "NotAuthorizedException" ||
        err.name === "UserNotFoundException"
      ) {
        throw new Error("Email o contraseña incorrectos.");
      } else if (err.name === "UserNotConfirmedException") {
        throw new Error("Debes confirmar tu email antes de iniciar sesión.");
      } else {
        throw error;
      }
    }

    if (!signInResult.isSignedIn) {
      throw new Error("Login no completado");
    }

    const session = await fetchAuthSession();
    const accessToken = session.tokens?.accessToken?.toString();
    const idToken = session.tokens?.idToken?.toString();

    if (!accessToken || !idToken) {
      throw new Error("No se pudieron obtener los tokens");
    }

    await this.establishSession(accessToken, idToken);
  }

  async logout(): Promise<void> {
    await signOut();
    await this.destroySession();
  }

  async getCurrentUser(): Promise<LoginResponseUser> {
    const user = await getCurrentUser();
    return user as LoginResponseUser;
  }

  // El JS del browser no puede setear cookies httpOnly, así que los tokens
  // recién obtenidos de Amplify se mandan a un Route Handler propio que los
  // guarda como cookie httpOnly — nunca vuelven a tocar document.cookie ni
  // localStorage.
  private async establishSession(
    accessToken: string,
    idToken: string,
  ): Promise<void> {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ accessToken, idToken }),
    });

    if (!response.ok) {
      throw new Error("No se pudo establecer la sesión");
    }
  }

  private async destroySession(): Promise<void> {
    await fetch("/api/auth/session", {
      method: "DELETE",
      credentials: "include",
    });
  }

  async checkAuthStatus(): Promise<LoginResponseUser | null> {
    try {
      const user = await this.getCurrentUser();
      return user;
    } catch {
      return null;
    }
  }

  async confirmEmail(
    credentials: ConfirmEmailCredentials,
  ): Promise<ConfirmEmailResponse> {
    const { email, code } = credentials;

    try {
      const result = await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      const isComplete =
        (result as { isComplete?: boolean }).isComplete ?? true;

      return { isComplete };
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      if (err.name === "CodeMismatchException") {
        throw new Error(
          "El código es incorrecto. Verifica e intenta nuevamente.",
        );
      }

      if (err.name === "ExpiredCodeException") {
        throw new Error("El código ha expirado. Solicita un nuevo código.");
      }

      if (err.name === "UserNotFoundException") {
        throw new Error("Usuario no encontrado. Verifica tu email.");
      }

      if (err.name === "NotAuthorizedException") {
        throw new Error("El usuario ya está verificado. Inicia sesión.");
      }

      if (err.name === "InvalidParameterException") {
        throw new Error("Parámetro inválido. Verifica el código ingresado.");
      }

      throw error;
    }
  }

  async resendConfirmationCode(email: string): Promise<ResendCodeResponse> {
    try {
      const result = await resendSignUpCode({
        username: email,
      });

      const destination =
        (result as { destination?: string })?.destination ?? email;
      const deliveryMedium =
        (result as { deliveryMedium?: string })?.deliveryMedium ?? "EMAIL";
      const attribute =
        (result as { attribute?: string })?.attribute ?? "email";

      return { destination, deliveryMedium, attribute };
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      if (err.name === "UserNotFoundException") {
        throw new Error("Usuario no encontrado. Verifica tu email.");
      }

      if (err.name === "InvalidParameterException") {
        throw new Error("Parámetro inválido. Verifica tu email.");
      }

      if (err.name === "LimitExceededException") {
        throw new Error(
          "Has excedido el límite de reenvíos. Espera unos minutos e intenta nuevamente.",
        );
      }

      throw error;
    }
  }
}

export const authService = new AuthService();
