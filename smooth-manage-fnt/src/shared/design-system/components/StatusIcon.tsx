import React from 'react';
import '../../design-system/tokens/index.css';

export type StatusVariant = 'pending' | 'in-progress' | 'blocked' | 'done';
export type StatusSize = 'xs' | 'sm' | 'md' | 'lg';

export interface StatusIconProps {
  variant: StatusVariant;
  size?: StatusSize;
  className?: string;
  title?: string;
}

const sizeStyles: Record<StatusSize, { size: string; strokeWidth: string }> = {
  xs: { size: '12px', strokeWidth: '2.5' },
  sm: { size: '14px', strokeWidth: '2' },
  md: { size: '16px', strokeWidth: '2' },
  lg: { size: '20px', strokeWidth: '1.5' },
};

const icons: Record<StatusVariant, React.ReactNode> = {
  pending: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  'in-progress': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  ),
  blocked: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l8 0" />
    </svg>
  ),
  done: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
};

const colors: Record<StatusVariant, string> = {
  pending: 'var(--text-muted)',
  'in-progress': 'var(--warning)',
  blocked: 'var(--danger)',
  done: 'var(--accent)',
};

export const StatusIcon: React.FC<StatusIconProps> = ({
  variant,
  size = 'md',
  className = '',
  title,
}) => {
  const { size: iconSize, strokeWidth } = sizeStyles[size];
  const color = colors[variant];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        width: iconSize,
        height: iconSize,
        color,
      }}
      title={title}
      role="img"
      aria-label={title || variant}
    >
      {React.cloneElement(icons[variant] as React.ReactElement, {
        width: iconSize,
        height: iconSize,
        strokeWidth,
      })}
    </span>
  );
};

export type PriorityVariant = 'low' | 'medium' | 'high';

export interface PriorityIconProps {
  variant: PriorityVariant;
  size?: StatusSize;
  className?: string;
}

const priorityColors: Record<PriorityVariant, string> = {
  low: 'var(--text-muted)',
  medium: 'var(--warning)',
  high: 'var(--danger)',
};

export const PriorityIcon: React.FC<PriorityIconProps> = ({
  variant,
  size = 'md',
  className = '',
}) => {
  const { size: iconSize, strokeWidth } = sizeStyles[size];
  const color = priorityColors[variant];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        width: iconSize,
        height: iconSize,
        color,
      }}
      role="img"
      aria-label={variant}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5" />
      </svg>
    </span>
  );
};