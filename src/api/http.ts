import { useAuthStore } from '@/state/authStore';

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

/**
 * Fetch wrapper that automatically injects Authorization header
 */
export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const token = useAuthStore.getState().accessToken;

  const headers = new Headers(init?.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
