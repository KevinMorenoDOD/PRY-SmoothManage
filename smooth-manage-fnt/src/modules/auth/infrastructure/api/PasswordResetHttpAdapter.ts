import type { PasswordResetGateway } from '../../application/port/out/AuthRepository';
import { api, ApiError } from '@shared/infrastructure/api';
import { AuthError, NetworkError } from '../../domain/exception/AuthErrors';

export class PasswordResetHttpAdapter implements PasswordResetGateway {
  async requestReset(email: string): Promise<void> {
    try {
      await api.post('/auth/forgot-password', { email }, false);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new AuthError(error.message, 'API_ERROR', error.status || 400);
      }
      throw new NetworkError();
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/reset-password', { token, newPassword }, false);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new AuthError(error.message, 'API_ERROR', error.status || 400);
      }
      throw new NetworkError();
    }
  }
}
