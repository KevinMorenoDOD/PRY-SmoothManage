import { Icon } from './Icon';

interface BackLinkProps {
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

export function BackLink({ onClick, className = '' }: BackLinkProps) {
  return (
    <a
      href="#"
      className={`back ${className}`}
      onClick={onClick}
    >
      <Icon name="back" size={16} />
      Back
    </a>
  );
}