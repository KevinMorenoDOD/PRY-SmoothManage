import { useId } from 'react';
import { Icon } from './Icon';

interface FormFieldProps {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password';
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  icon: 'mail' | 'lock' | 'user';
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onPasswordToggle?: () => void;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
}

export function FormField({
  id: providedId,
  label,
  type,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  icon,
  showPasswordToggle = false,
  isPasswordVisible = false,
  onPasswordToggle,
  autoComplete,
  disabled = false,
  required = false,
}: FormFieldProps) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const errorId = `${id}-error`;
  const hasError = Boolean(error);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const inputType = type === 'password' && isPasswordVisible ? 'text' : type;

  return (
    <div className="fld">
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      <div
        className={`in ${hasError ? 'bad' : ''} ${disabled ? 'opacity-50' : ''}`}
        role="group"
      >
        <Icon name={icon} size={20} className="field-icon" aria-hidden="true" />
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className="field-input"
        />
        {showPasswordToggle && onPasswordToggle && (
          <button
            type="button"
            className="eye"
            onClick={onPasswordToggle}
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={isPasswordVisible}
          >
            <Icon name={isPasswordVisible ? 'eyeoff' : 'eye'} size={18} />
          </button>
        )}
      </div>
      {error && (
        <small id={errorId} className="err" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}