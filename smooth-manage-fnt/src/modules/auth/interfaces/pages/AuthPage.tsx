import React from 'react';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { ForgotPage } from './ForgotPage';

export type AuthView = 'login' | 'register' | 'forgot';

interface AuthPageProps {
  view?: AuthView;
  onViewChange?: (view: AuthView) => void;
  onAuthSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  view = 'login',
  onViewChange,
  onAuthSuccess,
}) => {
  const show = (next: AuthView) => {
    onViewChange?.(next);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,1fr)',
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
      }}
    >
      {/* Left panel - brand image */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '44px 56px',
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(900px 520px at 8% 0,#3baba538,transparent 60%),radial-gradient(700px 520px at 100% 100%,#3baba52a,transparent 60%),#0f1414',
        }}
      >
        <img
          src="/smoothmanage-login-left-panel.svg"
          alt="SmoothManage brand panel"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      {/* Right panel - auth forms */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '410px' }}>
          <div id="views">
            {view === 'login' && (
              <LoginPage
                onSuccess={onAuthSuccess}
                onSwitchToRegister={() => show('register')}
                onSwitchToForgot={() => show('forgot')}
              />
            )}
            {view === 'register' && (
              <RegisterPage
                onSuccess={onAuthSuccess}
                onSwitchToLogin={() => show('login')}
              />
            )}
            {view === 'forgot' && (
              <ForgotPage onSwitchToLogin={() => show('login')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
