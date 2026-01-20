"use client"

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

import { LoginException } from '@/infraestructure/interfaces';
import './validate-email.scss';

interface ValidateEmailFormProps {
  email: string;
  error: LoginException | null;
  isLoading: boolean;
  onConfirm: (code: string) => Promise<void>;
  onResendCode: () => Promise<void>;
}

export function ValidateEmailForm({
  email,
  error,
  isLoading,
  onConfirm,
  onResendCode,
}: ValidateEmailFormProps) {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleChange = (index: number, value: string) => {
    const newCode = [...code];
    newCode[index] = value;

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    setCode(newCode);

    if (newCode.every(digit => digit.length === 1)) {
      const fullCode = newCode.join('');
      onConfirm(fullCode);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData.split('').concat(['', '', '', '', '', '']).slice(0, 6);
      setCode(newCode);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();

      if (pastedData.length === 6) {
        onConfirm(pastedData);
      }
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    try {
      await onResendCode();
      setResendSuccess(true);
      setCountdown(30);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch {
      // Error already handled by parent
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      await onConfirm(fullCode);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

  return (
    <form onSubmit={handleSubmit} className="validate-email-form">
      <div className="email-info">
        <svg className="email-icon" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
        <div className="email-text">
          <p className="email-label">Email</p>
          <p className="email-address">{maskedEmail}</p>
        </div>
      </div>

      <div className="code-inputs">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={el => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className={`code-input ${digit ? 'filled' : ''}`}
            value={digit}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            autoFocus={index === 0}
          />
        ))}
      </div>

      <div className="resend-section">
        {resendSuccess ? (
          <p className="resend-success">¡Código reenviado exitosamente!</p>
        ) : (
          <>
            {countdown > 0 ? (
              <p className="resend-countdown">Reenviar en {countdown}s</p>
            ) : (
              <button
                type="button"
                className="resend-button"
                onClick={handleResend}
                disabled={isLoading}
              >
                Reenviar código
              </button>
            )}
          </>
        )}
      </div>

      <button type="submit" className="submit-button" disabled={isLoading || code.join('').length !== 6}>
        <span className="button-content">
          {isLoading ? (
            <>
              <span className="spinner" />
              Verificando...
            </>
          ) : (
            'Verificar Email'
          )}
        </span>
      </button>
    </form>
  );
}
