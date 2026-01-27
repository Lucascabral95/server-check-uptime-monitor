import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { FeaturesSection } from './FeaturesSection';
import { FEATURES } from '@/infraestructure/constants';

vi.mock('react-icons/fi', async (importOriginal) => {
  const actual = await importOriginal<any>();

  return {
    ...actual,
    FiZap: () => <div data-testid="fi-zap">ZapIcon</div>,
    FiActivity: () => <div data-testid="fi-activity">ActivityIcon</div>,
    FiMail: () => <div data-testid="fi-mail">MailIcon</div>,
    FiBarChart2: () => <div data-testid="fi-bar-chart">BarChartIcon</div>,
    FiSettings: () => <div data-testid="fi-settings">SettingsIcon</div>,
    FiShield: () => <div data-testid="fi-shield">ShieldIcon</div>,
  };
});

describe('FeaturesSection', () => {
  it('should render without crashing', () => {
    const { container } = render(<FeaturesSection />);
    expect(container.querySelector('.features-section')).toBeInTheDocument();
  });

  it('should render section label', () => {
    render(<FeaturesSection />);
    expect(screen.getByText('Características')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<FeaturesSection />);
    expect(
      screen.getByText(
        'Todo lo que necesitas para monitorear tu infraestructura'
      )
    ).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(<FeaturesSection />);
    expect(
      screen.getByText(/Herramientas profesionales diseñadas/)
    ).toBeInTheDocument();
  });

  it('should render all features from FEATURES constant', () => {
    render(<FeaturesSection />);

    FEATURES.forEach(feature => {
      expect(
        screen.getByText(feature.title)
      ).toBeInTheDocument();
    });
  });

  it('should render correct number of feature cards', () => {
    const { container } = render(<FeaturesSection />);
    const cards = container.querySelectorAll('.feature-card');
    expect(cards).toHaveLength(FEATURES.length);
  });

  it('should render feature descriptions', () => {
    render(<FeaturesSection />);

    expect(screen.getByText(/Supervisión 24\/7/)).toBeInTheDocument();
    expect(screen.getByText(/Notificaciones automáticas/)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/)).toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    const { container } = render(<FeaturesSection />);

    expect(container.querySelector('.features-section')).toBeInTheDocument();
    expect(container.querySelector('.features-container')).toBeInTheDocument();
    expect(container.querySelector('.section-header')).toBeInTheDocument();
    expect(container.querySelector('.features-grid')).toBeInTheDocument();
  });

  it('should render icons for each feature', () => {
    render(<FeaturesSection />);
    const icons = screen.getAllByTestId(/fi-/);
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should have section id attribute', () => {
    const { container } = render(<FeaturesSection />);
    const section = container.querySelector('#features');
    expect(section).toBeInTheDocument();
  });

  it('should render section label with icon', () => {
  const { container } = render(<FeaturesSection />);
  const label = container.querySelector('.section-label');
  expect(label?.querySelector('[data-testid="fi-zap"]')).toBeInTheDocument();
});
});
