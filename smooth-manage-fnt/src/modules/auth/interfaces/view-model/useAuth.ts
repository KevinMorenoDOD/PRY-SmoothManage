import { useEffect, useMemo, useState } from 'react';
import type { AuthUseCasePort } from '../../application/port/in/AuthUseCase';
import type { AuthSession, Credentials, RegisterData } from '../../domain/model/User';
import {
  AuthError,
  ValidationError,
  WeakPasswordError,
  PasswordsDoNotMatchError,
  TermsNotAcceptedError,
} from '../../domain/exception/AuthErrors';

export interface AuthViewModel {
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  login: (credentials: Credentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  clearFieldError: (field: string) => void;
  checkSession: () => Promise<void>;
  subscribe: (cb: () => void) => () => void;
}

export const createAuthViewModel = (authUseCase: AuthUseCasePort): AuthViewModel => {
  let session: AuthSession | null = null;
  let loading = false;
  let error: string | null = null;
  let fieldErrors: Record<string, string> = {};
  const subscribers = new Set<() => void>();

  const notify = () => subscribers.forEach((cb) => cb());

  const setLoading = (value: boolean) => {
    loading = value;
    notify();
  };

  const setError = (value: string | null) => {
    error = value;
    notify();
  };

  const setFieldErrors = (errors: Record<string, string>) => {
    fieldErrors = errors;
    notify();
  };

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      delete fieldErrors[field];
      notify();
    }
  };

  const handleError = (err: unknown): string => {
    if (err instanceof ValidationError) {
      setFieldErrors({ [err.field]: err.message });
      return err.message;
    }
    if (err instanceof WeakPasswordError || err instanceof PasswordsDoNotMatchError || err instanceof TermsNotAcceptedError) {
      setFieldErrors({ form: err.message });
      return err.message;
    }
    if (err instanceof AuthError) {
      return err.message;
    }
    return 'An unexpected error occurred';
  };

  const login = async (credentials: Credentials): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      session = await authUseCase.executeLogin(credentials);
      notify();
      return true;
    } catch (err) {
      setError(handleError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      session = await authUseCase.executeRegister(data);
      notify();
      return true;
    } catch (err) {
      setError(handleError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authUseCase.executeLogout();
      session = null;
      notify();
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      await authUseCase.executeRequestPasswordReset(email);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      await authUseCase.executeResetPassword(token, newPassword);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async (): Promise<void> => {
    setLoading(true);
    try {
      session = await authUseCase.executeGetSession();
      notify();
    } catch {
      session = null;
      notify();
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
    setFieldErrors({});
  };

  const subscribe = (cb: () => void) => {
    subscribers.add(cb);
    return () => subscribers.delete(cb);
  };

  return {
    get session() { return session; },
    get loading() { return loading; },
    get error() { return error; },
    get fieldErrors() { return fieldErrors; },
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    clearError,
    clearFieldError,
    checkSession,
    subscribe,
  };
};

export const useAuthViewModel = (authUseCase: AuthUseCasePort) => {
  const [, forceUpdate] = useState(0);
  const viewModel = useMemo(() => createAuthViewModel(authUseCase), [authUseCase]);

  useEffect(() => {
    return viewModel.subscribe(() => forceUpdate((n) => n + 1));
  }, [viewModel]);

  return {
    session: viewModel.session,
    loading: viewModel.loading,
    error: viewModel.error,
    fieldErrors: viewModel.fieldErrors,
    login: viewModel.login,
    register: viewModel.register,
    logout: viewModel.logout,
    requestPasswordReset: viewModel.requestPasswordReset,
    resetPassword: viewModel.resetPassword,
    clearError: viewModel.clearError,
    clearFieldError: viewModel.clearFieldError,
    checkSession: viewModel.checkSession,
  };
};