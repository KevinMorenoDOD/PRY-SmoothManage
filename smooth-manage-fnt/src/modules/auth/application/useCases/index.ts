import type { AuthRepository } from '../../domain/ports/AuthRepository';
import type { LoginCredentials, RegisterData, ForgotPasswordData, ResetPasswordData, AuthResponse, AuthTokens } from '../../domain/model/AuthUser';

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.authRepository.login(credentials);
  }
}

export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(data: RegisterData): Promise<AuthResponse> {
    return this.authRepository.register(data);
  }
}

export class ForgotPasswordUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(data: ForgotPasswordData): Promise<void> {
    return this.authRepository.forgotPassword(data);
  }
}

export class ResetPasswordUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(data: ResetPasswordData): Promise<void> {
    return this.authRepository.resetPassword(data);
  }
}

export class RefreshTokenUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(refreshToken: string): Promise<AuthTokens> {
    return this.authRepository.refreshToken(refreshToken);
  }
}

export class LogoutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    return this.authRepository.logout();
  }
}

export class GetCurrentUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<AuthResponse['user'] | null> {
    return this.authRepository.getCurrentUser();
  }
}