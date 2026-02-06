import { 
  Client, 
  LoginRequestDto, 
  ChangePasswordDto,
  UserDto,
  UserRole 
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
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
    name: dto.email ?? '', // API doesn't have name, use email
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
 */
export const authRepo = {
  /**
   * Login with email and password
   * Note: Login API only returns token+role, so we fetch user profile after
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const request = new LoginRequestDto({
      email: credentials.email,
      password: credentials.password,
    });

    const response = await client.login(request);
    const data = response.data;

    if (!data?.accessToken) {
      throw new Error(response.message || 'Login failed');
    }

    // Return token with minimal user info from login response
    // Full user profile can be fetched via me() if needed
    return {
      token: data.accessToken,
      user: {
        id: '',
        email: credentials.email,
        name: credentials.email,
        role: data.role ?? 'User',
      },
    };
  },

  /**
   * Get current user profile
   */
  async me(): Promise<User> {
    const response = await client.me();
    return mapUser(response.data);
  },

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const request = new ChangePasswordDto({
      currentPassword,
      newPassword,
    });
    await client.changePassword(request);
  },

  /**
   * Logout (client-side only - clear local state)
   */
  async logout(): Promise<void> {
    // No server-side logout endpoint needed
    // Local state clearing is handled by authStore
  },
};
