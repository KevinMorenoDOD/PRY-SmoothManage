import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Checkbox, ProgressBar } from '@shared/design-system';
import { MailIcon, LockIcon, UserIcon } from '@shared/design-system/icons';
import { useAuthViewModel } from '../view-model/useAuth';
import { authMessages } from '../i18n/en';
import type { AuthUseCasePort } from '../../application/port/in/AuthUseCase';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin, onSuccess }) => {
  const authUseCase = window.__AUTH_USE_CASE__ as AuthUseCasePort;
  const { register, loading, fieldErrors, clearFieldError } = useAuthViewModel(authUseCase);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const t = authMessages.register;

  const passwordStrength = calculateStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await register({ name, email, password, confirmPassword, acceptTerms });
    if (ok) onSuccess?.();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    clearFieldError('name');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    clearFieldError('email');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    clearFieldError('password');
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    clearFieldError('confirmPassword');
  };

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAcceptTerms(e.target.checked);
    clearFieldError('terms');
  };

  useEffect(() => {
    formRef.current?.querySelector('input')?.focus();
  }, []);

  const termsLabel = `${t.terms.replace('{terms}', '').replace('{privacy}', '')} ${t.termsLink} ${t.terms.split('{privacy}')[1].split('}')[0]} ${t.privacyLink}`;

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <Input
        label={t.nameLabel}
        type="text"
        placeholder={t.namePlaceholder}
        value={name}
        onChange={handleNameChange}
        error={fieldErrors.name}
        icon={<UserIcon size={18} />}
        autoComplete="name"
        required
      />
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
      <div className="fld">
        <Input
          id="rp"
          label={t.passwordLabel}
          type="password"
          placeholder={t.passwordPlaceholder}
          value={password}
          onChange={handlePasswordChange}
          error={fieldErrors.password}
          icon={<LockIcon size={18} />}
          showPasswordToggle={true}
          autoComplete="new-password"
          required
        />
        <ProgressBar
          value={passwordStrength.score}
          max={4}
          size="sm"
        />
        <small style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)', textAlign: 'right' }}>
          {passwordStrength.label}
        </small>
      </div>
      <Input
        label={t.confirmPasswordLabel}
        type="password"
        placeholder={t.confirmPasswordPlaceholder}
        value={confirmPassword}
        onChange={handleConfirmChange}
        error={fieldErrors.confirmPassword}
        icon={<LockIcon size={18} />}
        showPasswordToggle={true}
        autoComplete="new-password"
        required
      />
      <div className="fld">
        <Checkbox
          checked={acceptTerms}
          onChange={handleTermsChange}
          label={termsLabel}
        />
        {fieldErrors.terms && (
          <small style={{ display: 'block', color: 'var(--danger)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
            {fieldErrors.terms}
          </small>
        )}
      </div>
      <Button type="submit" fullWidth loading={loading}>
        {t.submit}
      </Button>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 'var(--space-6)', fontSize: 'var(--font-size-base)' }}>
        {t.hasAccount} <button type="button" onClick={onSwitchToLogin} style={{ color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', padding: 0 }}>{t.signIn}</button>
      </p>
    </form>
  );
};

function calculateStrength(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^\w\s]/.test(password) || password.length >= 14) score++;
  
  const labels = ['', 'Very weak', 'Weak', 'Good', 'Strong'];
  return { score, label: labels[score] };
}