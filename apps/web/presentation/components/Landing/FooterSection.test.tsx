import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Footer } from './FooterSection';

vi.mock('react-icons/fi', () => ({
  FiActivity: () => <div data-testid="fi-activity">ActivityIcon</div>,
}));

describe('Footer', () => {
  it('should render without crashing', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('.landing-footer')).toBeInTheDocument();
  });

  it('should render brand text', () => {
    render(<Footer />);
    expect(screen.getByText('ServerCheck')).toBeInTheDocument();
  });

  it('should render brand icon', () => {
    render(<Footer />);
    expect(screen.getByTestId('fi-activity')).toBeInTheDocument();
  });

  it('should render all navigation links', () => {
    render(<Footer />);
    expect(screen.getByText('Características')).toBeInTheDocument();
    expect(screen.getByText('Métricas')).toBeInTheDocument();
    expect(screen.getByText('Documentación')).toBeInTheDocument();
    expect(screen.getByText('Soporte')).toBeInTheDocument();
  });

  it('should render copyright text', () => {
    render(<Footer />);
    expect(screen.getByText('© 2026 ServerCheck. Todos los derechos reservados.')).toBeInTheDocument();
  });

  it('should have correct href for features link', () => {
    render(<Footer />);
    const link = screen.getByText('Características').closest('a');
    expect(link).toHaveAttribute('href', '#features');
  });

  it('should have correct href for metrics link', () => {
    render(<Footer />);
    const link = screen.getByText('Métricas').closest('a');
    expect(link).toHaveAttribute('href', '#metrics');
  });

  it('should have correct href for documentation link', () => {
    render(<Footer />);
    const link = screen.getByText('Documentación').closest('a');
    expect(link).toHaveAttribute('href', '#');
  });

  it('should have correct href for support link', () => {
    render(<Footer />);
    const link = screen.getByText('Soporte').closest('a');
    expect(link).toHaveAttribute('href', '#');
  });

  it('should apply correct CSS classes', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('.landing-footer')).toBeInTheDocument();
    expect(container.querySelector('.footer-container')).toBeInTheDocument();
    expect(container.querySelector('.footer-brand')).toBeInTheDocument();
    expect(container.querySelector('.footer-links')).toBeInTheDocument();
    expect(container.querySelector('.footer-copy')).toBeInTheDocument();
  });

  it('should render all links in footer-links container', () => {
    const { container } = render(<Footer />);
    const linksContainer = container.querySelector('.footer-links');
    const links = linksContainer?.querySelectorAll('a');
    expect(links).toHaveLength(4);
  });

  it('should render brand section with icon and text together', () => {
    const { container } = render(<Footer />);
    const brandSection = container.querySelector('.footer-brand');
    expect(brandSection).toContainElement(screen.getByTestId('fi-activity'));
    expect(brandSection).toHaveTextContent('ServerCheck');
  });
});
