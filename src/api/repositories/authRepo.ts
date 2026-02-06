import { 
  Client, 
  LoginRequestDto, 
  ChangePasswordDto,
  UserDto,
  UserRole 
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError, toUserMessage, ApiError } from './_errors';
import type { User } from '@/state/authStore';

// Create configured client instance
const client = createClient(Client);

/**
 * Map API UserDto to app User type
 */
function mapUser(dto: UserDto | undefined): User {
  if (!dto) {
    throw new Error('User data is missing');
  }
  return {
    id: dto.id ?? '',
    email: dto.email ?? '',
    name: dto.email ?? '',
    role: dto.role !== undefined ? UserRole[dto.role] : 'User',
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * Authentication repository using NSwag-generated client
 * All errors are normalized to ApiError for consistent UI handling
 */
export const authRepo = {
  /**
   * Login with email and password
   * @throws {ApiError} Normalized error with user-friendly message
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const request = new LoginRequestDto({
        email: credentials.email,
        password: credentials.password,
      });

      const response = await client.login(request);
      const data = response.data;

      if (!response.success || !data?.accessToken) {
        throw {
          status: 400,
          message: response.message || 'Login failed',
        } as ApiError;
      }

      return {
        token: data.accessToken,
        user: {
          id: '',
          email: credentials.email,
          name: credentials.email,
          role: data.role ?? 'User',
        },
      };
    } catch (error) {
      throw normalizeError(error);
    }
  },

  /**
   * Get current user profile
   * @throws {ApiError} Normalized error
   */
  async me(): Promise<User> {
    try {
      const response = await client.me();
      
      if (!response.success || !response.data) {
        throw {
          status: 400,
          message: response.message || 'Failed to fetch profile',
        } as ApiError;
      }
      
      return mapUser(response.data);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  /**
   * Change password
   * @throws {ApiError} Normalized error
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const request = new ChangePasswordDto({
        currentPassword,
        newPassword,
      });
      
      const response = await client.changePassword(request);
      
      if (!response.success) {
        throw {
          status: 400,
          message: response.message || 'Failed to change password',
        } as ApiError;
      }
    } catch (error) {
      throw normalizeError(error);
    }
  },

  /**
   * Logout (client-side only)
   */
  async logout(): Promise<void> {
    // No server-side logout needed
    // Local state clearing is handled by authStore
  },
};

// Re-export error utilities for consumers
export { toUserMessage, normalizeError, type ApiError } from './_errors';
