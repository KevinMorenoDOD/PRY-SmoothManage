import React from 'react';
import '../../design-system/tokens/index.css';

export interface TabProps {
  label: string;
  icon?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  isActive?: boolean;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export const Tab: React.FC<TabProps> = ({
  label,
  icon,
  closable = false,
  onClose,
  isActive = false,
  onClick,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 'var(--radius-pill)',
    fontFamily: 'var(--font-family)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-semibold)',
    lineHeight: 1,
    color: isActive ? 'var(--text)' : 'var(--text-muted)',
    background: isActive ? 'var(--accent-soft)' : 'transparent',
    border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all var(--transition-fast)',
    whiteSpace: 'nowrap',
    maxWidth: '200px',
  };

  const closeButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    border: 0,
    background: 'currentColor',
    borderRadius: 'var(--radius-pill)',
    color: 'inherit',
    opacity: 0.5,
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
    marginLeft: 'var(--space-1)',
    flexShrink: 0,
    transition: 'opacity var(--transition-fast)',
  };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={onClick}
      style={baseStyle}
    >
      {icon && <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      {closable && onClose && (
        <button
          type="button"
          style={closeButtonStyle}
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-label={`Close ${label}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
      <style>{`button:hover { opacity: 0.8; }`}</style>
    </button>
  );
};

export interface TabsBarProps {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode; closable?: boolean }>;
  activeTab: string;
  onChange: (id: string) => void;
  onClose?: (id: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  className?: string;
}

export const TabsBar: React.FC<TabsBarProps> = ({
  tabs,
  activeTab,
  onChange,
  onClose,
  onReorder,
  className = '',
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-3) var(--space-4)',
    borderBottom: '1px solid var(--border)',
    overflowX: 'auto',
    flexWrap: 'nowrap',
    background: 'var(--surface)',
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 'var(--radius-pill)',
    fontFamily: 'var(--font-family)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-semibold)',
    lineHeight: 1,
    color: isActive ? 'var(--text)' : 'var(--text-muted)',
    background: isActive ? 'var(--accent-soft)' : 'transparent',
    border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    whiteSpace: 'nowrap',
    maxWidth: '200px',
  });

  const closeButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    border: 0,
    background: 'currentColor',
    borderRadius: 'var(--radius-pill)',
    color: 'inherit',
    opacity: 0.5,
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
    marginLeft: 'var(--space-1)',
    flexShrink: 0,
    transition: 'opacity var(--transition-fast)',
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (fromIndex !== targetIndex && onReorder) {
      onReorder(fromIndex, targetIndex);
    }
  };

  return (
    <div className={className} style={containerStyle} role="tablist">
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          draggable={!!onReorder}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          onClick={() => onChange(tab.id)}
          style={tabStyle(activeTab === tab.id)}
        >
          {tab.icon && <span style={{ display: 'flex', flexShrink: 0 }}>{tab.icon}</span>}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{tab.label}</span>
          {tab.closable && onClose && (
            <button
              type="button"
              style={closeButtonStyle}
              onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
              aria-label={`Close ${tab.label}`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </button>
      ))}
    </div>
  );
};