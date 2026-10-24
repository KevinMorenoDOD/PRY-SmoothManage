import type { AuthSession, Credentials, RegisterData } from '../../../domain/model/User';
import type { AuthError } from '../../../domain/exception/AuthErrors';

export interface AuthRepository {
  login(credentials: Credentials): Promise<AuthSession>;
  register(data: RegisterData): Promise<AuthSession>;
  logout(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  saveSession(session: AuthSession): Promise<void>;
  clearSession(): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthSession>;
}

export interface PasswordResetGateway {
  requestReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}

export type AuthRepositoryError = AuthError;
export type PasswordResetGatewayError = AuthError;