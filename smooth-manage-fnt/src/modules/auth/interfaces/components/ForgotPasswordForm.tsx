import { useState, type FormEvent, type MouseEvent } from 'react';
import { FormField } from './ui/FormField';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { Badge } from './ui/Badge';
import { BackLink } from './ui/BackLink';
import { useAuth } from '../../application/hooks/useAuth';

interface FormErrors {
  fe?: string;
}

interface ForgotPasswordFormProps {
  onSwitchView: (view: 'login') => void;
}

export function ForgotPasswordForm({ onSwitchView }: ForgotPasswordFormProps) {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [step, setStep] = useState<'form' | 'sent'>('form');

  const validateEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  };

  const validateField = (name: string, value: string): string => {
    if (name === 'fe') {
      if (!value) return 'Enter your email';
      if (!validateEmail(value)) return 'Enter a valid email';
    }
    return '';
  };

  const handleChange = (name: string, value: string) => {
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
    if (name === 'fe') setEmail(value);
  };

  const handleBlur = (name: string) => {
    const error = validateField(name, email);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError('');

    const emailError = validateField('fe', email);

    if (emailError) {
      setErrors({ fe: emailError });
      return;
    }

    setIsSubmitting(true);

    try {
      await forgotPassword({ email });
      setStep('sent');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset link. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsSubmitting(true);
    try {
      await forgotPassword({ email });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend link. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (step === 'sent') {
      setStep('form');
    } else {
      onSwitchView('login');
    }
  };

  const handleLogin = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onSwitchView('login');
  };

  if (step === 'sent') {
    return (
      <section id="v-forgot-sent" className="view" role="region" aria-label="Check your email">
        <BackLink onClick={handleBack} />
        <Badge icon="mail" />
        <h1>Check your email</h1>
        <p className="sub">
          We sent a recovery link to <b id="sent-email">{email}</b>. It can take a couple of minutes; check your spam folder too.
        </p>

        <div id="fsent">
          <Button variant="ghost" id="rs" onClick={handleResend} disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Resend link'}
          </Button>
        </div>

        <p className="alt">
          <a href="#" onClick={handleLogin}>Back to sign in</a>
        </p>
      </section>
    );
  }

  return (
    <section id="v-forgot" className="view" role="region" aria-label="Forgot password">
      <BackLink onClick={handleBack} />
      <Badge icon="key" />
      <h1>Forgot your password?</h1>
      <p className="sub">No worries. Enter your email and we'll send you a link to create a new one.</p>

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="fe"
          label="Email"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(value) => handleChange('fe', value)}
          onBlur={() => handleBlur('fe')}
          error={errors.fe}
          icon="mail"
          autoComplete="email"
          required
        />

        {submitError && (
          <div className="submit-error" role="alert">
            <Icon name="lock" size={14} />
            {submitError}
          </div>
        )}

        <Button type="submit" isLoading={isSubmitting} style={{ marginTop: '6px' }}>
          Send reset link
        </Button>
      </form>
    </section>
  );
}