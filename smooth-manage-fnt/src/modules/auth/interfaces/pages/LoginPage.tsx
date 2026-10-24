import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Checkbox } from '@shared/design-system';
import { MailIcon, LockIcon } from '@shared/design-system/icons';
import { useAuthViewModel } from '../view-model/useAuth';
import { authMessages } from '../i18n/en';
import type { AuthUseCasePort } from '../../application/port/in/AuthUseCase';

interface LoginPageProps {
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister, onSwitchToForgot, onSuccess }) => {
  const authUseCase = window.__AUTH_USE_CASE__ as AuthUseCasePort;
  const { login, loading, error, fieldErrors, clearFieldError, clearError } =
    useAuthViewModel(authUseCase);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);

  const t = authMessages.login;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login({ email, password, rememberMe });
    if (ok) {
      onSuccess?.();
      return;
    }
    if (email.trim() && password) {
      setPassword('');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    clearFieldError('email');
    clearError();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    clearFieldError('password');
    clearError();
  };

  const handleRememberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  useEffect(() => {
    formRef.current?.querySelector('input')?.focus();
  }, []);

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      {error && Object.keys(fieldErrors).length === 0 && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-5)',
            marginBottom: 'var(--space-6)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--danger)',
            background: 'color-mix(in srgb, var(--danger) 10%, var(--surface))',
            color: 'var(--danger)',
            fontSize: 'var(--font-size-base)',
            lineHeight: 1.4,
          }}
        >
          <span
            aria-hidden
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 18,
              height: 18,
              flex: 'none',
              borderRadius: '50%',
              border: '1.5px solid var(--danger)',
              fontSize: 12,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            !
          </span>
          <span>{error}</span>
        </div>
      )}
      <Input
        label={t.emailLabel}
        type="email"
        placeholder={t.emailPlaceholder}
        value={email}
        onChange={handleEmailChange}
        error={fieldErrors.email}
        icon={<MailIcon size={18} />}
        autoComplete="email"
        required
      />
      <Input
        label={t.passwordLabel}
        type="password"
        placeholder={t.passwordPlaceholder}
        value={password}
        onChange={handlePasswordChange}
        error={fieldErrors.password}
        icon={<LockIcon size={18} />}
        showPasswordToggle={true}
        autoComplete="current-password"
        required
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', margin: 'var(--space-1) 0 var(--space-6)' }}>
        <Checkbox
          checked={rememberMe}
          onChange={handleRememberChange}
          label={t.rememberMe}
        />
        <button
          type="button"
          onClick={onSwitchToForgot}
          style={{
            color: 'var(--accent)',
            fontWeight: 600,
            textDecoration: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 'var(--font-size-base)',
            fontFamily: 'var(--font-family)',
          }}
        >
          {t.forgotPassword}
        </button>
      </div>
      <Button type="submit" fullWidth loading={loading}>
        {t.submit}
      </Button>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 'var(--space-6)', fontSize: 'var(--font-size-base)' }}>
        {t.noAccount} <button type="button" onClick={onSwitchToRegister} style={{ color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', padding: 0 }}>{t.signUp}</button>
      </p>
    </form>
  );
};