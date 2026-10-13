import { useState, type FormEvent, type MouseEvent } from 'react';
import { FormField } from './ui/FormField';
import { Checkbox } from './ui/Checkbox';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { useAuth } from '../../application/hooks/useAuth';

interface FormErrors {
  le?: string;
  lp?: string;
}

interface LoginFormProps {
  onSwitchView: (view: 'register' | 'forgot') => void;
}

export function LoginForm({ onSwitchView }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'le':
        if (!value) return 'Enter your email';
        if (!validateEmail(value)) return 'Enter a valid email';
        return '';
      case 'lp':
        if (!value) return 'Enter your password';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (name: string, value: string) => {
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    switch (name) {
      case 'le':
        setEmail(value);
        break;
      case 'lp':
        setPassword(value);
        break;
    }
  };

  const handleBlur = (name: string) => {
    const value = name === 'le' ? email : password;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError('');

    const emailError = validateField('le', email);
    const passwordError = validateField('lp', password);

    if (emailError || passwordError) {
      setErrors({ le: emailError, lp: passwordError });
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email,
        password,
        rememberMe,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid email or password';
      setSubmitError(message);
      setErrors({ le: 'Invalid email or password', lp: 'Invalid email or password' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handleForgotPassword = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onSwitchView('forgot');
  };

  const handleRegister = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onSwitchView('register');
  };

  return (
    <section id="v-login" className="view" role="region" aria-label="Sign in">
      <h1>Welcome back</h1>
      <p className="sub">Sign in to pick up your notes, tasks and projects where you left off.</p>

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="le"
          label="Email"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(value) => handleChange('le', value)}
          onBlur={() => handleBlur('le')}
          error={errors.le}
          icon="mail"
          autoComplete="email"
          required
        />

        <FormField
          id="lp"
          label="Password"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(value) => handleChange('lp', value)}
          onBlur={() => handleBlur('lp')}
          error={errors.lp}
          icon="lock"
          showPasswordToggle
          isPasswordVisible={isPasswordVisible}
          onPasswordToggle={togglePasswordVisibility}
          autoComplete="current-password"
          required
        />

        <div className="row">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onChange={setRememberMe}
            label="Remember me"
          />
          <a href="#" className="forgot-link" onClick={handleForgotPassword}>
            Forgot password?
          </a>
        </div>

        {submitError && (
          <div className="submit-error" role="alert">
            <Icon name="lock" size={14} />
            {submitError}
          </div>
        )}

        <Button type="submit" isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="alt">
        Don't have an account? <a href="#" onClick={handleRegister}>Sign up</a>
      </p>
    </section>
  );
}