import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './modules/auth';
import { AuthRepositoryImpl } from './modules/auth/infrastructure/repositories/AuthRepositoryImpl';
import { LoginPage } from './modules/auth/interfaces/pages/LoginPage';
import { RegisterPage } from './modules/auth/interfaces/pages/RegisterPage';
import { ForgotPasswordPage } from './modules/auth/interfaces/pages/ForgotPasswordPage';

const authRepository = new AuthRepositoryImpl();

function AuthenticatedLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-layout" role="status" aria-label="Loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function PublicLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-layout" role="status" aria-label="Loading">
        <div className="spinner" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/notes" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <AuthProvider authRepository={authRepository}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/notes" replace />} />
        <Route path="*" element={<Navigate to="/notes" replace />} />
      </Routes>
    </AuthProvider>
  );
}

function NotesPage() {
  return (
    <div className="page-container">
      <h1>Notes</h1>
      <p>Notes page - Coming soon</p>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="page-container">
      <h1>Dashboard</h1>
      <p>Dashboard page - Coming soon</p>
    </div>
  );
}

export default App;