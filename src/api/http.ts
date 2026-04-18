import { useAuthStore } from '@/state/authStore';
import { useI18nStore } from '@/state/i18nStore';
import { authRepo } from './repositories/authRepo';
import { API_BASE_URL } from './config';
import { normalizeApiLanguage } from './language';

// Standard API Error structure
export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

/**
 * Normalize any error into ApiError format
 */
export function toApiError(error: unknown, defaultMessage = 'An error occurred'): ApiError {
  if (error instanceof Response) {
    return {
      status: error.status,
      message: error.statusText || defaultMessage,
    };
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    return {
      status: (err.status as number) ?? 500,
      message: (err.message as string) ?? defaultMessage,
      details: err.details,
    };
  }

  return {
    status: 500,
    message: defaultMessage,
  };
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Fetch wrapper that automatically injects Authorization header
 * and handles 401 token refresh
 */
export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const authStore = useAuthStore.getState();
  const i18nStore = useI18nStore.getState();
  const token = authStore.accessToken;
  const language = normalizeApiLanguage(i18nStore.language);

  const headers = new Headers(init?.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  headers.set('Accept-Language', language);

  if (!headers.has('Content-Type') && init?.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    // Avoid infinite loop if refresh token call fails or if it's already a login/refresh request
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const isAuthUrl = url.includes('/api/v1/auth/refresh') || url.includes('/api/v1/auth/login');

    // Also check if it's an absolute URL that contains these paths
    const isAbsoluteAuthUrl = url.startsWith(API_BASE_URL) && (url.includes('/api/v1/auth/refresh') || url.includes('/api/v1/auth/login'));

    if (isAuthUrl || isAbsoluteAuthUrl) {
      return response;
    }

    const refreshToken = authStore.refreshToken;
    if (!refreshToken) {
      authStore.logout();
      return response;
    }

    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = (async () => {
          try {
            const result = await authRepo.refresh(refreshToken);
            authStore.setAuth(result.accessToken, result.refreshToken, authStore.user!);
            return true;
          } catch (error) {
            authStore.logout();
            return false;
          } finally {
            isRefreshing = false;
            refreshPromise = null;
          }
        })();
      }

      const success = await refreshPromise;
      if (success) {
        // Retry original request with new token
        const authStoreAfterRefresh = useAuthStore.getState();
        const newToken = authStoreAfterRefresh.accessToken;
        const retryHeaders = new Headers(init?.headers);
        if (newToken) {
          retryHeaders.set('Authorization', `Bearer ${newToken}`);
        }
        retryHeaders.set('Accept-Language', language);
        if (!retryHeaders.has('Content-Type') && init?.body && !(init.body instanceof FormData)) {
          retryHeaders.set('Content-Type', 'application/json');
        }
        return fetch(input, {
          ...init,
          headers: retryHeaders,
        });
      }
    } catch (e) {
      authStore.logout();
    }
  }

  return response;
}
