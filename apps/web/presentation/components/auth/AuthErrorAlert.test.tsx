import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AuthErrorAlert } from './AuthErrorAlert';
import type { LoginException } from '@/infraestructure/interfaces';

describe('AuthErrorAlert', () => {
  it('should not render when there is no error', () => {
    const { container } = render(<AuthErrorAlert error={null} />);

    expect(container.firstChild).toBe(null);
  });

  it('should not render when error is undefined', () => {
    const { container } = render(<AuthErrorAlert error={undefined} />);

    expect(container.firstChild).toBe(null);
  });

  it('should render error with message', () => {
    const error: LoginException = {
      name: 'NotAuthorizedException',
      message: 'Incorrect username or password.',
    };

    render(<AuthErrorAlert error={error} />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Incorrect username or password.')).toBeInTheDocument();
  });

  it('should render custom title', () => {
    const error: LoginException = {
      name: 'NotAuthorizedException',
      message: 'Incorrect username or password.',
    };

    render(<AuthErrorAlert error={error} title="Login Failed" />);

    expect(screen.getByText('Login Failed')).toBeInTheDocument();
  });

  it('should render error name when message is not available', () => {
    const error: LoginException = {
      name: 'SomeError',
    };

    render(<AuthErrorAlert error={error} />);

    expect(screen.getByText('SomeError')).toBeInTheDocument();
  });

  it('should render default message when error has no message or name', () => {
    const error = {} as LoginException;

    render(<AuthErrorAlert error={error} />);

    expect(screen.getByText('Ocurrió un error inesperado')).toBeInTheDocument();
  });
});
