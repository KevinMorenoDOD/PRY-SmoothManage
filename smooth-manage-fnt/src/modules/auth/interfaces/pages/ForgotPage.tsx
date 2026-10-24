import React, { useEffect, useRef, useState } from 'react';
import { Button, Input } from '@shared/design-system';
import { MailIcon, KeyIcon, BackIcon } from '@shared/design-system/icons';
import { useAuthViewModel } from '../view-model/useAuth';
import { authMessages } from '../i18n/en';
import type { AuthUseCasePort } from '../../application/port/in/AuthUseCase';

interface ForgotPageProps {
  onSwitchToLogin: () => void;
}

export const ForgotPage: React.FC<ForgotPageProps> = ({ onSwitchToLogin }) => {
  const authUseCase = window.__AUTH_USE_CASE__ as AuthUseCasePort;
  const { requestPasswordReset, loading, fieldErrors, clearFieldError } = useAuthViewModel(authUseCase);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [resending, setResending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const t = authMessages.forgot;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestPasswordReset(email);
    setSent(true);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    clearFieldError('email');
  };

  const handleResend = async () => {
    setResending(true);
    await requestPasswordReset(email);
    setResending(false);
  };

  useEffect(() => {
    formRef.current?.querySelector('input')?.focus();
  }, []);

  if (sent) {
    return (
      <div>
        <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-xl)', display: 'grid', placeItems: 'center', marginBottom: 'var(--space-5)', color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}>
          <MailIcon size={28} />
        </div>
        <h1 style={{ fontSize: 'var(--font-size-4xl)', lineHeight: 'var(--line-height-tight)', letterSpacing: 'var(--letter-spacing-tight)', marginBottom: 'var(--space-2)' }}>{t.sentTitle}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>{t.sentSubtitle.replace('{email}', `<b>${email}</b>`)}</p>
        <Button variant="ghost" onClick={handleResend} loading={resending} style={{ marginBottom: 'var(--space-4)' }}>
          {t.resend}
        </Button>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-base)' }}>
          <button type="button" onClick={onSwitchToLogin} style={{ color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', padding: 0 }}>{t.back}</button>
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <button type="button" onClick={onSwitchToLogin} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 'var(--space-7)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)' }}>
        <BackIcon size={16} />{t.back}
      </button>
      <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-xl)', display: 'grid', placeItems: 'center', marginBottom: 'var(--space-5)', color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}>
        <KeyIcon size={28} />
      </div>
      <h1 style={{ fontSize: 'var(--font-size-4xl)', lineHeight: 'var(--line-height-tight)', letterSpacing: 'var(--letter-spacing-tight)', marginBottom: 'var(--space-2)' }}>{t.title}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>{t.subtitle}</p>
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
      <Button type="submit" fullWidth loading={loading} style={{ marginTop: 'var(--space-2)' }}>
        {t.submit}
      </Button>
    </form>
  );
};