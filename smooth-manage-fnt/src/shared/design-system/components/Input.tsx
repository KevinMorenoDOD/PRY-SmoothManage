import React, { forwardRef, useId, useState } from 'react';
import '../../design-system/tokens/index.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  iconPosition?: 'start' | 'end';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      type = 'text',
      placeholder,
      error,
      icon,
      showPasswordToggle = false,
      iconPosition = 'start',
      id: providedId,
      disabled,
      required,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const hasError = Boolean(error);

    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
      setFocused(true);
      props.onFocus?.(e as React.FocusEvent<HTMLInputElement>);
    };

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      setFocused(false);
      props.onBlur?.(e as React.FocusEvent<HTMLInputElement>);
    };

    const handleEyeClick = () => {
      setShowPassword(!showPassword);
    };

    const inputWrapperStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      height: '48px',
      padding: '0 var(--space-4)',
      background: 'var(--surface)',
      border: `1px solid ${hasError ? 'var(--danger)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-field)',
      color: 'var(--text-muted)',
      transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
      boxShadow: hasError ? '0 0 0 4px #d65c5222' : 'none',
    };

const inputWrapperFocusStyle: React.CSSProperties = {
  border: '1px solid var(--accent)',
  boxShadow: '0 0 0 4px var(--accent-soft)',
  color: 'var(--accent)',
};

    const inputStyle: React.CSSProperties = {
      flex: 1,
      minWidth: 0,
      border: 0,
      background: 'none',
      outline: 0,
      color: 'var(--text)',
      fontFamily: 'var(--font-family)',
      fontSize: 'var(--font-size-base)',
      lineHeight: 1.5,
    };

    const eyeButtonStyle: React.CSSProperties = {
      border: 0,
      background: 'none',
      color: 'var(--text-muted)',
      display: 'flex',
      padding: 'var(--space-1)',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer',
    };

    const mergedWrapperStyle = focused
      ? { ...inputWrapperStyle, ...inputWrapperFocusStyle }
      : inputWrapperStyle;

    return (
      <div className="field">
        <label
          htmlFor={id}
          style={{
            display: 'block',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            marginBottom: 'var(--space-2)',
            color: 'var(--text)',
          }}
        >
          {label}
        </label>
        <div
          className={`in ${focused ? 'focused' : ''} ${hasError ? 'bad' : ''}`}
          style={mergedWrapperStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          {iconPosition === 'start' && icon && (
            <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>
          )}
          <input
            ref={ref}
            id={id}
            type={showPasswordToggle && showPassword ? 'text' : type}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : ariaDescribedBy}
            style={inputStyle}
            onChange={props.onChange}
            onBlur={props.onBlur}
            {...props}
          />
          {showPasswordToggle && (
            <button
              type="button"
              className="eye"
              style={eyeButtonStyle}
              onClick={handleEyeClick}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="m3 3 18 18" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
          {iconPosition === 'end' && icon && (
            <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>
          )}
        </div>
        {error && (
          <small
            id={errorId}
            className="err"
            style={{
              display: 'block',
              color: 'var(--danger)',
              fontSize: 'var(--font-size-sm)',
              marginTop: 'var(--space-1)',
              minHeight: '1.2em',
            }}
          >
            {error}
          </small>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';