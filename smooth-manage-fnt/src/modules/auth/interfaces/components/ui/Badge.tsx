import { Icon } from './Icon';

interface BadgeProps {
  icon: 'key' | 'mail' | 'check';
  className?: string;
}

export function Badge({ icon, className = '' }: BadgeProps) {
  return (
    <div className={`badge ${className}`} aria-hidden="true">
      <Icon name={icon} size={28} />
    </div>
  );
}