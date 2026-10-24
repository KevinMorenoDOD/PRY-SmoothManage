import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { NotesPage } from '../modules/notes';
import { TasksPage } from '../modules/tasks';
import { AuthPage, type AuthView } from '../modules/auth';
import { AppLayout } from './AppLayout';
import { AUTH_EXPIRED_EVENT } from '../shared/infrastructure/api';
import { getStoredAuth } from '../shared/infrastructure/authTokens';

const AuthRoute = ({ view }: { view: AuthView }) => {
  const navigate = useNavigate();
  return (
    <AuthPage
      view={view}
      onViewChange={(next) => navigate(`/${next}`)}
      onAuthSuccess={() => navigate('/notes', { replace: true })}
    />
  );
};

const RootRedirect = () => {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    window.__AUTH_USE_CASE__
      .executeGetSession()
      .then((session) => setTarget(session ? '/notes' : '/login'))
      .catch(() => setTarget('/login'));
  }, []);

  if (!target) return null;
  return <Navigate to={target} replace />;
};

const RequireAuth = ({ children }: { children: ReactNode }) =>
  getStoredAuth() ? <>{children}</> : <Navigate to="/login" replace />;

export const AppRoutes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const onExpired = () => navigate('/login', { replace: true });
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<AuthRoute view="login" />} />
      <Route path="/register" element={<AuthRoute view="register" />} />
      <Route path="/forgot" element={<AuthRoute view="forgot" />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/tasks" element={<TasksPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
