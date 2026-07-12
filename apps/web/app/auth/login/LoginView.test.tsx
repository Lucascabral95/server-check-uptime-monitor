import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Login from './page';
import { useAuth } from '@/lib/hooks/useAuth';

// LoginView.tsx en sí ya no usa next/navigation, pero AuthCard (el footer
// "Registrate") sigue llamando useRouter() internamente y crashea sin este
// mock ("invariant expected app router to be mounted").
vi.mock('next/navigation');
vi.mock('@/lib/hooks/useAuth');

vi.mock('@/presentation/components/auth/LoginForm', () => ({
  LoginForm: ({ isLoading, onLogin }: any) => (
    <form>
      <input aria-label="Email" />
      <input aria-label="Contraseña" />
      <button
        type="button"
        disabled={isLoading}
        onClick={() => onLogin('test@example.com', 'password123')}
      >
        {isLoading ? 'Iniciando sesión...' : 'Entrar'}
      </button>
    </form>
  ),
}));

describe('Login Page', () => {
  const mockLogin = vi.fn();
  const originalLocation = window.location;

  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      error: null,
      isLoading: false,
      login: mockLogin,
    } as any);

    // handleLogin usa un hard navigation (window.location.href) a propósito
    // -- ver el comentario en LoginView.tsx -- así que lo stubeamos para
    // poder verificarlo sin que happy-dom intente navegar de verdad.
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, href: '' },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
    vi.clearAllMocks();
  });

  it('renders AuthCard with correct props', () => {
    render(<Login />);

    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
    expect(screen.getByText('Ingresá tus credenciales para acceder')).toBeInTheDocument();
    expect(screen.getByText('¿No tenés cuenta?')).toBeInTheDocument();
    expect(screen.getByText('Registrate')).toBeInTheDocument();
  });

  it('passes isLoading state to LoginForm', () => {
    vi.mocked(useAuth).mockReturnValue({
      error: null,
      isLoading: true,
      login: mockLogin,
    } as any);

    render(<Login />);

    const loadingButton = screen.getByRole('button', {
      name: /iniciando sesión/i,
    });

    expect(loadingButton).toBeDisabled();
  });

  it('navigates to dashboard after successful login', async () => {
    mockLogin.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<Login />);

    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await user.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(window.location.href).toBe('/dashboard/home');
  });

  it('displays error when login fails', () => {
    vi.mocked(useAuth).mockReturnValue({
      error: 'Credenciales inválidas',
      isLoading: false,
      login: mockLogin,
    } as any);

    render(<Login />);

    expect(screen.getByText('Error de inicio de sesión')).toBeInTheDocument();
    expect(screen.getByText('Ocurrió un error inesperado')).toBeInTheDocument();
  });
});
