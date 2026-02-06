import { API_BASE_URL } from './config';
import { authFetch, toApiError, ApiError } from './http';

/**
 * Returns the base URL for API calls
 */
export function getBaseUrl(): string {
  return API_BASE_URL;
}

/**
 * Returns a fetch implementation that:
 * 1. Uses authFetch for token injection
 * 2. Throws ApiError for non-OK responses
 * 
 * This is designed to work with NSwag-generated clients
 */
export function getFetch(): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const response = await authFetch(input, init);

    if (!response.ok) {
      let errorData: ApiError;
      
      try {
        const body = await response.json();
        errorData = {
          status: response.status,
          message: body.message || body.title || response.statusText,
          details: body.errors || body.details,
        };
      } catch {
        errorData = toApiError(response);
      }

      throw errorData;
    }

    return response;
  };
}

/**
 * HTTP methods helper for simple requests
 */
export const http = {
  async get<T>(url: string): Promise<T> {
    const response = await getFetch()(`${API_BASE_URL}${url}`);
    return response.json();
  },

  async post<T>(url: string, body?: unknown): Promise<T> {
    const response = await getFetch()(`${API_BASE_URL}${url}`, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
    return response.json();
  },

  async put<T>(url: string, body?: unknown): Promise<T> {
    const response = await getFetch()(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
    return response.json();
  },

  async delete<T>(url: string): Promise<T> {
    const response = await getFetch()(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
