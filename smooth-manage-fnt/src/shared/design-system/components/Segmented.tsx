import React from 'react';
import '../../design-system/tokens/index.css';

export interface SegmentedProps {
  options: Array<{ value: string; label: string; icon?: React.ReactNode }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: 'sm' | 'md';
  orientation?: 'horizontal' | 'vertical';
}

export const Segmented: React.FC<SegmentedProps> = ({
  options,
  value,
  onChange,
  className = '',
  size = 'md',
  orientation = 'horizontal',
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-pill)',
    padding: '2px',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
  };

  const optionStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: '4px 10px',
      fontSize: 'var(--font-size-xs)',
      gap: '4px',
    },
    md: {
      padding: '6px 14px',
      fontSize: 'var(--font-size-sm)',
      gap: '6px',
    },
  };

  const activeStyle: React.CSSProperties = {
    background: 'var(--surface)',
    color: 'var(--text)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  const inactiveStyle: React.CSSProperties = {
    background: 'transparent',
    color: 'var(--text-muted)',
  };

  return (
    <div className={className} style={containerStyle} role="group" aria-orientation={orientation}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
            border: 0,
            borderRadius: 'var(--radius-pill)',
            fontFamily: 'var(--font-family)',
            fontWeight: 'var(--font-weight-semibold)',
            lineHeight: 1,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            ...optionStyles[size],
            ...(value === option.value ? activeStyle : inactiveStyle),
          }}
        >
          {option.icon}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
};