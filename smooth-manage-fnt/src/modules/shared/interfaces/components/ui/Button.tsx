import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  isLoading,
  className = "",
  disabled,
  style,
  ...props
}: ButtonProps) {
  const baseStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    fontWeight: 600,
    borderRadius: "0.75rem",
    border: "1px solid transparent",
    transition: "all 0.15s ease",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
    fontSize: "inherit",
    ...style,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: "var(--color-accent-primary)",
      color: "#fff",
      borderColor: "var(--color-accent-primary)",
    },
    secondary: {
      backgroundColor: "var(--color-bg-surface)",
      color: "var(--color-text-primary)",
      borderColor: "var(--color-border)",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "var(--color-text-primary)",
      borderColor: "transparent",
    },
    danger: {
      backgroundColor: "var(--color-danger)",
      color: "#fff",
      borderColor: "var(--color-danger)",
    },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: "0.375rem 0.75rem", fontSize: "0.8125rem" },
    md: { padding: "0.5rem 1rem", fontSize: "0.875rem" },
    lg: { padding: "0.75rem 1.5rem", fontSize: "1rem" },
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={className}
      disabled={isDisabled}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...sizeStyles[size],
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
      }}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            strokeLinecap="round"
          />
        </svg>
      )}
      {children}
    </button>
  );
}