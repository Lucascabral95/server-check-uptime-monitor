import { getPasswordRequirements } from '@/infraestructure/models/register.schema';
import './PasswordRequirements.scss';

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirementsIndicator({ password }: PasswordRequirementsProps) {
  if (!password) {
    return null;
  }

  const requirements = getPasswordRequirements(password);

  const items = [
    { key: 'minLength', label: 'Mínimo 8 caracteres', met: requirements.minLength },
    { key: 'hasUpperCase', label: 'Una mayúscula (A-Z)', met: requirements.hasUpperCase },
    { key: 'hasLowerCase', label: 'Una minúscula (a-z)', met: requirements.hasLowerCase },
    { key: 'hasNumber', label: 'Un número (0-9)', met: requirements.hasNumber },
    { key: 'hasSpecial', label: 'Un carácter especial (!@#$%^&*)', met: requirements.hasSpecial },
  ];

  const allMet = items.every(item => item.met);

  return (
    <div className="password-requirements">
      <div className="password-requirements-header">
        <span className={`password-strength ${allMet ? 'strength-strong' : 'strength-weak'}`}>
          {allMet ? '✓ Contraseña segura' : 'Requisitos:'}
        </span>
      </div>
      <ul className="password-requirements-list">
        {items.map((item) => (
          <li key={item.key} className={item.met ? 'requirement-met' : 'requirement-unmet'}>
            <span className="requirement-icon">{item.met ? '✓' : '○'}</span>
            <span className="requirement-text">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
