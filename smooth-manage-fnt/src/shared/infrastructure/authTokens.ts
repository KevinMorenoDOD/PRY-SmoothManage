export interface StoredAuthUser {
  id: number;
  email: string;
  displayName: string;
  emailVerified: boolean;
}

export interface StoredAuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  user: StoredAuthUser;
}

const TOKENS_KEY = 'smoothmanage:auth:tokens';
const LEGACY_SESSION_KEY = 'smoothmanage:auth:session';

export const getStoredAuth = (): StoredAuthTokens | null => {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    return raw ? (JSON.parse(raw) as StoredAuthTokens) : null;
  } catch {
    return null;
  }
};

export const setStoredAuth = (tokens: StoredAuthTokens): void => {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  localStorage.removeItem(LEGACY_SESSION_KEY);
};

export const clearStoredAuth = (): void => {
  localStorage.removeItem(TOKENS_KEY);
  localStorage.removeItem(LEGACY_SESSION_KEY);
};
