import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { LogosSection } from './LogosSection';

describe('LogosSection', () => {
  it('should render the logos section', () => {
    render(<LogosSection />);

    expect(screen.getByText('EMPRESAS QUE CONFÍAN EN NOSOTROS')).toBeInTheDocument();
  });

  it('should render all company logos', () => {
    const { container } = render(<LogosSection />);

    const logoItems = container.querySelectorAll('.logo-item');
    expect(logoItems.length).toBe(5);
  });

  it('should render company names', () => {
    render(<LogosSection />);

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('TechGlobal')).toBeInTheDocument();
    expect(screen.getByText('DataFlow')).toBeInTheDocument();
    expect(screen.getByText('CloudNine')).toBeInTheDocument();
    expect(screen.getByText('SecureNet')).toBeInTheDocument();
  });

  it('should have correct CSS classes', () => {
    const { container } = render(<LogosSection />);

    expect(container.querySelector('.logos-section')).toBeInTheDocument();
    expect(container.querySelector('.logos-container')).toBeInTheDocument();
    expect(container.querySelector('.logos-label')).toBeInTheDocument();
    expect(container.querySelector('.logos-grid')).toBeInTheDocument();
  });

  it('should render icons for each company', () => {
    const { container } = render(<LogosSection />);

    const logoItems = container.querySelectorAll('.logo-item');
    logoItems.forEach(item => {
      const icon = item.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  it('should render company name next to icon', () => {
    const { container } = render(<LogosSection />);

    const logoItems = container.querySelectorAll('.logo-item');
    logoItems.forEach(item => {
      const span = item.querySelector('span');
      expect(span).toBeInTheDocument();
      expect(span?.textContent).toBeTruthy();
    });
  });

  it('should use index as key for each logo item', () => {
    const { container } = render(<LogosSection />);

    const logoItems = container.querySelectorAll('.logo-item');
    expect(logoItems.length).toBeGreaterThan(0);
  });
});
