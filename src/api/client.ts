/**
 * Standard Frontend API Client
 * KHB Biz Trip System - Decoupled Client Layer
 */

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { timeoutMs = 15000, params, ...customConfig } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((customConfig.headers as Record<string, string>) || {})
    };

    // Inject active user credentials if available in localStorage
    try {
      const savedUser = localStorage.getItem('tripdesk_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.email) headers['x-user-email'] = parsed.email;
        if (parsed?.role) headers['x-user-role'] = parsed.role;
      }
    } catch {}

    const config: RequestInit = {
      ...customConfig,
      headers,
      signal: controller.signal
    };

    const targetUrl = this.buildUrl(endpoint, params);

    try {
      const response = await fetch(targetUrl, config);
      clearTimeout(timeoutId);

      // Try to parse JSON response
      let payload: any;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        payload = await response.json();
      } else {
        payload = await response.text();
      }

      if (!response.ok) {
        const errorMsg = payload?.error || payload?.message || `HTTP ${response.status}: Request failed`;
        throw new ApiError(errorMsg, response.status, payload);
      }

      // Return unwrapped data if wrapped in standard ApiResponse envelope
      if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
        return payload.data as T;
      }

      return payload as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new ApiError(`Request timed out after ${timeoutMs}ms`, 408);
      }
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(err?.message || 'Network request failed', 0);
    }
  }

  get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  patch<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  delete<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
