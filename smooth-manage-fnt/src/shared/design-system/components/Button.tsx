import React from 'react';
import '../../design-system/tokens/index.css';

export type ButtonVariant = 'primary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      children,
      className = '',
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseStyles: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-3)',
      border: 0,
      borderRadius: 'var(--radius-field)',
      fontFamily: 'var(--font-family)',
      fontWeight: 'var(--font-weight-semibold)',
      fontSize: 'var(--font-size-base)',
      lineHeight: 1,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
      width: fullWidth ? '100%' : 'auto',
      opacity: isDisabled ? 0.5 : 1,
    };

    const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: {
        color: '#fff',
        background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
        boxShadow: '0 8px 22px -8px var(--accent)',
      },
      ghost: {
        color: 'var(--text)',
        background: 'none',
        border: '1px solid var(--border)',
        boxShadow: 'none',
      },
      danger: {
        color: '#fff',
        background: 'linear-gradient(135deg, var(--danger), #c04a42)',
        boxShadow: '0 8px 22px -8px var(--danger)',
      },
    };

    const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
      sm: {
        height: '40px',
        padding: '0 var(--space-6)',
        fontSize: 'var(--font-size-sm)',
      },
      md: {
        height: '50px',
        padding: '0 var(--space-8)',
        fontSize: 'var(--font-size-base)',
      },
      lg: {
        height: '56px',
        padding: '0 var(--space-10)',
        fontSize: 'var(--font-size-lg)',
      },
    };

    const mergedStyle: React.CSSProperties = {
      ...baseStyles,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...style,
    };

    return (
      <button
        ref={ref}
        style={mergedStyle}
        className={className}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span
            style={{
              position: 'absolute',
              width: '21px',
              height: '21px',
              border: '2.5px solid #fff6',
              borderTopColor: '#fff',
              borderRadius: '50%',
              animation: 'sp 0.7s linear infinite',
            }}
            aria-hidden="true"
          />
        )}
        <span style={{ opacity: loading ? 0 : 1 }}>{children}</span>
        <style>{`
          @keyframes sp {
            to { transform: rotate(1turn); }
          }
        `}</style>
      </button>
    );
  }
);

Button.displayName = 'Button';