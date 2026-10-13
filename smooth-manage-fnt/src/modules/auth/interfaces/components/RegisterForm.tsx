import { useState, type FormEvent, type MouseEvent } from 'react';
import { FormField } from './ui/FormField';
import { Checkbox } from './ui/Checkbox';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { PasswordStrengthMeter } from './ui/PasswordStrengthMeter';
import { useAuth } from '../../application/hooks/useAuth';

interface FormErrors {
  rn?: string;
  re?: string;
  rp?: string;
  rc?: string;
  rt?: string;
}

interface RegisterFormProps {
  onSwitchView: (view: 'login') => void;
}

export function RegisterForm({ onSwitchView }: RegisterFormProps) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  };

  const calculateStrength = (pwd: string): number => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^\w\s]/.test(pwd) || pwd.length >= 14) score++;
    return Math.min(score, 4);
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'rn':
        if (!value) return 'Enter your name';
        if (value.length < 2) return 'Enter your name';
        return '';
      case 're':
        if (!value) return 'Enter your email';
        if (!validateEmail(value)) return 'Enter a valid email';
        return '';
      case 'rp':
        if (!value) return 'Enter a password';
        if (value.length < 8) return 'At least 8 characters';
        if (calculateStrength(value) < 2) return 'At least 8 characters, mixing letters and numbers';
        return '';
      case 'rc':
        if (!value) return 'Confirm your password';
        if (value !== password) return 'Passwords do not match';
        return '';
      case 'rt':
        if (!value) return 'You must accept the terms to continue';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (name: string, value: string) => {
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    switch (name) {
      case 'rn':
        setName(value);
        break;
      case 're':
        setEmail(value);
        break;
      case 'rp':
        setPassword(value);
        if (confirmPassword) {
          const confirmError = validateField('rc', confirmPassword);
          setErrors((prev) => ({ ...prev, rc: confirmError }));
        }
        break;
      case 'rc':
        setConfirmPassword(value);
        break;
    }
  };

  const handleBlur = (name: string) => {
    const values = { rn: name, re: email, rp: password, rc: confirmPassword, rt: acceptTerms ? 'true' : '' };
    const error = validateField(name, values[name as keyof typeof values]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleTermsChange = (checked: boolean) => {
    setAcceptTerms(checked);
    if (checked) {
      setErrors((prev) => ({ ...prev, rt: '' }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError('');

    const nameError = validateField('rn', name);
    const emailError = validateField('re', email);
    const passwordError = validateField('rp', password);
    const confirmError = validateField('rc', confirmPassword);
    const termsError = validateField('rt', acceptTerms ? 'true' : '');

    if (nameError || emailError || passwordError || confirmError || termsError) {
      setErrors({ rn: nameError, re: emailError, rp: passwordError, rc: confirmError, rt: termsError });
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name,
        email,
        password,
        confirmPassword,
        acceptTerms,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible((prev) => !prev);
  };

  const handleLogin = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onSwitchView('login');
  };

  return (
    <section id="v-register" className="view" role="region" aria-label="Create account">
      <h1>Create your account</h1>
      <p className="sub">Start organizing everything in one place. It's free.</p>

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="rn"
          label="Name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(value) => handleChange('rn', value)}
          onBlur={() => handleBlur('rn')}
          error={errors.rn}
          icon="user"
          autoComplete="name"
          required
        />

        <FormField
          id="re"
          label="Email"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(value) => handleChange('re', value)}
          onBlur={() => handleBlur('re')}
          error={errors.re}
          icon="mail"
          autoComplete="email"
          required
        />

        <div className="fld">
          <label htmlFor="rp" className="field-label">Password</label>
          <div className={`in ${errors.rp ? 'bad' : ''}`} role="group">
            <Icon name="lock" size={20} className="field-icon" aria-hidden="true" />
            <input
              id="rp"
              type={isPasswordVisible ? 'text' : 'password'}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => handleChange('rp', e.target.value)}
              onBlur={() => handleBlur('rp')}
              autoComplete="new-password"
              required
              aria-invalid={Boolean(errors.rp)}
              className="field-input"
            />
            <button
              type="button"
              className="eye"
              onClick={togglePasswordVisibility}
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              aria-pressed={isPasswordVisible}
            >
              <Icon name={isPasswordVisible ? 'eyeoff' : 'eye'} size={18} />
            </button>
          </div>
          <PasswordStrengthMeter password={password} />
          {errors.rp && <small className="err" role="alert">{errors.rp}</small>}
        </div>

        <FormField
          id="rc"
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(value) => handleChange('rc', value)}
          onBlur={() => handleBlur('rc')}
          error={errors.rc}
          icon="lock"
          showPasswordToggle
          isPasswordVisible={isConfirmPasswordVisible}
          onPasswordToggle={toggleConfirmPasswordVisibility}
          autoComplete="new-password"
          required
        />

        <div className="fld">
          <Checkbox
            id="rt"
            label={
              <>
                I agree to the <a href="#" className="terms-link">terms</a> and the <a href="#" className="terms-link">privacy policy</a>
              </>
            }
            checked={acceptTerms}
            onChange={handleTermsChange}
            error={errors.rt}
            required
          />
        </div>

        {submitError && (
          <div className="submit-error" role="alert">
            <Icon name="lock" size={14} />
            {submitError}
          </div>
        )}

        <Button type="submit" isLoading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="alt">
        Already have an account? <a href="#" onClick={handleLogin}>Sign in</a>
      </p>
    </section>
  );
}