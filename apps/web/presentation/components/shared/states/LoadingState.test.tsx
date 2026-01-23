import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingState from './LoadingState';

describe('LoadingState', () => {
  it('should render the spinner', () => {
    const { container } = render(<LoadingState />);

    const spinner = container.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('should display the message when provided', () => {
    render(<LoadingState message="Cargando datos..." />);

    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
  });

  it('should render without message (default value)', () => {
    const { container } = render(<LoadingState />);

    const messageElement = container.querySelector('p');
    expect(messageElement).toBeInTheDocument();
  });

  it('should have state-wrapper class', () => {
    const { container } = render(<LoadingState />);

    const wrapper = container.querySelector('.state-wrapper');
    expect(wrapper).toBeInTheDocument();
  });
});
