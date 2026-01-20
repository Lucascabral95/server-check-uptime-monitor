import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    mockOnLogin.mockClear();
  });

  const defaultProps = {
    isLoading: false,
    onLogin: mockOnLogin,
  };

  it('should render email and password inputs', () => {
    render(<LoginForm {...defaultProps} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it('should render submit button', () => {
    render(<LoginForm {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('should show loading state when isLoading is true', () => {
    render(<LoginForm {...defaultProps} isLoading={true} />);

    expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument();
    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();
  });
});
