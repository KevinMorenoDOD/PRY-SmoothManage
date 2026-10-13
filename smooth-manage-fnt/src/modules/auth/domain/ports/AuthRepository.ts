import type { AuthUser, AuthTokens, LoginCredentials, RegisterData, ForgotPasswordData, ResetPasswordData, AuthResponse } from '../model/AuthUser';

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(data: RegisterData): Promise<AuthResponse>;
  forgotPassword(data: ForgotPasswordData): Promise<void>;
  resetPassword(data: ResetPasswordData): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
}