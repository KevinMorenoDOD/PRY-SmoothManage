import type { InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function FormField({
  label,
  error,
  hint,
  required,
  children,
  className = "",
  style,
}: FormFieldProps) {
  const baseStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
    width: "100%",
    ...style,
  };

  return (
    <div className={className} style={baseStyles}>
      <label
        style={{
          fontSize: "0.8125rem",
          fontWeight: 500,
          color: "var(--color-text-primary)",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--color-danger)", marginLeft: "0.25rem" }}>*</span>
        )}
      </label>
      <div style={{ position: "relative" }}>{children}</div>
      {error && (
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--color-danger)",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </span>
      )}
      {hint && !error && (
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{hint}</span>
      )}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", style, ...rest } = props;
  return (
    <input
      className={className}
      style={{
        width: "100%",
        padding: "0.625rem 0.875rem",
        fontSize: "0.875rem",
        fontFamily: "inherit",
        color: "var(--color-text-primary)",
        backgroundColor: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "0.75rem",
        outline: "none",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        ...style,
      }}
      {...rest}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", style, ...rest } = props;
  return (
    <textarea
      className={className}
      style={{
        width: "100%",
        padding: "0.625rem 0.875rem",
        fontSize: "0.875rem",
        fontFamily: "inherit",
        color: "var(--color-text-primary)",
        backgroundColor: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "0.75rem",
        outline: "none",
        resize: "vertical",
        minHeight: "100px",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        ...style,
      }}
      {...rest}
    />
  );
}

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} />;
}