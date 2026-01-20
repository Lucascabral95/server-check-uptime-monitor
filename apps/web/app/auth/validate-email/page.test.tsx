import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';

import ValidateEmail from './page';
import { useAuth } from '@/lib/hooks/useAuth';

vi.mock('next/navigation');
vi.mock('@/lib/hooks/useAuth');

vi.mock('@/presentation/components/auth/ValidateEmailForm', () => ({
  ValidateEmailForm: ({ email, isLoading, onConfirm, onResendCode }: any) => (
    <form>
      <input aria-label="Código" />
      <button
        type="button"
        disabled={isLoading}
        onClick={() => onConfirm('111111')}
      >
        {isLoading ? 'Verificando...' : 'Verificar Email'}
      </button>

      <button
        type="button"
        disabled={isLoading}
        onClick={() => onResendCode()}
      >
        Reenviar código
      </button>

      <div data-testid="email-value">{email}</div>
    </form>
  ),
}));

describe('Validate Email Page', () => {
  const mockPush = vi.fn();
  const mockConfirmEmail = vi.fn();
  const mockResendCode = vi.fn();

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn((key) => (key === 'email' ? 'test@example.com' : null)),
    } as any);
    vi.mocked(useAuth).mockReturnValue({
      error: null,
      isLoading: false,
      confirmEmail: mockConfirmEmail,
      resendCode: mockResendCode,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders AuthCard with correct props', () => {
    render(<ValidateEmail />);

    expect(screen.getByText('Verificar email')).toBeInTheDocument();
    expect(
      screen.getByText('Ingresá el código de 6 dígitos que enviamos a tu correo')
    ).toBeInTheDocument();
    expect(screen.getByText('¿Ya tenés tu cuenta verificada?')).toBeInTheDocument();
    expect(screen.getByText('Iniciá sesión')).toBeInTheDocument();
  });

  it('extracts email from search params and passes to ValidateEmailForm', () => {
    const mockGet = vi.fn((key) => (key === 'email' ? 'user@example.com' : null));
    vi.mocked(useSearchParams).mockReturnValue({
      get: mockGet,
    } as any);

    render(<ValidateEmail />);

    expect(mockGet).toHaveBeenCalledWith('email');
  });

  it('navigates to login after successful confirmation', async () => {
    mockConfirmEmail.mockResolvedValue({ isComplete: true });
    const user = userEvent.setup();

    render(<ValidateEmail />);

    const submitButton = screen.getByRole('button', { name: /verificar email/i });

    await user.click(submitButton);

    expect(mockConfirmEmail).toHaveBeenCalledWith('test@example.com', '111111');
    expect(mockPush).toHaveBeenCalledWith(
      '/auth/login?verified=true&email=test%40example.com'
    );
  });

  it('navigates to login when isComplete is undefined', async () => {
    mockConfirmEmail.mockResolvedValue({ isComplete: undefined });
    const user = userEvent.setup();

    render(<ValidateEmail />);

    const submitButton = screen.getByRole('button', { name: /verificar email/i });

    await user.click(submitButton);

    expect(mockPush).toHaveBeenCalledWith(
      '/auth/login?verified=true&email=test%40example.com'
    );
  });

  it('handles resend code action', async () => {
    mockResendCode.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<ValidateEmail />);

    const resendButton = screen.getByRole('button', { name: /reenviar código/i });
    await user.click(resendButton);

    expect(mockResendCode).toHaveBeenCalledWith('test@example.com');
  });

  it('displays error when confirmation fails', () => {
    vi.mocked(useAuth).mockReturnValue({
      error: 'Código inválido',
      isLoading: false,
      confirmEmail: mockConfirmEmail,
      resendCode: mockResendCode,
    } as any);

    render(<ValidateEmail />);

    expect(screen.getByText('Error de verificación')).toBeInTheDocument();
    expect(screen.getByText('Ocurrió un error inesperado')).toBeInTheDocument();
  });

  it('passes isLoading state to ValidateEmailForm', () => {
    vi.mocked(useAuth).mockReturnValue({
      error: null,
      isLoading: true,
      confirmEmail: mockConfirmEmail,
      resendCode: mockResendCode,
    } as any);

    render(<ValidateEmail />);

    const loadingButton = screen.getByRole('button', {
      name: /verificando/i,
    });

    expect(loadingButton).toBeDisabled();
  });
});
