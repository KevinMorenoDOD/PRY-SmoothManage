import React from 'react';
import '../../design-system/tokens/index.css';

export interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { height: '4px' },
  md: { height: '6px' },
  lg: { height: '8px' },
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className = '',
  size = 'md',
  showLabel = false,
  label,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--surface-2)',
    borderRadius: 'var(--radius-pill)',
    overflow: 'hidden',
    ...sizeStyles[size],
  };

  const barStyle: React.CSSProperties = {
    width: `${percentage}%`,
    height: '100%',
    background: 'var(--accent)',
    borderRadius: 'var(--radius-pill)',
    transition: 'width var(--transition-normal)',
  };

  return (
    <div className={className} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
      <div style={containerStyle}>
        <div style={barStyle} />
      </div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
          <span>{label || ''}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
};