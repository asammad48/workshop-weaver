import { 
  Client, 
  CreateUserDto, 
  ResetPasswordDto, 
  UpdateRoleDto,
  UserDto,
  UserDtoApiResponse,
  UserDtoPageResponseApiResponse,
  StringApiResponse
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError, ApiError } from './_errors';

const client = createClient(Client);

export const userRepo = {
  async list(pageNumber?: number, pageSize?: number, search?: string, sortBy?: string, sortDirection?: string): Promise<UserDtoPageResponseApiResponse> {
    try {
      return await client.usersGET(pageNumber, pageSize, search, sortBy, sortDirection);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async get(id: string): Promise<UserDtoApiResponse> {
    try {
      return await client.usersGET2(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async create(body: CreateUserDto): Promise<UserDtoApiResponse> {
    try {
      return await client.usersPOST(body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async disable(id: string): Promise<StringApiResponse> {
    try {
      return await client.disable(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async enable(id: string): Promise<StringApiResponse> {
    try {
      return await client.enable(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async setPassword(id: string, body: ResetPasswordDto): Promise<StringApiResponse> {
    try {
      return await client.setPassword(id, body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async updateRole(id: string, body: UpdateRoleDto): Promise<StringApiResponse> {
    try {
      return await client.roles(id, body);
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
