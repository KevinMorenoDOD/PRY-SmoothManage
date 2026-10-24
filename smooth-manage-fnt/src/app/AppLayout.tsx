import { useState } from 'react';
import type { ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import './AppLayout.css';

const paths: Record<string, ReactNode> = {
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  proj: (
    <>
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
      <path d="M8 10v4" />
      <path d="M12 10v2" />
      <path d="M16 10v6" />
    </>
  ),
  note: (
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </>
  ),
  task: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
};

const Icon = ({ name, size = 18 }: { name: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flex: 'none' }}
  >
    {paths[name]}
  </svg>
);

export const AppLayout = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const logout = async () => {
    await window.__AUTH_USE_CASE__.executeLogout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <nav className={`app-nav${open ? ' open' : ''}`}>
        <button type="button" onClick={() => setOpen((value) => !value)}>
          <Icon name="menu" />
          <span>Menu</span>
        </button>
        <button type="button" disabled title="Projects coming soon">
          <Icon name="proj" />
          <span>Projects</span>
        </button>
        <button
          type="button"
          className={pathname.startsWith('/notes') ? 'on' : ''}
          onClick={() => navigate('/notes')}
        >
          <Icon name="note" />
          <span>Notes</span>
        </button>
        <button
          type="button"
          className={pathname.startsWith('/tasks') ? 'on' : ''}
          onClick={() => navigate('/tasks')}
        >
          <Icon name="task" />
          <span>Tasks</span>
        </button>
        <div className="sp" />
        <button
          type="button"
          className="av"
          title="Cerrar sesión"
          onClick={() => void logout()}
        >
          TÚ
        </button>
      </nav>

      <div className="app-content">
        <Outlet />
      </div>
    </div>
  );
};
