import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Navbar } from './NavbarSection';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, className, onClick }: { children: React.ReactNode; href: string; className?: string; onClick?: () => void }) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ),
}));

// Mock document.getElementById for scroll functionality
const mockScrollIntoView = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  global.document.getElementById = vi.fn(() => ({
    scrollIntoView: mockScrollIntoView,
  })) as any;
});

describe('Navbar', () => {
  it('should render the navbar', () => {
    const { container } = render(<Navbar />);

    expect(container.querySelector('.landing-nav')).toBeInTheDocument();
  });

  it('should render the Logo component', () => {
    const { container } = render(<Navbar />);

    expect(screen.getByText('ServerCheck')).toBeInTheDocument();
    expect(screen.getByText('Uptime Monitoring')).toBeInTheDocument();
    expect(container.querySelector('.nav-logo')).toBeInTheDocument();
  });

  it('should render all navigation links', () => {
    render(<Navbar />);

    expect(screen.getByText('Características')).toBeInTheDocument();
    expect(screen.getByText('Métricas')).toBeInTheDocument();
    expect(screen.getByText('Testimonios')).toBeInTheDocument();
  });

  it('should render CTA buttons', () => {
    render(<Navbar />);

    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
    expect(screen.getByText('Comenzar gratis')).toBeInTheDocument();
  });

  it('should have correct href for login link', () => {
    render(<Navbar />);

    const loginLink = screen.getByText('Iniciar sesión').closest('a');
    expect(loginLink).toHaveAttribute('href', '/auth/login');
  });

  it('should have correct href for register link', () => {
    render(<Navbar />);

    const registerLink = screen.getByText('Comenzar gratis').closest('a');
    expect(registerLink).toHaveAttribute('href', '/auth/register');
  });

  it('should have correct CSS classes', () => {
    const { container } = render(<Navbar />);

    expect(container.querySelector('.landing-nav')).toBeInTheDocument();
    expect(container.querySelector('.nav-container')).toBeInTheDocument();
    expect(container.querySelector('.nav-links')).toBeInTheDocument();
    expect(container.querySelector('.nav-cta')).toBeInTheDocument();
  });

  it('should render navigation links as list items', () => {
    const { container } = render(<Navbar />);

    const listItems = container.querySelectorAll('.nav-links li');
    expect(listItems.length).toBe(3);
  });

  it('should have nav-logo link with home href', () => {
    const { container } = render(<Navbar />);

    const logoLink = container.querySelector('.nav-logo');
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('should have btn-ghost class for login button', () => {
    render(<Navbar />);

    const loginButton = screen.getByText('Iniciar sesión').closest('a');
    expect(loginButton).toHaveClass('btn-ghost');
  });

  it('should have btn-primary class for register button', () => {
    render(<Navbar />);

    const registerButton = screen.getByText('Comenzar gratis').closest('a');
    expect(registerButton).toHaveClass('btn-primary');
  });
});
