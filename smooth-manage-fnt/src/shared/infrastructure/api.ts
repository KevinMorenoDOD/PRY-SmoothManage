import {
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
  type StoredAuthTokens,
} from './authTokens';

const rawBase = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
const baseUrl = rawBase.startsWith('http')
  ? rawBase.replace(/\/+$/, '')
  : `${window.location.origin}${rawBase.startsWith('/') ? '' : '/'}${rawBase}`.replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type AuthResponse = StoredAuthTokens;

let refreshPromise: Promise<string | null> | null = null;

const parseError = async (response: Response): Promise<ApiError> => {
  let message = response.statusText || 'Request failed';
  let details: string | undefined;
  try {
    const data: unknown = await response.json();
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if (typeof record.message === 'string') message = record.message;
      if (typeof record.details === 'string') details = record.details;
    }
  } catch {
    // keep default message
  }
  return new ApiError(response.status, message, details);
};

const refreshAccessToken = async (): Promise<string | null> => {
  const stored = getStoredAuth();
  if (!stored?.refreshToken) return null;

  const response = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: stored.refreshToken }),
  });

  if (!response.ok) {
    clearStoredAuth();
    return null;
  }

  const data = (await response.json()) as AuthResponse;
  setStoredAuth(data);
  return data.accessToken;
};

export const AUTH_EXPIRED_EVENT = 'smoothmanage:auth-expired';

const notifyAuthExpired = () => {
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
};

export interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
}

export const apiRequest = async <T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  const { method = 'GET', body, auth = true, headers = {} } = options;
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const doFetch = (token: string | null) => {
    const requestHeaders: Record<string, string> = { ...headers };
    if (body !== undefined) requestHeaders['Content-Type'] = 'application/json';
    if (auth && token) requestHeaders.Authorization = `Bearer ${token}`;

    return fetch(url, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let response = await doFetch(auth ? (getStoredAuth()?.accessToken ?? null) : null);

  if (response.status === 401 && auth) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const token = await refreshPromise;

    if (token) {
      response = await doFetch(token);
    } else {
      notifyAuthExpired();
      throw new ApiError(401, 'Session expired');
    }

    if (response.status === 401) {
      clearStoredAuth();
      notifyAuthExpired();
      throw new ApiError(401, 'Session expired');
    }
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
};

export const api = {
  get: <T>(path: string, auth = true) => apiRequest<T>(path, { auth }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    apiRequest<T>(path, { method: 'POST', body, auth }),
  put: <T>(path: string, body?: unknown, auth = true) =>
    apiRequest<T>(path, { method: 'PUT', body, auth }),
  patch: <T>(path: string, body?: unknown, auth = true) =>
    apiRequest<T>(path, { method: 'PATCH', body, auth }),
  delete: <T>(path: string, auth = true) =>
    apiRequest<T>(path, { method: 'DELETE', auth }),
};
