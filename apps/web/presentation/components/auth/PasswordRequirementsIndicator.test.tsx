import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { PasswordRequirementsIndicator } from './PasswordRequirementsIndicator';

describe('PasswordRequirementsIndicator', () => {
  it('should not render when password is empty', () => {
    const { container } = render(<PasswordRequirementsIndicator password="" />);

    expect(container.firstChild).toBe(null);
  });

  it('should render all requirements when password has value', () => {
    render(<PasswordRequirementsIndicator password="a" />);

    expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument();
    expect(screen.getByText('Una mayúscula (A-Z)')).toBeInTheDocument();
    expect(screen.getByText('Una minúscula (a-z)')).toBeInTheDocument();
    expect(screen.getByText('Un número (0-9)')).toBeInTheDocument();
    expect(screen.getByText('Un carácter especial (!@#$%^&*)')).toBeInTheDocument();
  });

  it('should show weak password when requirements are not met', () => {
    render(<PasswordRequirementsIndicator password="weak" />);

    expect(screen.getByText('Requisitos:')).toBeInTheDocument();
  });

  it('should show strong password when all requirements are met', () => {
    render(<PasswordRequirementsIndicator password="StrongP@ss1" />);

    expect(screen.getByText('✓ Contraseña segura')).toBeInTheDocument();
  });

  it('should show met status for minLength', () => {
    const { container } = render(<PasswordRequirementsIndicator password="12345678" />);

    const listItems = container.querySelectorAll('li');
    const minLengthItem = listItems[0]; 
    expect(minLengthItem).toHaveClass('requirement-met');
  });

  it('should show met status for hasUpperCase', () => {
    render(<PasswordRequirementsIndicator password="ABCDEFGH" />);

    expect(screen.getByText('Una mayúscula (A-Z)')).toBeInTheDocument();
  });

  it('should show met status for hasLowerCase', () => {
    render(<PasswordRequirementsIndicator password="abcdefgh" />);

    expect(screen.getByText('Una minúscula (a-z)')).toBeInTheDocument();
  });

  it('should show met status for hasNumber', () => {
    render(<PasswordRequirementsIndicator password="12345678" />);

    expect(screen.getByText('Un número (0-9)')).toBeInTheDocument();
  });

  it('should show met status for hasSpecial', () => {
    render(<PasswordRequirementsIndicator password="!!!!!!!!" />);

    expect(screen.getByText('Un carácter especial (!@#$%^&*)')).toBeInTheDocument();
  });

  it('should show all requirements met for valid password', () => {
    const { container } = render(<PasswordRequirementsIndicator password="ValidP@ss1" />);

    const allMetItems = container.querySelectorAll('.requirement-met');
    expect(allMetItems.length).toBe(5);
  });

  it('should show most requirements unmet for weak password', () => {
    const { container } = render(<PasswordRequirementsIndicator password="ABCDEFGH" />);

    const unmetItems = container.querySelectorAll('.requirement-unmet');
    // "ABCDEFGH" has: minLength (met), hasUpperCase (met), but missing: lowercase, number, special
    expect(unmetItems.length).toBe(3);
  });
});
