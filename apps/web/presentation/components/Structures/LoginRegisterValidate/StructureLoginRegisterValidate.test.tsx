import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import StructureLoginRegisterValidate from './StructureLoginRegisterValidate';

describe('StructureLoginRegisterValidate', () => {
  it('should render without crashing', () => {
    const { container } = render(<StructureLoginRegisterValidate />);
    expect(container).toBeInTheDocument();
  });

  it('should have the correct CSS class', () => {
    const { container } = render(<StructureLoginRegisterValidate />);

    const structureElement = container.querySelector('.structure-login-register-validate');
    expect(structureElement).toBeInTheDocument();
  });
});
