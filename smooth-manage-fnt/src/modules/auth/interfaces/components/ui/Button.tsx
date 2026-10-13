import { Icon } from './Icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', isLoading = false, children, disabled, className = '', ...props }: ButtonProps) {
  const baseClasses = 'btn';
  const variantClasses = variant === 'primary' ? '' : 'g';
  const loadingClasses = isLoading ? 'ld' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${loadingClasses} ${className}`.trim()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="sr-only">Loading...</span>
          <Icon name="check" size={21} className="animate-spin" />
        </>
      ) : (
        <span>{children}</span>
      )}
    </button>
  );
}