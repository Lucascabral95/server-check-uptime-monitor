import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RegisterForm } from './RegisterForm';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('RegisterForm', () => {
  const mockOnRegister = vi.fn();

  beforeEach(() => {
    mockOnRegister.mockClear();
  });

  const defaultProps = {
    error: null,
    isLoading: false,
    onRegister: mockOnRegister,
  };

  it('should render email, password and confirm password inputs', () => {
    render(<RegisterForm {...defaultProps} />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar Contraseña')).toBeInTheDocument();
  });

  it('should render submit button', () => {
    render(<RegisterForm {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Crear Cuenta' })).toBeInTheDocument();
  });

  it('should show loading state when isLoading is true', () => {
    render(<RegisterForm {...defaultProps} isLoading={true} />);

    expect(screen.getByText('Creando cuenta...')).toBeInTheDocument();
  });
});
