import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AuthLogo } from './AuthLogo';

describe('AuthLogo', () => {
  it('should render the logo', () => {
    render(<AuthLogo />);

    expect(screen.getByText('Server Check')).toBeInTheDocument();
  });

  it('should have the correct CSS class', () => {
    const { container } = render(<AuthLogo />);

    const logoContainer = container.querySelector('.auth-logo');
    expect(logoContainer).toBeInTheDocument();
  });

  it('should render status indicator', () => {
    const { container } = render(<AuthLogo />);

    const statusDot = container.querySelector('.status-dot');
    expect(statusDot).toBeInTheDocument();
  });
});
