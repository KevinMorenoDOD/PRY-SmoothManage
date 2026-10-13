import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "./tokenStorage";

const AUTH_ENDPOINTS = ["/v1/auth/login", "/v1/auth/register"];

export function attachToken(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = tokenStorage.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

export function handleAuthError(error: AxiosError): Promise<never> {
  const status = error.response?.status;
  const url = error.config?.url ?? "";
  const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) => url.startsWith(endpoint));

  if (status === 401 && !isAuthEndpoint) {
    tokenStorage.clearTokens();
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  return Promise.reject(error);
}