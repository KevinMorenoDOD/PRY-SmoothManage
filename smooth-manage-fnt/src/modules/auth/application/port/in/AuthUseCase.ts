import type { AuthSession, Credentials, RegisterData } from '../../../domain/model/User';
import type { AuthError } from '../../../domain/exception/AuthErrors';

export interface AuthUseCase {
  login(credentials: Credentials): Promise<AuthSession>;
  register(data: RegisterData): Promise<AuthSession>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<AuthSession | null>;
  refreshSession(): Promise<AuthSession>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}

export interface AuthUseCasePort {
  executeLogin(credentials: Credentials): Promise<AuthSession>;
  executeRegister(data: RegisterData): Promise<AuthSession>;
  executeLogout(): Promise<void>;
  executeGetSession(): Promise<AuthSession | null>;
  executeRefreshSession(): Promise<AuthSession>;
  executeRequestPasswordReset(email: string): Promise<void>;
  executeResetPassword(token: string, newPassword: string): Promise<void>;
}

export type AuthUseCaseError = AuthError;