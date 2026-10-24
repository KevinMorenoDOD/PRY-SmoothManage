import type { AuthUseCasePort } from '../port/in/AuthUseCase';
import type { AuthRepository, PasswordResetGateway } from '../port/out/AuthRepository';
import type { AuthSession, Credentials, RegisterData } from '../../domain/model/User';
import {
  AuthError,
  InvalidCredentialsError,
  EmailAlreadyExistsError,
  WeakPasswordError,
  PasswordsDoNotMatchError,
  TermsNotAcceptedError,
  NetworkError,
  ValidationError,
} from '../../domain/exception/AuthErrors';

export class AuthService implements AuthUseCasePort {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordResetGateway: PasswordResetGateway
  ) {}

  async executeLogin(credentials: Credentials): Promise<AuthSession> {
    const email = credentials.email.trim();
    if (!email) {
      throw new ValidationError('Enter your email', 'email');
    }
    if (!this.isValidEmail(email)) {
      throw new ValidationError('Enter a valid email', 'email');
    }
    if (!credentials.password) {
      throw new ValidationError('Enter your password', 'password');
    }

    try {
      const session = await this.authRepository.login({ ...credentials, email });
      await this.authRepository.saveSession(session);
      return session;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      if (error instanceof Response && error.status === 401) {
        throw new InvalidCredentialsError();
      }
      throw new NetworkError();
    }
  }

  async executeRegister(data: RegisterData): Promise<AuthSession> {
    this.validateRegisterData(data);

    try {
      const session = await this.authRepository.register(data);
      await this.authRepository.saveSession(session);
      return session;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      if (error instanceof Response && error.status === 409) {
        throw new EmailAlreadyExistsError(data.email);
      }
      throw new NetworkError();
    }
  }

  async executeLogout(): Promise<void> {
    await this.authRepository.logout();
    await this.authRepository.clearSession();
  }

  async executeGetSession(): Promise<AuthSession | null> {
    return this.authRepository.getSession();
  }

  async executeRefreshSession(): Promise<AuthSession> {
    const session = await this.authRepository.getSession();
    if (!session) {
      throw new AuthError('No active session', 'NO_SESSION', 401);
    }

    try {
      const newSession = await this.authRepository.refreshToken(session.refreshToken);
      await this.authRepository.saveSession(newSession);
      return newSession;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      await this.authRepository.clearSession();
      throw new AuthError('Session expired', 'SESSION_EXPIRED', 401);
    }
  }

  async executeRequestPasswordReset(email: string): Promise<void> {
    if (!this.isValidEmail(email)) {
      throw new ValidationError('Enter a valid email', 'email');
    }

    try {
      await this.passwordResetGateway.requestReset(email);
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new NetworkError();
    }
  }

  async executeResetPassword(token: string, newPassword: string): Promise<void> {
    if (newPassword.length < 8) {
      throw new WeakPasswordError('Password must be at least 8 characters');
    }

    try {
      await this.passwordResetGateway.resetPassword(token, newPassword);
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new NetworkError();
    }
  }

  private validateRegisterData(data: RegisterData): void {
    if (data.name.trim().length < 2) {
      throw new ValidationError('Enter your name', 'name');
    }

    if (!this.isValidEmail(data.email)) {
      throw new ValidationError('Enter a valid email', 'email');
    }

    if (data.password.length < 8) {
      throw new WeakPasswordError('Password must be at least 8 characters');
    }

    if (data.password !== data.confirmPassword) {
      throw new PasswordsDoNotMatchError();
    }

    if (!data.acceptTerms) {
      throw new TermsNotAcceptedError();
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }
}

export const createAuthService = (
  authRepository: AuthRepository,
  passwordResetGateway: PasswordResetGateway
): AuthUseCasePort => {
  return new AuthService(authRepository, passwordResetGateway);
};