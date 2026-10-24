import type { AuthRepository } from '../../application/port/out/AuthRepository';
import type { AuthSession, Credentials, RegisterData } from '../../domain/model/User';
import { api, ApiError } from '@shared/infrastructure/api';
import {
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
  type StoredAuthTokens,
} from '@shared/infrastructure/authTokens';
import {
  AuthError,
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  NetworkError,
} from '../../domain/exception/AuthErrors';

const parseExpiry = (token: string): Date => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return new Date(Date.now() + 15 * 60 * 1000);
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as {
      exp?: number;
    };
    if (typeof json.exp === 'number') return new Date(json.exp * 1000);
  } catch {
    // fall through to a safe default
  }
  return new Date(Date.now() + 15 * 60 * 1000);
};

const toSession = (data: StoredAuthTokens): AuthSession => ({
  accessToken: data.accessToken,
  refreshToken: data.refreshToken,
  expiresAt: parseExpiry(data.accessToken),
  user: {
    id: String(data.user.id),
    email: data.user.email,
    name: data.user.displayName,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});

const toStored = (session: AuthSession, emailVerified = false): StoredAuthTokens => ({
  accessToken: session.accessToken,
  refreshToken: session.refreshToken,
  user: {
    id: Number(session.user.id),
    email: session.user.email,
    displayName: session.user.name,
    emailVerified,
  },
});

export class AuthRepositoryHttpAdapter implements AuthRepository {
  private mapError(error: unknown, context: 'login' | 'register', email = ''): never {
    if (error instanceof ApiError) {
      if (error.status === 401 && context === 'login') {
        throw new InvalidCredentialsError();
      }
      if (
        context === 'register' &&
        error.status === 400 &&
        /already registered/i.test(error.message)
      ) {
        throw new EmailAlreadyExistsError(email);
      }
      if (error.status === 0) {
        throw new NetworkError();
      }
      throw new AuthError(error.message, 'API_ERROR', error.status || 400);
    }
    throw new NetworkError();
  }

  async login(credentials: Credentials): Promise<AuthSession> {
    try {
      const data = await api.post<StoredAuthTokens>(
        '/auth/login',
        { email: credentials.email, password: credentials.password },
        false
      );
      setStoredAuth(data);
      return toSession(data);
    } catch (error) {
      this.mapError(error, 'login');
    }
  }

  async register(data: RegisterData): Promise<AuthSession> {
    try {
      const response = await api.post<StoredAuthTokens>(
        '/auth/register',
        {
          displayName: data.name,
          email: data.email,
          password: data.password,
        },
        false
      );
      setStoredAuth(response);
      return toSession(response);
    } catch (error) {
      this.mapError(error, 'register', data.email);
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      clearStoredAuth();
    }
  }

  async getSession(): Promise<AuthSession | null> {
    const stored = getStoredAuth();
    return stored ? toSession(stored) : null;
  }

  async saveSession(session: AuthSession): Promise<void> {
    const stored = getStoredAuth();
    if (stored && stored.accessToken === session.accessToken) {
      return;
    }
    setStoredAuth(toStored(session, stored?.user.emailVerified ?? false));
  }

  async clearSession(): Promise<void> {
    clearStoredAuth();
  }

  async refreshToken(refreshToken: string): Promise<AuthSession> {
    try {
      const data = await api.post<StoredAuthTokens>(
        '/auth/refresh',
        { refreshToken },
        false
      );
      setStoredAuth(data);
      return toSession(data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new AuthError(error.message, 'SESSION_EXPIRED', 401);
      }
      throw new NetworkError();
    }
  }
}
