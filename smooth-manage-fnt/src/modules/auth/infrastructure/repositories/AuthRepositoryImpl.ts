import type { AuthRepository } from '../../domain/ports/AuthRepository';
import type { LoginCredentials, RegisterData, ForgotPasswordData, ResetPasswordData, AuthResponse, AuthTokens } from '../../domain/model/AuthUser';
import { apiClient } from '../api/apiClient';

export class AuthRepositoryImpl implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    await apiClient.post('/auth/forgot-password', data);
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    await apiClient.post('/auth/reset-password', data);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>('/auth/refresh', { refreshToken });
    return response.data;
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    try {
      const response = await apiClient.get<AuthResponse['user']>('/auth/me');
      return response.data;
    } catch {
      return null;
    }
  }
}