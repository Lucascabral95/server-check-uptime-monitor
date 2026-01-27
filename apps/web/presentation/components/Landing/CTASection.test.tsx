import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CTASection } from './CTASection';
import { SOCIAL_NETWORKS } from '@/infraestructure/constants';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: any;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('CTASection', () => {
  it('should render without crashing', () => {
    const { container } = render(<CTASection />);
    expect(container.querySelector('.cta-section')).toBeInTheDocument();
  });

  it('should render title text', () => {
    render(<CTASection />);
    expect(screen.getByText('¿Listo para monitorear tu infraestructura?')).toBeInTheDocument();
  });

  it('should render subtitle text', () => {
    render(<CTASection />);
    expect(screen.getByText(/Unite a más de 500 empresas/)).toBeInTheDocument();
  });

  it('should render register link with correct href', () => {
    render(<CTASection />);
    const link = screen.getByText('Crear cuenta gratuita').closest('a');
    expect(link).toHaveAttribute('href', '/auth/register');
  });

  it('should render GitHub link with correct href', () => {
    render(<CTASection />);
    const link = screen.getByText('Ver en GitHub').closest('a');
    expect(link).toHaveAttribute('href', SOCIAL_NETWORKS.github);
  });

  it('should render GitHub link with external link attributes', () => {
    render(<CTASection />);
    const link = screen.getByText('Ver en GitHub').closest('a');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should apply correct CSS classes', () => {
    const { container } = render(<CTASection />);
    expect(container.querySelector('.cta-section')).toBeInTheDocument();
    expect(container.querySelector('.cta-container')).toBeInTheDocument();
    expect(container.querySelector('.cta-card')).toBeInTheDocument();
    expect(container.querySelector('.cta-content')).toBeInTheDocument();
  });

  it('should render all buttons with correct classes', () => {
    const { container } = render(<CTASection />);
    const buttons = container.querySelectorAll('.btn-lg');
    expect(buttons).toHaveLength(2);
  });

  it('should render primary button', () => {
    const { container } = render(<CTASection />);
    expect(container.querySelector('.btn-primary')).toBeInTheDocument();
  });

  it('should render secondary button', () => {
    const { container } = render(<CTASection />);
    expect(container.querySelector('.btn-secondary')).toBeInTheDocument();
  });
});
