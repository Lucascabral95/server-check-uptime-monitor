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
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
