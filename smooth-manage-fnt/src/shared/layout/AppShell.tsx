import React from 'react';
import { ChevronRightIcon, ChevronLeftIcon, XIcon } from '@shared/design-system/icons';
import '../../design-system/tokens/index.css';

interface AppShellProps {
  navBar: React.ReactNode;
  sidePanel: React.ReactNode;
  tabsBar: React.ReactNode;
  children: React.ReactNode;
  sidePanelOpen?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  navBar,
  sidePanel,
  tabsBar,
  children,
  sidePanelOpen = true,
}) => {
  const shellStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    gridTemplateColumns: 'var(--navbar-width-compact) 1fr',
    minHeight: '100vh',
    background: 'var(--bg)',
  };

  const mainStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: sidePanelOpen ? 'var(--sidepanel-width-default) 1fr' : '0 1fr',
    gridTemplateRows: 'auto 1fr',
    overflow: 'hidden',
    transition: 'grid-template-columns var(--transition-normal)',
  };

  const sidePanelStyle: React.CSSProperties = {
    overflow: 'auto',
    borderRight: '1px solid var(--border)',
    background: 'var(--surface)',
    transition: 'width var(--transition-normal), opacity var(--transition-fast)',
    ...(!sidePanelOpen ? { width: 0, opacity: 0, pointerEvents: 'none' } : {}),
  };

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
  };

  return (
    <div style={shellStyle}>
      <nav style={{ gridColumn: '1 / -1' }}>{navBar}</nav>
      <main style={mainStyle}>
        <aside style={sidePanelStyle}>{sidePanel}</aside>
        <div style={contentStyle}>
          {tabsBar}
          <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-6)' }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export interface NavBarProps {
  items: Array<{ id: string; label: string; icon: React.ReactNode; badge?: number }>;
  activeItem: string;
  onItemClick: (id: string) => void;
  onToggle?: () => void;
  expanded?: boolean;
  user?: { name: string; avatar?: React.ReactNode };
  onUserMenu?: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({
  items,
  activeItem,
  onItemClick,
  onToggle,
  expanded = false,
  user,
  onUserMenu,
}) => {
  const navStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    width: expanded ? 'var(--navbar-width-expanded)' : 'var(--navbar-width-compact)',
    transition: 'width var(--transition-normal)',
    overflow: 'hidden',
  };

  const itemStyle = (isActive: boolean): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--space-3) var(--space-4)',
      borderRadius: 'var(--radius-lg)',
      color: isActive ? 'var(--text)' : 'var(--text-muted)',
      background: isActive ? 'var(--accent-soft)' : 'transparent',
      border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
      fontFamily: 'var(--font-family)',
      fontSize: 'var(--font-size-sm)',
      fontWeight: 'var(--font-weight-medium)',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'all var(--transition-fast)',
      justifyContent: !expanded && !isActive ? 'center' : 'flex-start',
    };

    if (!expanded && !isActive) {
      return { ...base, padding: 'var(--space-3)' };
    }
    return base;
  };

  const badgeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '18px',
    height: '18px',
    padding: '0 6px',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--accent)',
    background: 'var(--accent-soft)',
    border: '1px solid var(--accent)',
    borderRadius: 'var(--radius-pill)',
    marginLeft: 'auto',
  };

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-4)',
    fontWeight: 'var(--font-weight-bold)',
    fontSize: 'var(--font-size-lg)',
    color: 'var(--text)',
    borderBottom: '1px solid var(--border)',
    justifyContent: !expanded ? 'center' : 'flex-start',
  };

  const logoMarkStyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-lg)',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--accent)',
    background: 'var(--accent-soft)',
    border: '1px solid var(--accent)',
    fontWeight: 'var(--font-weight-bold)',
    fontSize: 'var(--font-size-lg)',
    flexShrink: 0,
  };

  const userStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-4)',
    marginTop: 'auto',
    borderTop: '1px solid var(--border)',
    cursor: 'pointer',
    justifyContent: !expanded ? 'center' : 'flex-start',
  };

  const avatarStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-pill)',
    background: 'var(--accent-soft)',
    color: 'var(--accent)',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 'var(--font-weight-semibold)',
    fontSize: 'var(--font-size-sm)',
    flexShrink: 0,
  };

  return (
    <nav style={navStyle} role="navigation" aria-label="Main navigation">
      <div style={logoStyle}>
        <div style={logoMarkStyle}>S</div>
        {expanded && <span>SmoothManage</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', padding: 'var(--space-3)', flex: 1 }}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            aria-selected={activeItem === item.id}
            onClick={() => onItemClick(item.id)}
            style={itemStyle(activeItem === item.id)}
          >
            <span style={{ display: 'flex', flexShrink: 0 }}>{item.icon}</span>
            {expanded && <span>{item.label}</span>}
            {expanded && item.badge && <span style={badgeStyle}>{item.badge}</span>}
          </button>
        ))}
      </div>
      {onToggle && expanded && (
        <button
          type="button"
          onClick={onToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: 'var(--space-3)',
            border: 0,
            background: 'transparent',
            color: 'var(--text-muted)',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-base)',
          }}
          aria-label="Expand navigation"
        >
          <ChevronRightIcon size={20} />
        </button>
      )}
      {!expanded && onToggle && (
        <button
          type="button"
          onClick={onToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: 'var(--space-3)',
            border: 0,
            background: 'transparent',
            color: 'var(--text-muted)',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-base)',
          }}
          aria-label="Collapse navigation"
        >
          <ChevronLeftIcon size={20} />
        </button>
      )}
      {user && (
        <div style={userStyle} onClick={onUserMenu} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onUserMenu?.(); } }}>
          <div style={avatarStyle}>{user.avatar || user.name.charAt(0).toUpperCase()}</div>
          {expanded && <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>}
        </div>
      )}
    </nav>
  );
};

export interface SidePanelProps {
  children: React.ReactNode;
  width?: number;
  onResize?: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  children,
  width = 270,
  onResize,
  minWidth = 200,
  maxWidth = 560,
}) => {
  const [currentWidth, setCurrentWidth] = React.useState(width);
  const [isResizing, setIsResizing] = React.useState(false);

  const panelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: `${currentWidth}px`,
    minWidth: `${minWidth}px`,
    maxWidth: `${maxWidth}px`,
    borderRight: '1px solid var(--border)',
    background: 'var(--surface)',
    overflow: 'hidden',
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = Math.min(Math.max(e.clientX, minWidth), maxWidth);
    setCurrentWidth(newWidth);
  };

  const handleMouseUp = () => {
    if (isResizing) {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      onResize?.(currentWidth);
    }
  };

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleDoubleClick = () => {
    setCurrentWidth(width);
    onResize?.(width);
  };

  return (
    <div style={panelStyle}>
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '6px',
          cursor: 'col-resize',
          background: 'transparent',
          zIndex: 10,
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        aria-label="Resize panel"
        role="separator"
        tabIndex={0}
      />
      <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
    </div>
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
              <XIcon size={12} />
            </button>
          )}
        </button>
      ))}
    </div>
  );
};