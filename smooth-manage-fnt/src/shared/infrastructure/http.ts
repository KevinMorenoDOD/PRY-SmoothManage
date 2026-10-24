export interface HttpClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

type RequestBody = BodyInit | null | Record<string, unknown> | Array<unknown> | object;

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string>;
  timeout?: number;
  body?: RequestBody;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export class HttpClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.defaultTimeout = config.timeout ?? 30000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  private async request<T>(method: string, path: string, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    const { params, timeout, headers, body, ...fetchOptions } = options;
    const url = this.buildUrl(path, params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout ?? this.defaultTimeout);

    try {
      let requestBody: BodyInit | null | undefined;
      if (body !== undefined) {
        requestBody = typeof body === 'string' ? body : JSON.stringify(body);
      }

      const response = await fetch(url, {
        ...fetchOptions,
        method,
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        throw new HttpError(response.status, data as string, response.headers);
      }

      return { data: data as T, status: response.status, headers: response.headers };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof HttpError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new HttpError(408, 'Request timeout', new Headers());
      }
      throw new HttpError(0, error instanceof Error ? error.message : 'Network error', new Headers());
    }
  }

  get<T>(path: string, options?: Omit<RequestOptions, 'body'>): Promise<HttpResponse<T>> {
    return this.request<T>('GET', path, options);
  }

  post<T>(path: string, body?: RequestBody, options?: Omit<RequestOptions, 'body'>): Promise<HttpResponse<T>> {
    return this.request<T>('POST', path, { ...options, body });
  }

  put<T>(path: string, body?: RequestBody, options?: Omit<RequestOptions, 'body'>): Promise<HttpResponse<T>> {
    return this.request<T>('PUT', path, { ...options, body });
  }

  patch<T>(path: string, body?: RequestBody, options?: Omit<RequestOptions, 'body'>): Promise<HttpResponse<T>> {
    return this.request<T>('PATCH', path, { ...options, body });
  }

  delete<T>(path: string, options?: Omit<RequestOptions, 'body'>): Promise<HttpResponse<T>> {
    return this.request<T>('DELETE', path, options);
  }
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly headers: Headers
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const createHttpClient = (config: HttpClientConfig): HttpClient => {
  return new HttpClient(config);
};