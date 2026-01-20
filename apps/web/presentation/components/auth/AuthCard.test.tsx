import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AuthCard } from './AuthCard';
import type { LoginException } from '@/infraestructure/interfaces';

// Mock de next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('AuthCard', () => {
  const defaultProps = {
    title: 'Test Title',
    subtitle: 'Test Subtitle',
    footerText: 'Don\'t have an account?',
    footerLink: '/register',
    footerLinkText: 'Sign up',
    children: <div>Test Children</div>,
  };

  it('should render the card with all props', () => {
    render(<AuthCard {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });

  it('should render footer link', () => {
    render(<AuthCard {...defaultProps} />);

    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('should render error when provided', () => {
    const error: LoginException = {
      name: 'TestError',
      message: 'Test error message',
    };

    render(<AuthCard {...defaultProps} error={error} />);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should not render error when not provided', () => {
    const { container } = render(<AuthCard {...defaultProps} />);

    expect(container.querySelector('.auth-error-alert')).not.toBeInTheDocument();
  });

  it('should render AuthLogo', () => {
    const { container } = render(<AuthCard {...defaultProps} />);

    expect(container.querySelector('.auth-logo')).toBeInTheDocument();
  });

  it('should render footer with custom link', () => {
    render(<AuthCard {...defaultProps} footerLink="/custom-link" />);

    const link = screen.getByText('Sign up').closest('a');
    expect(link).toHaveAttribute('href', '/custom-link');
  });

  it('should render custom error title', () => {
    const error: LoginException = {
      name: 'TestError',
      message: 'Test error message',
    };

    render(<AuthCard {...defaultProps} error={error} errorTitle="Custom Error" />);

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });
});
