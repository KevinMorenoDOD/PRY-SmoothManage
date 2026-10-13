import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../../../shared/domain/ApiError';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const tokens = localStorage.getItem('smooth-manage-auth-tokens');
        if (tokens) {
          try {
            const { accessToken } = JSON.parse(tokens);
            if (accessToken) {
              config.headers.Authorization = `Bearer ${accessToken}`;
            }
          } catch {
            // Ignore token parsing errors
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const tokens = localStorage.getItem('smooth-manage-auth-tokens');
            if (tokens) {
              const { refreshToken } = JSON.parse(tokens);
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
              const { accessToken, refreshToken: newRefreshToken } = response.data;

              const storedTokens = JSON.parse(tokens);
              storedTokens.accessToken = accessToken;
              storedTokens.refreshToken = newRefreshToken;
              localStorage.setItem('smooth-manage-auth-tokens', JSON.stringify(storedTokens));

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch {
            localStorage.removeItem('smooth-manage-auth-tokens');
            localStorage.removeItem('smooth-manage-auth-user');
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient().getClient();