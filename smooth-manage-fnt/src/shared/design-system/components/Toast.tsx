import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import '../../design-system/tokens/index.css';

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

export interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
  onClose: (id: string) => void;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

const variantStyles: Record<ToastVariant, React.CSSProperties> = {
  info: { borderLeft: '4px solid var(--accent)' },
  success: { borderLeft: '4px solid var(--accent)' },
  warning: { borderLeft: '4px solid var(--warning)' },
  danger: { borderLeft: '4px solid var(--danger)' },
};

const ToastItem: React.FC<ToastProps> = ({
  id,
  message,
  variant = 'info',
  actionLabel,
  onAction,
  onClose,
  duration = 8000,
}) => {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        setVisible(false);
        onClose(id);
      }, 200);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  if (!visible) return null;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-4)',
    padding: 'var(--space-4) var(--space-5)',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-container)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    minWidth: '300px',
    maxWidth: '480px',
    animation: exiting ? 'slideOut 0.2s ease-in forwards' : 'slideIn 0.3s ease-out',
    ...variantStyles[variant],
  };

  const messageStyle: React.CSSProperties = {
    flex: 1,
    fontSize: 'var(--font-size-base)',
    lineHeight: 'var(--line-height-normal)',
    color: 'var(--text)',
  };

  const actionButtonStyle: React.CSSProperties = {
    flexShrink: 0,
    padding: 'var(--space-1) var(--space-4)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-semibold)',
    fontFamily: 'var(--font-family)',
    color: 'var(--accent)',
    background: 'var(--accent-soft)',
    border: '1px solid var(--accent)',
    borderRadius: 'var(--radius-pill)',
    cursor: 'pointer',
    transition: 'background-color var(--transition-fast)',
  };

  const closeButtonStyle: React.CSSProperties = {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    border: 0,
    background: 'transparent',
    color: 'var(--text-muted)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
    transition: 'color var(--transition-fast), background-color var(--transition-fast)',
  };

  return (
    <div style={containerStyle} role="alert" aria-live="polite">
      <div style={messageStyle}>{message}</div>
      {actionLabel && onAction && (
        <button type="button" style={actionButtonStyle} onClick={onAction}>
          {actionLabel}
        </button>
      )}
      <button
        type="button"
        style={closeButtonStyle}
        onClick={() => { setExiting(true); setTimeout(() => onClose(id), 200); }}
        aria-label="Dismiss"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(100%); }
        }
        button:hover { background: var(--surface-2); }
      `}</style>
    </div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 'var(--space-6)',
    right: 'var(--space-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
    zIndex: 9999,
    pointerEvents: 'none',
  };

  if (toasts.length === 0) return null;

  return createPortal(
    <div style={containerStyle} aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>,
    document.body
  );
};

let toastId = 0;
const toasts: ToastProps[] = [];
let listeners: Array<(toasts: ToastProps[]) => void> = [];

const notify = () => listeners.forEach((l) => l([...toasts]));

export const useToasts = () => {
  const [, forceUpdate] = React.useState({});

  React.useEffect(() => {
    listeners.push(forceUpdate);
    return () => { listeners = listeners.filter((l) => l !== forceUpdate); };
  }, []);

  const show = (toast: Omit<ToastProps, 'id'>) => {
    const id = `toast-${++toastId}`;
    toasts.push({ ...toast, id, onClose: toast.onClose ?? (() => {}) });
    notify();
    return id;
  };

  const dismiss = (id: string) => {
    const index = toasts.findIndex((t) => t.id === id);
    if (index >= 0) {
      toasts.splice(index, 1);
      notify();
    }
  };

  const info = (message: string, options?: Partial<ToastProps>) => show({ ...options, message, variant: 'info', onClose: options?.onClose ?? (() => {}) });
  const success = (message: string, options?: Partial<ToastProps>) => show({ ...options, message, variant: 'success', onClose: options?.onClose ?? (() => {}) });
  const warning = (message: string, options?: Partial<ToastProps>) => show({ ...options, message, variant: 'warning', onClose: options?.onClose ?? (() => {}) });
  const danger = (message: string, options?: Partial<ToastProps>) => show({ ...options, message, variant: 'danger', onClose: options?.onClose ?? (() => {}) });

  return { toasts, show, dismiss, info, success, warning, danger };
};

export type { ToastContainerProps };