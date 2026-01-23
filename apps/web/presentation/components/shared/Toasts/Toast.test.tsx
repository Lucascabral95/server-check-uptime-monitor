import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Toast from './Toast';

describe('Toast', () => {
  it('should not render when visible is false', () => {
    const { container } = render(
      <Toast message="Test message" type="success" visible={false} />
    );

    expect(container.firstChild).toBe(null);
  });

  it('should render when visible is true', () => {
    render(
      <Toast message="Test message" type="success" visible={true} />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should display the message correctly', () => {
    render(
      <Toast message="Operation successful" type="success" visible={true} />
    );

    expect(screen.getByText('Operation successful')).toBeInTheDocument();
  });

  it('should apply success class type', () => {
    const { container } = render(
      <Toast message="Success message" type="success" visible={true} />
    );

    const toastContent = container.querySelector('.toast-content');
    expect(toastContent).toHaveClass('success');
  });

  it('should apply error class type', () => {
    const { container } = render(
      <Toast message="Error message" type="error" visible={true} />
    );

    const toastContent = container.querySelector('.toast-content');
    expect(toastContent).toHaveClass('error');
  });

  it('should apply warning class type', () => {
    const { container } = render(
      <Toast message="Warning message" type="warning" visible={true} />
    );

    const toastContent = container.querySelector('.toast-content');
    expect(toastContent).toHaveClass('warning');
  });

  it('should apply info class type', () => {
    const { container } = render(
      <Toast message="Info message" type="info" visible={true} />
    );

    const toastContent = container.querySelector('.toast-content');
    expect(toastContent).toHaveClass('info');
  });
});
