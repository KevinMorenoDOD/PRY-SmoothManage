import type { AuthRepository } from '../../application/port/out/AuthRepository';
import type { StorageAdapter } from '@shared/infrastructure/storage';
import type { AuthSession, Credentials, RegisterData } from '../../domain/model/User';
import { generateId, generateUuid } from '@shared/lib/utils';
import { InvalidCredentialsError, EmailAlreadyExistsError, WeakPasswordError } from '../../domain/exception/AuthErrors';

const SESSION_KEY = 'auth:session';
const USERS_KEY = 'auth:users';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export class AuthRepositoryLocalStorageAdapter implements AuthRepository {
  constructor(private readonly storage: StorageAdapter) {}

  async login(credentials: Credentials): Promise<AuthSession> {
    const users = this.getUsers();
    const user = users.find((u) => u.email === credentials.email);

    if (!user || !this.verifyPassword(credentials.password, user.passwordHash)) {
      throw new InvalidCredentialsError();
    }

    const session = this.createSession(user);
    await this.storage.set(SESSION_KEY, session);
    return session;
  }

  async register(data: RegisterData): Promise<AuthSession> {
    const users = this.getUsers();
    
    if (users.some((u) => u.email === data.email)) {
      throw new EmailAlreadyExistsError(data.email);
    }

    if (data.password.length < 8) {
      throw new WeakPasswordError('Password must be at least 8 characters');
    }

    const newUser: StoredUser = {
      id: generateUuid(),
      email: data.email,
      name: data.name,
      passwordHash: this.hashPassword(data.password),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);

    const session = this.createSession(newUser);
    await this.storage.set(SESSION_KEY, session);
    return session;
  }

  async logout(): Promise<void> {
    await this.storage.remove(SESSION_KEY);
  }

  async getSession(): Promise<AuthSession | null> {
    return this.storage.get<AuthSession>(SESSION_KEY) || null;
  }

  async saveSession(session: AuthSession): Promise<void> {
    await this.storage.set(SESSION_KEY, session);
  }

  async clearSession(): Promise<void> {
    await this.storage.remove(SESSION_KEY);
  }

  async refreshToken(refreshToken: string): Promise<AuthSession> {
    const session = await this.getSession();
    if (!session || session.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    const newSession: AuthSession = {
      ...session,
      accessToken: generateId('at_'),
      refreshToken: generateId('rt_'),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    await this.saveSession(newSession);
    return newSession;
  }

  private getUsers(): StoredUser[] {
    return this.storage.get<StoredUser[]>(USERS_KEY) || [];
  }

  private saveUsers(users: StoredUser[]): void {
    this.storage.set(USERS_KEY, users);
  }

  private createSession(user: StoredUser): AuthSession {
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
      accessToken: generateId('at_'),
      refreshToken: generateId('rt_'),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
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

  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }
}