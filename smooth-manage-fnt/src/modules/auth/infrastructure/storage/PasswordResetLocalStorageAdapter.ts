import type { PasswordResetGateway } from '../../application/port/out/AuthRepository';
import type { StorageAdapter } from '@shared/infrastructure/storage';
import { generateId } from '@shared/lib/utils';

const RESET_TOKENS_KEY = 'auth:reset-tokens';

interface ResetToken {
  token: string;
  email: string;
  expiresAt: string;
  used: boolean;
}

export class PasswordResetLocalStorageAdapter implements PasswordResetGateway {
  constructor(private readonly storage: StorageAdapter) {}

  async requestReset(email: string): Promise<void> {
    const tokens = this.getTokens();
    const token = generateId('reset_');
    
    tokens.push({
      token,
      email,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      used: false,
    });

    this.saveTokens(tokens);
    
    // In a real app, send email with reset link
    console.log(`Password reset link for ${email}: ${window.location.origin}/auth/reset?token=${token}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokens = this.getTokens();
    const tokenData = tokens.find((t) => t.token === token && !t.used);

    if (!tokenData) {
      throw new Error('Invalid or expired reset token');
    }

    if (new Date(tokenData.expiresAt) < new Date()) {
      throw new Error('Reset token has expired');
    }

    // Mark token as used
    tokenData.used = true;
    this.saveTokens(tokens);

    // Update user password
    const users = this.storage.get<{ id: string; email: string; passwordHash: string }[]>('auth:users') || [];
    const userIndex = users.findIndex((u) => u.email === tokenData.email);
    
    if (userIndex >= 0) {
      users[userIndex].passwordHash = this.hashPassword(newPassword);
      this.storage.set('auth:users', users);
    }
  }

  private getTokens(): ResetToken[] {
    const tokens = this.storage.get<ResetToken[]>(RESET_TOKENS_KEY) || [];
    return tokens.filter((t) => new Date(t.expiresAt) > new Date());
  }

  private saveTokens(tokens: ResetToken[]): void {
    this.storage.set(RESET_TOKENS_KEY, tokens);
  }

  private hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `hash_${Math.abs(hash).toString(36)}_${generateId()}`;
  }
}