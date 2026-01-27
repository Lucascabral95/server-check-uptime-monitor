import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { TestimonialsSection } from './TestimonialsSection';

describe('TestimonialsSection', () => {
  it('should render the testimonials section with id', () => {
    const { container } = render(<TestimonialsSection />);

    expect(container.querySelector('#testimonials')).toBeInTheDocument();
    expect(container.querySelector('.testimonials-section')).toBeInTheDocument();
  });

  it('should render section label', () => {
    render(<TestimonialsSection />);

    expect(screen.getByText('Testimonios')).toBeInTheDocument();
  });

  it('should render section title', () => {
    render(<TestimonialsSection />);

    expect(screen.getByText('Lo que dicen nuestros clientes')).toBeInTheDocument();
  });

  it('should render all testimonial quotes', () => {
    render(<TestimonialsSection />);

    expect(screen.getByText(/ServerCheck transformó nuestra operación/)).toBeInTheDocument();
    expect(screen.getByText(/La fiabilidad y el soporte son excepcionales/)).toBeInTheDocument();
  });

  it('should render all author names', () => {
    render(<TestimonialsSection />);

    expect(screen.getByText('Carlos Méndez')).toBeInTheDocument();
    expect(screen.getByText('Ana Rodríguez')).toBeInTheDocument();
  });

  it('should render all author roles', () => {
    render(<TestimonialsSection />);

    expect(screen.getByText('CTO, TechCorp Global')).toBeInTheDocument();
    expect(screen.getByText('VP of Engineering, DataFlow Inc')).toBeInTheDocument();
  });

  it('should render 2 testimonial cards', () => {
    const { container } = render(<TestimonialsSection />);

    const testimonialCards = container.querySelectorAll('.testimonial-card');
    expect(testimonialCards.length).toBe(2);
  });

  it('should have correct CSS classes', () => {
    const { container } = render(<TestimonialsSection />);

    expect(container.querySelector('.testimonials-section')).toBeInTheDocument();
    expect(container.querySelector('.testimonials-container')).toBeInTheDocument();
    expect(container.querySelector('.section-header')).toBeInTheDocument();
    expect(container.querySelector('.testimonials-grid')).toBeInTheDocument();
  });

  it('should render section label with icon', () => {
    const { container } = render(<TestimonialsSection />);

    const sectionLabel = container.querySelector('.section-label');
    expect(sectionLabel).toBeInTheDocument();
    const icon = sectionLabel?.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should render testimonial quote', () => {
    const { container } = render(<TestimonialsSection />);

    const quotes = container.querySelectorAll('.testimonial-quote');
    expect(quotes.length).toBe(2);
  });

  it('should render author avatars', () => {
    const { container } = render(<TestimonialsSection />);

    const avatars = container.querySelectorAll('.author-avatar');
    expect(avatars.length).toBe(2);

    avatars.forEach(avatar => {
      const icon = avatar.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  it('should render author info sections', () => {
    const { container } = render(<TestimonialsSection />);

    const authorInfos = container.querySelectorAll('.author-info');
    expect(authorInfos.length).toBe(2);

    authorInfos.forEach(info => {
      expect(info.querySelector('.author-name')).toBeInTheDocument();
      expect(info.querySelector('.author-title')).toBeInTheDocument();
    });
  });

  it('should render complete testimonial author section', () => {
    const { container } = render(<TestimonialsSection />);

    const authorSections = container.querySelectorAll('.testimonial-author');
    expect(authorSections.length).toBe(2);

    authorSections.forEach(section => {
      expect(section.querySelector('.author-avatar')).toBeInTheDocument();
      expect(section.querySelector('.author-info')).toBeInTheDocument();
    });
  });
});
