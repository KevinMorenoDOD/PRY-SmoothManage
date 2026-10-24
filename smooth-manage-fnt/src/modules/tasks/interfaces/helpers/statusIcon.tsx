import type { ReactNode } from 'react';

export type TaskStatus = 'pend' | 'prog' | 'blk' | 'done';

export const statusIcon = (s: TaskStatus, size = 14): ReactNode => {
  const colorFor = (status: TaskStatus) =>
    status === 'pend'
      ? 'var(--mu)'
      : status === 'prog'
        ? 'var(--am)'
        : status === 'blk'
          ? 'var(--rd)'
          : 'var(--ac)';
  const circle = (fill?: string) => (
    <circle cx="12" cy="12" r="8.5" fill={fill} stroke={colorFor(s)} strokeWidth="2" />
  );

  let content: ReactNode;
  switch (s) {
    case 'prog':
      content = (
        <>
          {circle('none')}
          <path d="M12 6.5a5.5 5.5 0 0 1 0 11z" fill="var(--am)" />
        </>
      );
      break;
    case 'blk':
      content = (
        <>
          {circle('none')}
          <path d="M8.5 12h7" stroke="var(--rd)" strokeWidth="2" strokeLinecap="round" />
        </>
      );
      break;
    case 'done':
      content = (
        <>
          <circle cx="12" cy="12" r="9.5" fill="var(--ac)" />
          <path
            d="m8 12.5 3 3 5-6"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
      break;
    default:
      content = circle('none');
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: 'none' }}>
      {content}
    </svg>
  );
};
