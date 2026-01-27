import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { MetricsSection } from './MetricsSection';

describe('MetricsSection', () => {
  it('should render the metrics section with id', () => {
    const { container } = render(<MetricsSection />);

    expect(container.querySelector('#metrics')).toBeInTheDocument();
    expect(container.querySelector('.metrics-section')).toBeInTheDocument();
  });

  it('should render all metric values', () => {
    render(<MetricsSection />);

    expect(screen.getByText('99.99%')).toBeInTheDocument();
    expect(screen.getByText('< 60s')).toBeInTheDocument();
    expect(screen.getByText('10K+')).toBeInTheDocument();
    expect(screen.getByText('1M+')).toBeInTheDocument();
  });

  it('should render all metric labels', () => {
    render(<MetricsSection />);

    expect(screen.getByText('Uptime garantizado')).toBeInTheDocument();
    expect(screen.getByText('Tiempo de detección')).toBeInTheDocument();
    expect(screen.getByText('Monitores activos')).toBeInTheDocument();
    expect(screen.getByText('Comprobaciones diarias')).toBeInTheDocument();
  });

  it('should render 4 metric cards', () => {
    const { container } = render(<MetricsSection />);

    const metricCards = container.querySelectorAll('.metric-card');
    expect(metricCards.length).toBe(4);
  });

  it('should have correct CSS classes', () => {
    const { container } = render(<MetricsSection />);

    expect(container.querySelector('.metrics-section')).toBeInTheDocument();
    expect(container.querySelector('.metrics-container')).toBeInTheDocument();
    expect(container.querySelector('.metrics-grid')).toBeInTheDocument();
  });

  it('should render metric value and label together', () => {
    const { container } = render(<MetricsSection />);

    const metricCards = container.querySelectorAll('.metric-card');
    metricCards.forEach(card => {
      expect(card.querySelector('.metric-value')).toBeInTheDocument();
      expect(card.querySelector('.metric-label')).toBeInTheDocument();
    });
  });

  it('should match metric values with their corresponding labels', () => {
    render(<MetricsSection />);

    // Uptime metric
    const uptimeValue = screen.getByText('99.99%');
    const uptimeCard = uptimeValue.closest('.metric-card');
    expect(uptimeCard?.querySelector('.metric-label')?.textContent).toBe('Uptime garantizado');

    // Detection time metric
    const detectionValue = screen.getByText('< 60s');
    const detectionCard = detectionValue.closest('.metric-card');
    expect(detectionCard?.querySelector('.metric-label')?.textContent).toBe('Tiempo de detección');
  });
});
