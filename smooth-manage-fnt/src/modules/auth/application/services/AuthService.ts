import { LoginUseCase, RegisterUseCase, ForgotPasswordUseCase, ResetPasswordUseCase, RefreshTokenUseCase, LogoutUseCase, GetCurrentUserUseCase } from '../useCases';
import type { AuthRepository } from '../../domain/ports/AuthRepository';
import type { LoginCredentials, RegisterData, ForgotPasswordData, ResetPasswordData, AuthResponse, AuthTokens } from '../../domain/model/AuthUser';

export class AuthService {
  private readonly loginUseCase: LoginUseCase;
  private readonly registerUseCase: RegisterUseCase;
  private readonly forgotPasswordUseCase: ForgotPasswordUseCase;
  private readonly resetPasswordUseCase: ResetPasswordUseCase;
  private readonly refreshTokenUseCase: RefreshTokenUseCase;
  private readonly logoutUseCase: LogoutUseCase;
  private readonly getCurrentUserUseCase: GetCurrentUserUseCase;

  constructor(authRepository: AuthRepository) {
    this.loginUseCase = new LoginUseCase(authRepository);
    this.registerUseCase = new RegisterUseCase(authRepository);
    this.forgotPasswordUseCase = new ForgotPasswordUseCase(authRepository);
    this.resetPasswordUseCase = new ResetPasswordUseCase(authRepository);
    this.refreshTokenUseCase = new RefreshTokenUseCase(authRepository);
    this.logoutUseCase = new LogoutUseCase(authRepository);
    this.getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.loginUseCase.execute(credentials);
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.registerUseCase.execute(data);
  }

  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    return this.forgotPasswordUseCase.execute(data);
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    return this.resetPasswordUseCase.execute(data);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return this.refreshTokenUseCase.execute(refreshToken);
  }

  async logout(): Promise<void> {
    return this.logoutUseCase.execute();
  }

  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    return this.getCurrentUserUseCase.execute();
  }
}