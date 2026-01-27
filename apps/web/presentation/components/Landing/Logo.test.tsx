import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Logo } from './Logo';

describe('Logo', () => {
  it('should render the logo component', () => {
    const { container } = render(<Logo />);

    expect(container.querySelector('.logo-icon')).toBeInTheDocument();
    expect(container.querySelector('.logo-text')).toBeInTheDocument();
  });

  it('should render ServerCheck name', () => {
    render(<Logo />);

    expect(screen.getByText('ServerCheck')).toBeInTheDocument();
  });

  it('should render tagline', () => {
    render(<Logo />);

    expect(screen.getByText('Uptime Monitoring')).toBeInTheDocument();
  });

  it('should have correct CSS classes', () => {
    const { container } = render(<Logo />);

    expect(container.querySelector('.logo-icon')).toBeInTheDocument();
    expect(container.querySelector('.logo-text')).toBeInTheDocument();
    expect(container.querySelector('.logo-name')).toBeInTheDocument();
    expect(container.querySelector('.logo-tagline')).toBeInTheDocument();
  });

  it('should render FiActivity icon', () => {
    const { container } = render(<Logo />);

    const icon = container.querySelector('.logo-icon svg');
    expect(icon).toBeInTheDocument();
  });

  it('should render name and tagline as separate spans', () => {
    const { container } = render(<Logo />);

    const nameSpan = container.querySelector('.logo-name');
    const taglineSpan = container.querySelector('.logo-tagline');

    expect(nameSpan).toHaveTextContent('ServerCheck');
    expect(taglineSpan).toHaveTextContent('Uptime Monitoring');
  });
});
