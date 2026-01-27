import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { HeroSection } from './HeroSection';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, onClick }: { children: React.ReactNode; href: string; onClick?: () => void }) => (
    <a href={href} onClick={onClick}>
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

describe('HeroSection', () => {
  it('should render the hero section', () => {
    render(<HeroSection />);

    expect(screen.getByText('Monitoreo en tiempo real')).toBeInTheDocument();
  });

  it('should render the main title with highlight', () => {
    render(<HeroSection />);

    expect(screen.getByText(/Monitoreo de servidores/)).toBeInTheDocument();
    expect(screen.getByText('para empresas')).toBeInTheDocument();
  });

  it('should render the subtitle', () => {
    render(<HeroSection />);

    expect(screen.getByText(/Detectá tiempos de inactividad/)).toBeInTheDocument();
  });

  it('should render the CTA buttons', () => {
    render(<HeroSection />);

    expect(screen.getByText('Comenzar prueba gratuita')).toBeInTheDocument();
    expect(screen.getByText('Ver características')).toBeInTheDocument();
  });

  it('should have correct link href for register button', () => {
    render(<HeroSection />);

    const registerLink = screen.getByText('Comenzar prueba gratuita').closest('a');
    expect(registerLink).toHaveAttribute('href', '/auth/register');
  });

  it('should render trust text', () => {
    render(<HeroSection />);

    expect(screen.getByText('Confían en nosotros más de 500 empresas')).toBeInTheDocument();
  });

  it('should render dashboard preview elements', () => {
    const { container } = render(<HeroSection />);

    expect(container.querySelector('.dashboard-preview')).toBeInTheDocument();
    expect(container.querySelector('.preview-header')).toBeInTheDocument();
    expect(container.querySelectorAll('.preview-dot').length).toBe(3);
  });

  it('should render preview cards', () => {
    const { container } = render(<HeroSection />);

    expect(container.querySelectorAll('.preview-card').length).toBe(2);
  });

  it('should have correct CSS classes', () => {
    const { container } = render(<HeroSection />);

    expect(container.querySelector('.hero-section')).toBeInTheDocument();
    expect(container.querySelector('.hero-container')).toBeInTheDocument();
    expect(container.querySelector('.hero-content')).toBeInTheDocument();
  });

  it('should render preview rows with different widths', () => {
    const { container } = render(<HeroSection />);

    expect(container.querySelector('.preview-row.w-75')).toBeInTheDocument();
    expect(container.querySelector('.preview-row.w-50')).toBeInTheDocument();
    expect(container.querySelector('.preview-row.w-60')).toBeInTheDocument();
    expect(container.querySelector('.preview-row.w-40')).toBeInTheDocument();
  });
});
