import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './app/AppRoutes';
import { AuthRepositoryHttpAdapter } from './modules/auth/infrastructure/api/AuthRepositoryHttpAdapter';
import { PasswordResetHttpAdapter } from './modules/auth/infrastructure/api/PasswordResetHttpAdapter';
import { AuthService } from './modules/auth/application/service/AuthService';
import { createAuthViewModel, type AuthViewModel } from './modules/auth/interfaces/view-model/useAuth';
import './shared/design-system/tokens/index.css';
import './index.css';

const authRepository = new AuthRepositoryHttpAdapter();
const passwordResetGateway = new PasswordResetHttpAdapter();
const authService = new AuthService(authRepository, passwordResetGateway);

const authViewModel: AuthViewModel = createAuthViewModel(authService);

window.__AUTH_USE_CASE__ = authService;
window.__AUTH_VIEW_MODEL__ = authViewModel;

authViewModel.checkSession();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>
);
