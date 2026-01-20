import { LoginException } from '@/infraestructure/interfaces';
import './AuthErrorAlert.scss';

interface AuthErrorAlertProps {
  error: LoginException | null | undefined;
  title?: string;
}

export function AuthErrorAlert({ error, title = 'Error' }: AuthErrorAlertProps) {
  if (!error) return null;

  const getMessage = () => {
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      return error.message;
    }
    return error.name || 'Ocurrió un error inesperado';
  };

  return (
    <div className="auth-error-alert">
      <div className="error-content">
        <div className="error-icon-wrapper">
          <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9a1 1 0 10-2 1 1 0 00-2zm0-4a1 1 0 10-2 1 1 0 00-2z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="error-text">
          <div className="error-title">{title}</div>
          <div className="error-message">{getMessage()}</div>
        </div>
      </div>
    </div>
  );
}
