import { API_BASE_URL } from '../config';
import { authFetch, toApiError, ApiError } from '../http';
import type { User } from '@/state/authStore';

// TODO: Once NSwag is generated, switch to AuthClient:
// import { AuthClient } from '@/api/generated/apiClient';
// import { createClient } from './_repoBase';
// const client = createClient(AuthClient);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * Authentication repository
 * 
 * Currently uses plain fetch so the app runs before NSwag generation.
 * Once the API client is generated, switch to the NSwag client.
 */
export const authRepo = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await authFetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      let error: ApiError;
      try {
        const body = await response.json();
        error = {
          status: response.status,
          message: body.message || 'Login failed',
          details: body.errors,
        };
      } catch {
        error = toApiError(response, 'Login failed');
      }
      throw error;
    }

    return response.json();
  },

  /**
   * Get current user profile
   */
  async me(): Promise<User> {
    const response = await authFetch(`${API_BASE_URL}/api/v1/auth/me`);

    if (!response.ok) {
      throw toApiError(response, 'Failed to fetch user profile');
    }

    return response.json();
  },

  /**
   * Logout (invalidate token on server if needed)
   */
  async logout(): Promise<void> {
    try {
      await authFetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
      });
    } catch {
      // Ignore errors - we'll clear local state regardless
    }
  },
};
