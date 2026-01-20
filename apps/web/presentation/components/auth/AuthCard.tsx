import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { LoginException } from '@/infraestructure/interfaces';
import { AuthErrorAlert } from './AuthErrorAlert';
import { AuthLogo } from './AuthLogo';

import './auth.scss';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
  error?: LoginException | null | undefined;
  errorTitle?: string;
}

export function AuthCard({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLinkText,
  error,
  errorTitle,
}: AuthCardProps) {
  const router = useRouter();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <AuthLogo />

        <AuthErrorAlert error={error} title={errorTitle} />

        <div className="auth-header">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {children}

        <div className="auth-footer">
          <p>
            {footerText}{' '}
            <a href={footerLink} onClick={(e) => {
              e.preventDefault();
              router.push(footerLink);
            }}>
              {footerLinkText}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
