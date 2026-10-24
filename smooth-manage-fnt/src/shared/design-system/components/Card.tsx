import React from 'react';
import '../../design-system/tokens/index.css';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'colored';
  projectColor?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  projectColor,
  padding = 'md',
  onClick,
}) => {
  const paddingStyles: Record<string, React.CSSProperties> = {
    none: {},
    sm: { padding: 'var(--space-4)' },
    md: { padding: 'var(--space-6)' },
    lg: { padding: 'var(--space-8)' },
  };

  const baseStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-container)',
    ...paddingStyles[padding],
    cursor: onClick ? 'pointer' : undefined,
    ...(variant === 'colored' && projectColor ? { borderTop: `4px solid ${projectColor}` } : {}),
  };

  return (
    <div
      className={className}
      style={baseStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }} : undefined}
    >
      {children}
    </div>
  );
};