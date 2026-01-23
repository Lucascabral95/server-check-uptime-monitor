import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorState from './ErrorState';

describe('ErrorState', () => {
  it('should show default title', () => {
    render(<ErrorState />);

    expect(screen.getByText('Ocurrió un error')).toBeInTheDocument();
  });

  it('should show custom title when provided', () => {
    render(<ErrorState title="Error personalizado" />);

    expect(screen.getByText('Error personalizado')).toBeInTheDocument();
  });

  it('should show default description', () => {
    render(<ErrorState />);

    expect(screen.getByText('No se pudo cargar la información. Intentá nuevamente.')).toBeInTheDocument();
  });

  it('should show custom description when provided', () => {
    render(<ErrorState description="Descripción del error" />);

    expect(screen.getByText('Descripción del error')).toBeInTheDocument();
  });

  it('should not render retry button when onRetry is not provided', () => {
    const { container } = render(<ErrorState />);

    const button = container.querySelector('button');
    expect(button).not.toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    render(<ErrorState onRetry={() => {}} />);

    const button = screen.getByText('Reintentar');
    expect(button).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();

    render(<ErrorState onRetry={onRetry} />);

    const button = screen.getByText('Reintentar');
    fireEvent.click(button);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should have error class on state-wrapper', () => {
    const { container } = render(<ErrorState />);

    const wrapper = container.querySelector('.state-wrapper.error');
    expect(wrapper).toBeInTheDocument();
  });
});
