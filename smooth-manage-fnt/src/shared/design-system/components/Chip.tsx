import React from 'react';
import '../../design-system/tokens/index.css';

export type ChipVariant = 'neutral' | 'accent' | 'danger' | 'warning';

export interface ChipProps {
  children: React.ReactNode;
  variant?: ChipVariant;
  className?: string;
  onClick?: () => void;
  onRemove?: () => void;
  removable?: boolean;
  size?: 'sm' | 'md';
}

const variantStyles: Record<ChipVariant, React.CSSProperties> = {
  neutral: {
    background: 'var(--surface-2)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  },
  accent: {
    background: 'var(--accent-soft)',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
  },
  danger: {
    background: '#d65c5220',
    color: 'var(--danger)',
    border: '1px solid var(--danger)',
  },
  warning: {
    background: '#b9871f20',
    color: 'var(--warning)',
    border: '1px solid var(--warning)',
  },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: {
    padding: '2px 8px',
    fontSize: 'var(--font-size-xs)',
    borderRadius: 'var(--radius-pill)',
    gap: '4px',
  },
  md: {
    padding: '4px 12px',
    fontSize: 'var(--font-size-sm)',
    borderRadius: 'var(--radius-pill)',
    gap: '6px',
  },
};

export const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'neutral',
  className = '',
  onClick,
  onRemove,
  removable = false,
  size = 'md',
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'var(--font-family)',
    fontWeight: 'var(--font-weight-semibold)',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    ...variantStyles[variant],
    ...sizeStyles[size],
    cursor: onClick ? 'pointer' : undefined,
  };

  const removeButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    border: 0,
    background: 'currentColor',
    borderRadius: 'var(--radius-pill)',
    color: 'inherit',
    opacity: 0.6,
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
    marginLeft: 'var(--space-1)',
    flexShrink: 0,
    transition: 'opacity var(--transition-fast)',
  };

  return (
    <span className={className} style={baseStyle} onClick={onClick}>
      {children}
      {removable && onRemove && (
        <button
          type="button"
          style={removeButtonStyle}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label="Remove"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
      <style>{`button:hover { opacity: 1; }`}</style>
    </span>
  );
};