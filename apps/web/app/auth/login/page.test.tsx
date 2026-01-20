import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

import Login from './page';
import { useAuth } from '@/lib/hooks/useAuth';

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
  const mockPush = vi.fn();
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    vi.mocked(useAuth).mockReturnValue({
      error: null,
      isLoading: false,
      login: mockLogin,
    } as any);
  });

  afterEach(() => {
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
    expect(mockPush).toHaveBeenCalledWith('/dashboard/home');
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
