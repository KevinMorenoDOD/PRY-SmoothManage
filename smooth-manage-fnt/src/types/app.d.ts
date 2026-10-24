import type { AuthService } from '../modules/auth/application/service/AuthService';
import type { AuthViewModel } from '../modules/auth/interfaces/view-model/useAuth';

declare global {
  interface Window {
    __AUTH_USE_CASE__: AuthService;
    __AUTH_VIEW_MODEL__: AuthViewModel;
  }
}

export {};
