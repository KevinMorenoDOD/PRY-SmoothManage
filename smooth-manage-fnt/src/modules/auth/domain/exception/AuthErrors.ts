export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS', 401);
    this.name = 'InvalidCredentialsError';
  }
}

export class EmailAlreadyExistsError extends AuthError {
  constructor(email: string) {
    super(`An account with email ${email} already exists`, 'EMAIL_ALREADY_EXISTS', 409);
    this.name = 'EmailAlreadyExistsError';
  }
}

export class WeakPasswordError extends AuthError {
  constructor(message: string = 'Password is too weak') {
    super(message, 'WEAK_PASSWORD', 400);
    this.name = 'WeakPasswordError';
  }
}

export class PasswordsDoNotMatchError extends AuthError {
  constructor() {
    super('Passwords do not match', 'PASSWORDS_DO_NOT_MATCH', 400);
    this.name = 'PasswordsDoNotMatchError';
  }
}

export class TermsNotAcceptedError extends AuthError {
  constructor() {
    super('You must accept the terms and conditions', 'TERMS_NOT_ACCEPTED', 400);
    this.name = 'TermsNotAcceptedError';
  }
}

export class SessionExpiredError extends AuthError {
  constructor() {
    super('Your session has expired. Please sign in again.', 'SESSION_EXPIRED', 401);
    this.name = 'SessionExpiredError';
  }
}

export class EmailNotFoundError extends AuthError {
  constructor(email: string) {
    super(`No account found with email ${email}`, 'EMAIL_NOT_FOUND', 404);
    this.name = 'EmailNotFoundError';
  }
}

export class ResetTokenInvalidError extends AuthError {
  constructor() {
    super('The reset link is invalid or has expired', 'RESET_TOKEN_INVALID', 400);
    this.name = 'ResetTokenInvalidError';
  }
}

export class NetworkError extends AuthError {
  constructor(message: string = 'Network error. Please check your connection.') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AuthError {
  constructor(
    message: string,
    public readonly field: string
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}