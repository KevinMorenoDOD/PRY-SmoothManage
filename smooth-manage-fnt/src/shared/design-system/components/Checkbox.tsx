import React, { forwardRef, useId } from 'react';
import '../../design-system/tokens/index.css';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  children?: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, children, className = '', id: providedId, disabled, required, style, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;

    const checkboxStyle: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 'var(--font-size-base)',
      lineHeight: 1.3,
      color: disabled ? 'var(--text-muted)' : 'var(--text)',
      opacity: disabled ? 0.6 : 1,
    };

    const boxStyle: React.CSSProperties = {
      width: '18px',
      height: '18px',
      borderRadius: 'var(--radius-sm)',
      border: '1.5px solid var(--border)',
      background: 'var(--surface)',
      flexShrink: 0,
      display: 'grid',
      placeItems: 'center',
      transition: 'background-color var(--transition-fast), border-color var(--transition-fast)',
    };

    const checkmarkStyle: React.CSSProperties = {
      width: '5px',
      height: '9px',
      border: 'solid #fff',
      borderWidth: '0 2px 2px 0',
      transform: 'rotate(45deg) translate(-1px, -1px)',
    };

    const mergedStyle = { ...checkboxStyle, ...style };

    return (
      <label className={className} style={mergedStyle}>
        <input
          ref={ref}
          type="checkbox"
          id={id}
          disabled={disabled}
          required={required}
          style={{
            position: 'absolute',
            opacity: 0,
            width: '18px',
            height: '18px',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          {...props}
        />
        <i
          style={{
            ...boxStyle,
            ...(props.checked ? { background: 'var(--accent)', borderColor: 'var(--accent)' } : {}),
          }}
        >
          {props.checked && <span style={checkmarkStyle} />}
        </i>
        <span>{label}</span>
        {children && <span>{children}</span>}
        <style>{`
          input:focus-visible + i {
            box-shadow: 0 0 0 4px var(--accent-soft);
          }
        `}</style>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';