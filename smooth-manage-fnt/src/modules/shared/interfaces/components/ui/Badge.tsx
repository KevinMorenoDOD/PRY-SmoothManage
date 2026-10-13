import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "accent" | "danger" | "success";
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({
  children,
  variant = "default",
  className = "",
  style,
}: BadgeProps) {
  const baseStyles: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.125rem 0.5rem",
    fontSize: "0.6875rem",
    fontWeight: 700,
    borderRadius: "9999px",
    whiteSpace: "nowrap",
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: "var(--color-bg-elevated)",
      color: "var(--color-text-muted)",
      border: "1px solid var(--color-border)",
    },
    accent: {
      backgroundColor: "var(--color-accent-light)",
      color: "var(--color-accent-primary)",
    },
    danger: {
      backgroundColor: "var(--color-danger-light)",
      color: "var(--color-danger)",
    },
    success: {
      backgroundColor: "var(--color-success-light)",
      color: "var(--color-success)",
    },
  };

  return (
    <span
      className={className}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}