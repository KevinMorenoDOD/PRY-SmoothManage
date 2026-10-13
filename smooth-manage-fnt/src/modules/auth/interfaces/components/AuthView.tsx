import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

type AuthView = 'login' | 'register' | 'forgot';

interface AuthViewProps {
  initialView?: AuthView;
}

export function AuthView({ initialView = 'login' }: AuthViewProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState<AuthView>(initialView);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/register') setCurrentView('register');
    else if (path === '/forgot-password') setCurrentView('forgot');
    else setCurrentView('login');
  }, [location.pathname]);

  const switchView = useCallback((view: AuthView) => {
    setCurrentView(view);
    const paths: Record<AuthView, string> = {
      login: '/login',
      register: '/register',
      forgot: '/forgot-password',
    };
    navigate(paths[view], { replace: true });
  }, [navigate]);

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <LoginForm onSwitchView={switchView} />;
      case 'register':
        return <RegisterForm onSwitchView={switchView} />;
      case 'forgot':
        return <ForgotPasswordForm onSwitchView={switchView} />;
    }
  };

  return <div id="views">{renderView()}</div>;
}