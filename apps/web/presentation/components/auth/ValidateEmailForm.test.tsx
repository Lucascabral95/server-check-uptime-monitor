import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ValidateEmailForm } from './ValidateEmailForm';

describe('ValidateEmailForm', () => {
  const mockOnConfirm = vi.fn();
  const mockOnResendCode = vi.fn();

  beforeEach(() => {
    mockOnConfirm.mockClear();
    mockOnResendCode.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    email: 'test@example.com',
    error: null,
    isLoading: false,
    onConfirm: mockOnConfirm,
    onResendCode: mockOnResendCode,
  };

  describe('Renderizado inicial', () => {
    it('should render masked email', () => {
      render(<ValidateEmailForm {...defaultProps} />);
      expect(screen.getByText('te***@example.com')).toBeInTheDocument();
    });

    it('should render 6 code input fields', () => {
      render(<ValidateEmailForm {...defaultProps} />);
      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(6);
    });

    it('should focus first input on mount', () => {
      render(<ValidateEmailForm {...defaultProps} />);
      const inputs = screen.getAllByRole('textbox');
      expect(inputs[0]).toHaveFocus();
    });
  });

  describe('Envío manual - CRÍTICO', () => {
    it('should enable submit button when code is complete', async () => {
      mockOnConfirm.mockResolvedValue(undefined);
      const user = userEvent.setup({ delay: null });
      render(<ValidateEmailForm {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], '1');
      await user.type(inputs[1], '2');
      await user.type(inputs[2], '3');
      await user.type(inputs[3], '4');
      await user.type(inputs[4], '5');
      await user.type(inputs[5], '6');

      const submitButton = screen.getByRole('button', { name: 'Verificar Email' });
      expect(submitButton).not.toBeDisabled();
    });

    it('should call onConfirm when submit button is clicked', async () => {
      mockOnConfirm.mockResolvedValue(undefined);
      const user = userEvent.setup({ delay: null });
      render(<ValidateEmailForm {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], '1');
      await user.type(inputs[1], '2');
      await user.type(inputs[2], '3');
      await user.type(inputs[3], '4');
      await user.type(inputs[4], '5');
      await user.type(inputs[5], '6');

      const submitButton = screen.getByRole('button', { name: 'Verificar Email' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith('123456');
      });
    });
  });

  describe('Reenvío de código - CRÍTICO', () => {
    it('should show success message after resend', async () => {
      mockOnResendCode.mockResolvedValue(undefined);
      const user = userEvent.setup({ delay: null });
      render(<ValidateEmailForm {...defaultProps} />);

      const resendButton = screen.getByRole('button', { name: 'Reenviar código' });
      await user.click(resendButton);

      await waitFor(() => {
        expect(screen.getByText('¡Código reenviado exitosamente!')).toBeInTheDocument();
      });
    });

    it('should call onResendCode when resend button is clicked', async () => {
      mockOnResendCode.mockResolvedValue(undefined);
      const user = userEvent.setup({ delay: null });
      render(<ValidateEmailForm {...defaultProps} />);

      const resendButton = screen.getByRole('button', { name: 'Reenviar código' });
      await user.click(resendButton);

      await waitFor(() => {
        expect(mockOnResendCode).toHaveBeenCalled();
      });
    });
  });

  describe('Estados de carga y validación', () => {
    it('should disable inputs when loading', () => {
      render(<ValidateEmailForm {...defaultProps} isLoading={true} />);
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toBeDisabled();
      });
    });

    it('should disable submit button when code is incomplete', () => {
      render(<ValidateEmailForm {...defaultProps} />);
      const submitButton = screen.getByRole('button', { name: 'Verificar Email' });
      expect(submitButton).toBeDisabled();
    });
  });
});
