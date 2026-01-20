import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

import Register from './page';
import { useAuth } from '@/lib/hooks/useAuth';

vi.mock('next/navigation');
vi.mock('@/lib/hooks/useAuth');

vi.mock('@/presentation/components/auth/RegisterForm', () => ({
  RegisterForm: ({ isLoading, onRegister }: any) => (
    <form>
      <input aria-label="Email" />
      <input aria-label="Contraseña" />
      <button
        type="button"
        disabled={isLoading}
        onClick={() => onRegister('test@example.com', 'Password123!')}
      >
        {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
      </button>
    </form>
  ),
}));

describe('Register Page', () => {
  const mockPush = vi.fn();
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    vi.mocked(useAuth).mockReturnValue({
      error: null,
      isLoading: false,
      register: mockRegister,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders AuthCard with correct props', () => {
    render(<Register />);

    expect(screen.getByText('Crear cuenta')).toBeInTheDocument();
    expect(
      screen.getByText('Registrate para comenzar a monitorear tus servidores')
    ).toBeInTheDocument();
    expect(screen.getByText('¿Ya tenés cuenta?')).toBeInTheDocument();
    expect(screen.getByText('Iniciá sesión')).toBeInTheDocument();
  });

  it('navigates to login with success query when registration is complete', async () => {
    mockRegister.mockResolvedValue({ isComplete: true });
    const user = userEvent.setup();

    render(<Register />);

    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

    await user.click(submitButton);

    expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'Password123!');
    expect(mockPush).toHaveBeenCalledWith(
      '/auth/login?registered=true&email=test%40example.com'
    );
  });

  it('navigates to validate-email when registration requires confirmation', async () => {
    mockRegister.mockResolvedValue({ isComplete: false });
    const user = userEvent.setup();

    render(<Register />);

    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

    await user.click(submitButton);

    expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'Password123!');
    expect(mockPush).toHaveBeenCalledWith(
      '/auth/validate-email?email=test%40example.com'
    );
  });

  it('displays error when registration fails', () => {
    vi.mocked(useAuth).mockReturnValue({
      error: 'El email ya está registrado',
      isLoading: false,
      register: mockRegister,
    } as any);

    render(<Register />);

    expect(screen.getByText('Error de registro')).toBeInTheDocument();
    expect(screen.getByText('Ocurrió un error inesperado')).toBeInTheDocument();
  });

  it('passes isLoading state to RegisterForm', () => {
    vi.mocked(useAuth).mockReturnValue({
      error: null,
      isLoading: true,
      register: mockRegister,
    } as any);

    render(<Register />);

    const loadingButton = screen.getByRole('button', {
      name: /creando cuenta/i,
    });

    expect(loadingButton).toBeDisabled();
  });
});
