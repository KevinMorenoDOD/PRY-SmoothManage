import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { AuthService } from '../../application/services/AuthService';
import type { AuthRepository } from '../../domain/ports/AuthRepository';
import type { AuthUser, AuthTokens, LoginCredentials, RegisterData, ForgotPasswordData, ResetPasswordData } from '../../domain/model/AuthUser';

interface AuthContextValue {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_STORAGE_KEY = 'smooth-manage-auth-tokens';
const USER_STORAGE_KEY = 'smooth-manage-auth-user';

export function AuthProvider({ children, authRepository }: { children: ReactNode; authRepository: AuthRepository }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authService = useMemo(() => new AuthService(authRepository), [authRepository]);

  const loadStoredAuth = useCallback(async () => {
    try {
      const storedTokens = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (storedTokens && storedUser) {
        const parsedTokens = JSON.parse(storedTokens) as AuthTokens;
        const parsedUser = JSON.parse(storedUser) as AuthUser;
        setTokens(parsedTokens);
        setUser(parsedUser);
      }
    } catch {
      // Ignore storage errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  const storeAuth = useCallback((authUser: AuthUser, authTokens: AuthTokens) => {
    setUser(authUser);
    setTokens(authTokens);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(authTokens));
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    storeAuth(response.user, response.tokens);
  }, [authService, storeAuth]);

  const register = useCallback(async (data: RegisterData) => {
    const response = await authService.register(data);
    storeAuth(response.user, response.tokens);
  }, [authService, storeAuth]);

  const forgotPassword = useCallback(async (data: ForgotPasswordData) => {
    await authService.forgotPassword(data);
  }, [authService]);

  const resetPassword = useCallback(async (data: ResetPasswordData) => {
    await authService.resetPassword(data);
  }, [authService]);

  const logout = useCallback(async () => {
    await authService.logout();
    clearAuth();
  }, [authService, clearAuth]);

  const refreshAuth = useCallback(async () => {
    if (!tokens?.refreshToken) return;
    try {
      const newTokens = await authService.refreshToken(tokens.refreshToken);
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        storeAuth(currentUser, newTokens);
      }
    } catch {
      clearAuth();
    }
  }, [tokens?.refreshToken, authService, storeAuth, clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isLoading,
        isAuthenticated: !!user && !!tokens,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}